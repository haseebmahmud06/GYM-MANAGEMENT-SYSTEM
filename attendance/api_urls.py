"""
API URL configuration for the attendance app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.AttendanceListAPIView.as_view(), name='attendance_list'),
    path('check-in/', api_views.CheckInAPIView.as_view(), name='check_in'),
    path('check-out/', api_views.CheckOutAPIView.as_view(), name='check_out'),
]