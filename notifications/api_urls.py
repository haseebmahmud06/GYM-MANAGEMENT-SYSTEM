"""
API URL configuration for the notifications app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.NotificationListAPIView.as_view(), name='notification_list'),
    path('<int:pk>/read/', api_views.MarkNotificationReadAPIView.as_view(), name='notification_read'),
    path('mark-all-read/', api_views.MarkAllNotificationsReadAPIView.as_view(), name='mark_all_read'),
    path('unread-count/', api_views.UnreadNotificationCountAPIView.as_view(), name='unread_count'),
]