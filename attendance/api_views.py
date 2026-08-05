"""
REST API views for the attendance app.
Provides JSON endpoints for check-in/check-out and attendance records.
"""
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for attendance records."""
    class Meta:
        model = Attendance
        fields = '__all__'


class AttendanceListAPIView(generics.ListAPIView):
    """
    API endpoint for listing attendance records.
    Supports filtering by date.
    """
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Attendance.objects.all() if user.is_staff else Attendance.objects.filter(user=user)
        
        # Filter by date if provided
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)
        
        return queryset.order_by('-date', '-check_in')


class CheckInAPIView(APIView):
    """
    API endpoint for checking in.
    POST: Creates an attendance record with current time.
    """

    def post(self, request):
        today = timezone.now().date()
        now = timezone.now()
        
        # Check if already checked in today
        existing = Attendance.objects.filter(
            user=request.user,
            date=today,
        ).first()
        
        if existing:
            return Response(
                {'detail': 'Already checked in today.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        attendance = Attendance.objects.create(
            user=request.user,
            date=today,
            check_in=now,
        )
        
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CheckOutAPIView(APIView):
    """
    API endpoint for checking out.
    POST: Updates the latest attendance record with check-out time.
    """

    def post(self, request):
        today = timezone.now().date()
        
        attendance = Attendance.objects.filter(
            user=request.user,
            date=today,
            check_out__isnull=True
        ).last()
        
        if not attendance:
            return Response(
                {'detail': 'No active check-in found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        attendance.check_out = timezone.now()
        attendance.save()
        
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data)
