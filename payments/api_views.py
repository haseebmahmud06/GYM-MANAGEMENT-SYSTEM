"""
REST API views for the payments app.
Provides JSON endpoints for payments and invoices with full CRUD.
"""
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from .models import Payment, Invoice
from packages.models import Package


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments."""
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['transaction_id', 'payment_date']


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoices."""
    class Meta:
        model = Invoice
        fields = '__all__'


class PaymentListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating payments.
    GET: Returns paginated list of payments for the current user (or all for staff).
    POST: Creates a new payment.
    """
    serializer_class = PaymentSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.all() if user.is_staff else Payment.objects.filter(user=user)

        # Status filter
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Date range filter
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(payment_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__date__lte=end_date)

        return queryset

    def perform_create(self, serializer):
        user = self.request.data.get('user') if self.request.user.is_staff else self.request.user
        serializer.save(user=user)


class PaymentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a payment.
    """
    serializer_class = PaymentSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=user)


class PaymentApproveAPIView(APIView):
    """
    API endpoint for marking a payment as paid (admin).
    Also activates/extends the user's membership if this is a membership payment.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
            payment.status = 'paid'
            payment.save()

            # Update user's membership if this is a membership payment
            user = payment.user
            package = Package.objects.filter(name=payment.membership_type).first()
            if package and user:
                today = timezone.now().date()
                user.membership_status = 'active'
                user.membership_start_date = today
                user.membership_end_date = today + timedelta(days=package.duration_days)
                user.save()

            return Response({'detail': 'Payment approved and membership activated.'})
        except Payment.DoesNotExist:
            return Response(
                {'detail': 'Payment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class PaymentRefundAPIView(APIView):
    """
    API endpoint for refunding a payment (admin).
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
            payment.status = 'refunded'
            payment.save()
            return Response({'detail': 'Payment refunded.'})
        except Payment.DoesNotExist:
            return Response(
                {'detail': 'Payment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class InvoiceListAPIView(generics.ListAPIView):
    """
    API endpoint for listing invoices.
    """
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Invoice.objects.all()
        return Invoice.objects.filter(payment__user=user)


class InvoiceDetailAPIView(generics.RetrieveAPIView):
    """
    API endpoint for retrieving a single invoice.
    """
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Invoice.objects.all()
        return Invoice.objects.filter(payment__user=user)