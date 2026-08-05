"""
REST API views for the notifications app.
Provides JSON endpoints for user notifications.
"""
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""
    class Meta:
        model = Notification
        fields = '__all__'


class NotificationListAPIView(generics.ListAPIView):
    """
    API endpoint for listing notifications for the current user.
    Supports filtering by read status.
    """
    serializer_class = NotificationSerializer

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        return queryset.order_by('-created_at')


class MarkNotificationReadAPIView(APIView):
    """
    API endpoint for marking a single notification as read.
    """

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'detail': 'Notification marked as read.'})
        except Notification.DoesNotExist:
            return Response(
                {'detail': 'Notification not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class MarkAllNotificationsReadAPIView(APIView):
    """
    API endpoint for marking all notifications as read.
    """

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})


class UnreadNotificationCountAPIView(APIView):
    """
    API endpoint for getting the count of unread notifications.
    """

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'count': count})