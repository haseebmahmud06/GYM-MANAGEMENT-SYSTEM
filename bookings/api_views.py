"""
REST API views for the bookings app.
Provides JSON endpoints for class and personal training bookings with full CRUD.
"""
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for bookings."""
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class BookingListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating bookings.
    GET: Returns paginated list of bookings for the current user (or all for staff).
    POST: Creates a new booking (member books for self; admin can book for any user).
    """
    serializer_class = BookingSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.all() if user.is_staff else Booking.objects.filter(user=user)

        # Filters
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        booking_type = self.request.query_params.get('booking_type')
        if booking_type:
            queryset = queryset.filter(booking_type=booking_type)

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset

    def perform_create(self, serializer):
        # Allow admin to specify user, otherwise use current user
        user = self.request.data.get('user') if self.request.user.is_staff else self.request.user
        serializer.save(user=user)


class BookingDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a booking.
    """
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)

    def perform_update(self, serializer):
        # Only staff can change the user field
        if self.request.user.is_staff and 'user' in self.request.data:
            serializer.save(user_id=self.request.data['user'])
        else:
            serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You do not have permission to delete this booking.")
        instance.delete()


class BookingCancelAPIView(APIView):
    """
    API endpoint for cancelling a booking.
    POST: Sets booking status to cancelled.
    """

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
            if booking.user != request.user and not request.user.is_staff:
                return Response(
                    {'detail': 'You do not have permission to cancel this booking.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            booking.status = 'cancelled'
            booking.save()
            return Response({'detail': 'Booking cancelled successfully.'})
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class BookingApproveAPIView(APIView):
    """
    API endpoint for approving a booking (admin/receptionist).
    POST: Sets booking status to approved.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
            booking.status = 'approved'
            booking.save()
            return Response({'detail': 'Booking approved successfully.'})
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class BookingCompleteAPIView(APIView):
    """
    API endpoint for marking a booking as completed (admin/receptionist).
    POST: Sets booking status to completed.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
            booking.status = 'completed'
            booking.save()
            return Response({'detail': 'Booking marked as completed.'})
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )