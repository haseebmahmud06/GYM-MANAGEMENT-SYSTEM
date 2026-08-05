"""
REST API views for the analytics/dashboard app.
Provides JSON endpoints for dashboard statistics, chart data,
and real-data report exports (CSV) with optional date filtering.

Design:
- Dashboard & chart endpoints return aggregated JSON for the React frontend.
- Report endpoints stream CSV exports filtered by start_date/end_date.
- R integration external script can be triggered via the reports/r endpoint.
"""
import csv
import glob
import os
import shutil
from io import StringIO

from django.http import HttpResponse
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from payments.models import Payment
from attendance.models import Attendance
from bookings.models import Booking
from trainers.models import Trainer
from equipment.models import Equipment
from workouts.models import Workout, BodyMeasurement


def _get_period_start(period):
    """
    Calculate the start date based on period (30d, 90d, 12m, or all).

    Args:
        period: String key indicating the time window.

    Returns:
        date object representing the start of the window.
    """
    today = timezone.now().date()
    if period == '30d':
        return today - timedelta(days=30)
    elif period == '90d':
        return today - timedelta(days=90)
    elif period == '12m':
        return today - timedelta(days=365)
    return today - timedelta(days=365)


# ---------------------------------------------------------------------------
# Dashboard & Chart Endpoints
# ---------------------------------------------------------------------------
class DashboardStatsAPIView(APIView):
    """
    API endpoint for dashboard statistics.

    Aggregates member, attendance, revenue, booking, trainer, and equipment
    counts used by the admin dashboard summary cards.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Return a flat JSON object of all dashboard counters."""
        today = timezone.now().date()
        first_of_month = today.replace(day=1)

        # Member statistics
        total_members = User.objects.filter(is_staff=False).count()
        active_members = User.objects.filter(membership_status='active', is_staff=False).count()
        new_registrations = User.objects.filter(date_joined__gte=first_of_month, is_staff=False).count()
        expiring_memberships = User.objects.filter(
            membership_end_date__gte=today,
            membership_end_date__lte=today + timedelta(days=30),
            is_staff=False
        ).count()

        # Attendance statistics
        today_checkins = Attendance.objects.filter(date=today).count()

        # Revenue statistics (paid payments only)
        monthly_revenue = Payment.objects.filter(
            payment_date__gte=first_of_month,
            status='paid'
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_revenue = Payment.objects.filter(status='paid').aggregate(
            total=Sum('amount')
        )['total'] or 0

        # Booking statistics
        total_bookings = Booking.objects.count()
        pending_bookings = Booking.objects.filter(status='pending').count()

        # Payment statistics
        pending_payments = Payment.objects.filter(status='pending').count()

        # Trainer & equipment statistics
        total_trainers = Trainer.objects.filter(status='active').count()
        total_equipment = Equipment.objects.count()

        # Latest 5 registrations for the dashboard feed
        recent_registrations = list(
            User.objects.filter(is_staff=False)
            .order_by('-date_joined')[:5]
            .values('id', 'first_name', 'last_name', 'email', 'date_joined', 'membership_status')
        )

        return Response({
            'total_members': total_members,
            'active_members': active_members,
            'new_registrations': new_registrations,
            'today_checkins': today_checkins,
            'monthly_revenue': float(monthly_revenue),
            'total_revenue': float(total_revenue),
            'expiring_memberships': expiring_memberships,
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'pending_payments': pending_payments,
            'total_trainers': total_trainers,
            'total_equipment': total_equipment,
            'recent_registrations': recent_registrations,
        })


class RevenueChartAPIView(APIView):
    """
    API endpoint for revenue trend chart data.

    Builds a month-by-month revenue series for the chosen period,
    filling empty months with zero so Recharts can render continuous lines.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', '12m')
        start_date = _get_period_start(period)
        today = timezone.now().date()

        payments = Payment.objects.filter(
            payment_date__date__gte=start_date,
            status='paid'
        )

        # Seed every month between start and today so gaps show as 0
        months = {}
        current = start_date.replace(day=1)
        while current <= today.replace(day=1):
            key = current.strftime('%Y-%m')
            months[key] = {'month': current.strftime('%b %y'), 'revenue': 0}
            # Advance to the next calendar month safely
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)

        # Accumulate revenue into the matching month bucket
        for payment in payments:
            key = payment.payment_date.strftime('%Y-%m')
            if key in months:
                months[key]['revenue'] += float(payment.amount)

        return Response(list(months.values()))


class AttendanceChartAPIView(APIView):
    """
    API endpoint for attendance chart data.

    Returns per-day check-in and late-arrival counts over the period.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', '30d')
        start_date = _get_period_start(period)
        today = timezone.now().date()

        records = Attendance.objects.filter(date__gte=start_date)

        # Seed every day so the chart has a continuous x-axis
        days = {}
        current = start_date
        while current <= today:
            key = current.strftime('%Y-%m-%d')
            days[key] = {'date': current.strftime('%d %b'), 'checkins': 0, 'late': 0}
            current += timedelta(days=1)

        # Tally check-ins and late arrivals per day
        for record in records:
            key = record.date.strftime('%Y-%m-%d')
            if key in days:
                days[key]['checkins'] += 1
                if record.is_late:
                    days[key]['late'] += 1

        return Response(list(days.values()))


class GrowthChartAPIView(APIView):
    """
    API endpoint for membership growth chart data.

    Returns new members per month plus a running total of all members,
    which lets the frontend show a bar + line combo chart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', '12m')
        start_date = _get_period_start(period)
        today = timezone.now().date()

        users = User.objects.filter(is_staff=False, date_joined__date__gte=start_date)

        # Seed every month bucket
        months = {}
        current = start_date.replace(day=1)
        while current <= today.replace(day=1):
            key = current.strftime('%Y-%m')
            months[key] = {'month': current.strftime('%b %y'), 'new_members': 0}
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)

        # Count registrations per month
        for user in users:
            key = user.date_joined.strftime('%Y-%m')
            if key in months:
                months[key]['new_members'] += 1

        # Build the running total, starting with members before the window
        total = User.objects.filter(is_staff=False, date_joined__date__lt=start_date).count()
        for key in months:
            total += months[key]['new_members']
            months[key]['total_members'] = total

        return Response(list(months.values()))


class PopularPackagesAPIView(APIView):
    """
    API endpoint for popular packages chart data.

    Groups paid payments by membership_type and returns the top 6,
    used by the dashboard's popular-packages donut chart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', '12m')
        start_date = _get_period_start(period)

        popular = (
            Payment.objects.filter(
                payment_date__date__gte=start_date,
                status='paid',
                membership_type__isnull=False
            )
            .exclude(membership_type='')
            .values('membership_type')
            .annotate(count=Count('id'))
            .order_by('-count')[:6]
        )

        return Response([
            {'name': item['membership_type'], 'value': item['count']}
            for item in popular
        ])


class RecentRegistrationsAPIView(APIView):
    """
    API endpoint for recent member registrations.

    Returns the latest 5 registered members for the dashboard feed.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recent = list(
            User.objects.filter(is_staff=False)
            .order_by('-date_joined')[:5]
            .values('id', 'first_name', 'last_name', 'email', 'date_joined', 'membership_status')
        )
        return Response(recent)


# ---------------------------------------------------------------------------
# Report Export Endpoints (real data, date-filtered, CSV)
# ---------------------------------------------------------------------------
class ReportExportAPIView(APIView):
    """
    API endpoint that streams real data as CSV for the admin reports module.

    Query params:
        report   - one of 'users', 'bookings', 'payments', 'attendance'
        start_date / end_date - ISO date range filter

    The data is streamed as a downloadable CSV attachment (text/csv).
    """
    permission_classes = [permissions.IsAuthenticated]
    REPORT_MODELS = ('users', 'bookings', 'payments', 'attendance', 'trainers', 'equipment')

    def get(self, request):
        # Validate the requested report type
        report = request.query_params.get('report', 'users')
        if report not in self.REPORT_MODELS:
            return Response({'error': f'Unknown report type. Valid: {list(self.REPORT_MODELS)}'}, status=400)

        # Parse optional date range (defaults to all time) as date objects
        from datetime import datetime
        try:
            start_date = datetime.strptime(request.query_params.get('start_date', ''), '%Y-%m-%d').date() if request.query_params.get('start_date') else None
            end_date = datetime.strptime(request.query_params.get('end_date', ''), '%Y-%m-%d').date() if request.query_params.get('end_date') else None
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

        # Build CSV content from the requested model
        csv_content = self._build_csv(report, start_date, end_date)
        if csv_content is None:
            return Response({'error': 'Could not build report'}, status=400)

        # Produce a streaming response with download filename
        filename = f'{report}_report_{timezone.now().strftime("%Y%m%d")}.csv'
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    def _build_csv(self, report, start_date, end_date):
        """
        Generate CSV text for the requested report model.

        Returns a StringIO-compatible string or None if the model is unknown.
        """
        output = StringIO()
        writer = csv.writer(output)

        # Common date filter helper
        def within_range(value):
            """Return True if value (date) is within the optional range."""
            if not value:
                return False
            val = value.date() if hasattr(value, 'date') else value
            if start_date and val < start_date:
                return False
            if end_date and val > end_date:
                return False
            return True

        if report == 'users':
            writer.writerow(['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Membership Status', 'Date Joined'])
            for u in User.objects.filter(is_staff=False).order_by('-date_joined'):
                # Apply date filter on registration date
                if start_date or end_date:
                    if not within_range(u.date_joined):
                        continue
                writer.writerow([u.id, u.first_name, u.last_name, u.email, u.phone, u.membership_status, u.date_joined.strftime('%Y-%m-%d')])

        elif report == 'bookings':
            writer.writerow(['ID', 'User', 'Trainer', 'Package', 'Date', 'Time', 'Status'])
            for b in Booking.objects.select_related('user', 'trainer', 'package').order_by('-created_at'):
                if start_date or end_date:
                    if not within_range(b.created_at):
                        continue
                writer.writerow([
                    b.id,
                    f"{b.user.first_name} {b.user.last_name}" if b.user else '',
                    b.trainer.name if b.trainer else '',
                    b.package.name if b.package else '',
                    b.created_at.strftime('%Y-%m-%d'),
                    b.created_at.strftime('%H:%M'),
                    b.status,
                ])

        elif report == 'payments':
            writer.writerow(['ID', 'User', 'Transaction ID', 'Amount', 'Method', 'Status', 'Date'])
            for p in Payment.objects.select_related('user').order_by('-payment_date'):
                if start_date or end_date:
                    if not within_range(p.payment_date):
                        continue
                writer.writerow([
                    p.id,
                    f"{p.user.first_name} {p.user.last_name}" if p.user else '',
                    p.transaction_id,
                    float(p.amount),
                    p.payment_method,
                    p.status,
                    p.payment_date.strftime('%Y-%m-%d %H:%M'),
                ])

        elif report == 'attendance':
            writer.writerow(['ID', 'User', 'Date', 'Check In', 'Check Out', 'Late'])
            for a in Attendance.objects.select_related('user').order_by('-date'):
                if start_date or end_date:
                    if not within_range(a.date):
                        continue
                writer.writerow([
                    a.id,
                    f"{a.user.first_name} {a.user.last_name}" if a.user else '',
                    a.date.strftime('%Y-%m-%d'),
                    a.check_in.strftime('%H:%M') if a.check_in else '',
                    a.check_out.strftime('%H:%M') if a.check_out else '',
                    'Yes' if a.is_late else 'No',
                ])

        elif report == 'trainers':
            writer.writerow(['ID', 'Name', 'Specialization', 'Email', 'Phone', 'Status'])
            for t in Trainer.objects.all().order_by('name'):
                writer.writerow([t.id, t.name, t.specialization, t.email, t.phone, t.status])

        elif report == 'equipment':
            writer.writerow(['ID', 'Name', 'Condition', 'Status', 'Purchase Date'])
            for e in Equipment.objects.all().order_by('name'):
                writer.writerow([e.id, e.name, e.condition, e.status, e.purchase_date])

        return output.getvalue()


class ROutputImageAPIView(APIView):
    """
    API endpoint that serves a generated R chart image (PNG).

    The R output directory is not under media/, so this view streams
    the PNG files produced by the R script to the frontend.
    """
    permission_classes = [permissions.IsAuthenticated]
    OUTPUT_DIR = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'r_scripts', 'output',
    )

    def get(self, request, filename):
        """Return the requested PNG image or 404 if it doesn't exist."""
        import os
        from django.http import Http404, FileResponse

        # Prevent path traversal — only allow simple PNG filenames
        if '..' in filename or not filename.endswith('.png'):
            raise Http404('Invalid filename')

        filepath = os.path.join(self.OUTPUT_DIR, filename)
        if not os.path.exists(filepath):
            raise Http404('Chart not found. Run the R analytics pipeline first.')

        # Stream the PNG file back to the browser
        return FileResponse(open(filepath, 'rb'), content_type='image/png')


class RReportAPIView(APIView):
    """
    API endpoint that triggers the R analytics pipeline.

    Exports the current database data to CSV files in r_scripts/data/,
    then invokes the R script (if Rscript is available) to generate
    ggplot2 visualisations in r_scripts/output/.

    Returns the list of generated chart filenames.
    """
    permission_classes = [permissions.IsAuthenticated]
    # Absolute paths derived from this module's location so the R pipeline
    # works regardless of the directory Django is launched from.
    _R_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'r_scripts')
    DATA_DIR = os.path.join(_R_DIR, 'data')
    OUTPUT_DIR = os.path.join(_R_DIR, 'output')
    SCRIPT_PATH = os.path.join(_R_DIR, 'gym_analytics.R')

    @staticmethod
    def _find_rscript():
        """
        Locate the Rscript executable.

        Checks, in order:
          1. An explicit override from Django settings (RSCRIPT_PATH).
          2. The system PATH (shutil.which).
          3. Common Windows R installation directories (glob R-*).
          4. Common macOS/Linux defaults.

        Returns the absolute path to Rscript, or None if not found.
        """
        from django.conf import settings

        # 1) Explicit override via Django settings
        override = getattr(settings, 'RSCRIPT_PATH', None)
        if override and os.path.exists(override):
            return override
        if override:
            return override  # let the caller surface the error message

        # 2) System PATH
        found = shutil.which('Rscript')
        if found:
            return found

        # 3) Common Windows R installation directories
        if os.name == 'nt':
            patterns = [
                r'C:\Program Files\R\R-*\bin\Rscript.exe',
                r'C:\Program Files\R\R-*\bin\x64\Rscript.exe',
                r'C:\R\R-*\bin\Rscript.exe',
                os.path.expandvars(r'%LOCALAPPDATA%\Programs\R\R-*\bin\Rscript.exe'),
            ]
            for pattern in patterns:
                matches = sorted(glob.glob(pattern), key=os.path.getmtime, reverse=True)
                if matches:
                    return matches[0]

        # 4) Common POSIX defaults
        for candidate in ('/usr/bin/Rscript', '/usr/local/bin/Rscript', '/opt/homebrew/bin/Rscript'):
            if os.path.exists(candidate):
                return candidate

        return None

    def get(self, request):
        """Trigger report generation and return the chart filenames produced."""
        import subprocess

        # Ensure the data and output directories exist
        os.makedirs(self.DATA_DIR, exist_ok=True)
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)

        # 1) Export real database data to CSVs for the R script
        exported = self._export_data_csvs()
        if not exported:
            return Response({'error': 'No data available to generate reports'}, status=400)

        # 2) Run the R script via subprocess (non-blocking-ish)
        rscript = self._find_rscript()
        if not rscript:
            return Response({
                'status': 'error',
                'message': 'Rscript not found. Install R to generate analytical charts.',
                'generated_charts': [],
            }, status=500)

        charts = []
        try:
            result = subprocess.run(
                [rscript, self.SCRIPT_PATH],
                capture_output=True,
                text=True,
                timeout=180,
                # The R script uses paths relative to the Django project root
                # (r_scripts/data, r_scripts/output), so run it from that root.
                cwd=os.path.dirname(os.path.dirname(self.SCRIPT_PATH)),
            )
            # List the generated PNG charts
            if os.path.isdir(self.OUTPUT_DIR):
                charts = sorted([
                    f for f in os.listdir(self.OUTPUT_DIR)
                    if f.endswith('.png')
                ])
            return Response({
                'status': 'success' if result.returncode == 0 else 'error',
                'generated_charts': charts,
                'std_out': result.stdout[-2000:],
                'std_err': result.stderr[-2000:],
            })
        except FileNotFoundError:
            # Rscript is not installed on this machine
            return Response({
                'status': 'error',
                'message': 'Rscript not found. Install R to generate analytical charts.',
                'generated_charts': charts,
            }, status=500)

    def _export_data_csvs(self):
        """
        Export the core database tables to CSV files used by the R scripts.

        Returns True if at least one file was written.
        """
        import csv

        written = False

        # Registered users export
        # Includes gender and age so the R script can build the gender and age
        # distribution charts from real profile data.
        with open(f'{self.DATA_DIR}/registered_users.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['id', 'first_name', 'last_name', 'email', 'date_joined', 'membership_status', 'gender', 'age'])
            for u in User.objects.filter(is_staff=False):
                writer.writerow([
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.date_joined.strftime('%Y-%m-%d'),
                    u.membership_status,
                    u.get_gender_display() if u.gender else 'Not Specified',
                    u.get_age() or '',
                ])
                written = True

        # Bookings export
        with open(f'{self.DATA_DIR}/bookings.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['id', 'user', 'trainer', 'package', 'created_at', 'status'])
            for b in Booking.objects.select_related('user', 'trainer', 'package'):
                writer.writerow([
                    b.id,
                    f"{b.user.first_name} {b.user.last_name}" if b.user else '',
                    b.trainer.name if b.trainer else '',
                    b.package.name if b.package else '',
                    b.created_at.strftime('%Y-%m-%d'),
                    b.status,
                ])

        # Payments export
        with open(f'{self.DATA_DIR}/payments.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['id', 'user', 'amount', 'payment_method', 'payment_date', 'status', 'membership_type'])
            for p in Payment.objects.select_related('user'):
                writer.writerow([
                    p.id,
                    f"{p.user.first_name} {p.user.last_name}" if p.user else '',
                    float(p.amount),
                    p.payment_method,
                    p.payment_date.strftime('%Y-%m-%d'),
                    p.status,
                    p.membership_type,
                ])
                written = True

        # Workouts export (for workout volume / training analytics)
        with open(f'{self.DATA_DIR}/workouts.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['id', 'user', 'name', 'date', 'duration_minutes', 'workout_type', 'status', 'total_volume', 'exercise_count'])
            for w in Workout.objects.select_related('user').prefetch_related('exercises'):
                writer.writerow([
                    w.id,
                    f"{w.user.first_name} {w.user.last_name}" if w.user else '',
                    w.name,
                    w.date.strftime('%Y-%m-%d') if w.date else '',
                    w.duration_minutes or '',
                    w.workout_type,
                    w.status,
                    w.total_volume,
                    w.exercise_count,
                ])
                written = True

        # Body measurements export (for weight/BMI trends)
        with open(f'{self.DATA_DIR}/measurements.csv', 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['id', 'user', 'date', 'weight_kg', 'body_fat_pct', 'bmi'])
            for m in BodyMeasurement.objects.select_related('user'):
                writer.writerow([
                    m.id,
                    f"{m.user.first_name} {m.user.last_name}" if m.user else '',
                    m.date.strftime('%Y-%m-%d') if m.date else '',
                    float(m.weight_kg) if m.weight_kg else '',
                    float(m.body_fat_pct) if m.body_fat_pct else '',
                    float(m.bmi) if m.bmi else '',
                ])
                written = True

        return written


class WorkoutRReportAPIView(RReportAPIView):
    """
    API endpoint that runs the workout & training analytics R script.

    Exports workout and body measurement data to CSV (reusing the parent
    exporter), then runs r_scripts/workout_analytics.R to generate advanced
    training charts: volume trends, frequency, workout types, member weight
    trends, top members by volume, and duration trends.

    Returns only the workout-related chart filenames. Charts are served via the
    existing ROutputImageAPIView endpoint.
    """
    SCRIPT_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'r_scripts', 'workout_analytics.R',
    )
    # Only report charts produced by the workout analytics script.
    WORKOUT_CHART_PREFIXES = (
        'workout_', 'member_weight', 'top_members',
    )

    def _list_workout_charts(self):
        """Return only the workout-related PNG charts in the output dir."""
        if not os.path.isdir(self.OUTPUT_DIR):
            return []
        return sorted([
            f for f in os.listdir(self.OUTPUT_DIR)
            if f.endswith('.png') and f.startswith(self.WORKOUT_CHART_PREFIXES)
        ])

    def get(self, request):
        """
        Export workout data, run the workout R script, and return only the
        workout-specific generated charts.
        """
        import subprocess

        os.makedirs(self.DATA_DIR, exist_ok=True)
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)

        exported = self._export_data_csvs()
        if not exported:
            return Response({'error': 'No data available to generate reports'}, status=400)

        rscript = self._find_rscript()
        if not rscript:
            return Response({
                'status': 'error',
                'message': 'Rscript not found. Install R to generate analytical charts.',
                'generated_charts': [],
            }, status=500)

        try:
            result = subprocess.run(
                [rscript, self.SCRIPT_PATH],
                capture_output=True,
                text=True,
                timeout=180,
                cwd=os.path.dirname(os.path.dirname(self.SCRIPT_PATH)),
            )
            charts = self._list_workout_charts()
            return Response({
                'status': 'success' if result.returncode == 0 else 'error',
                'generated_charts': charts,
                'std_out': result.stdout[-2000:],
                'std_err': result.stderr[-2000:],
            })
        except FileNotFoundError:
            return Response({
                'status': 'error',
                'message': 'Rscript not found. Install R to generate analytical charts.',
                'generated_charts': [],
            }, status=500)
