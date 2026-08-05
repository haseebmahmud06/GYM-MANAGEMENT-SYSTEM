"""
API URL configuration for the bookings app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Bookings CRUD
    path('', api_views.BookingListCreateAPIView.as_view(), name='booking_list'),
    path('<int:pk>/', api_views.BookingDetailAPIView.as_view(), name='booking_detail'),
    
    # Booking Status Actions
    path('<int:pk>/cancel/', api_views.BookingCancelAPIView.as_view(), name='booking_cancel'),
    path('<int:pk>/approve/', api_views.BookingApproveAPIView.as_view(), name='booking_approve'),
    path('<int:pk>/complete/', api_views.BookingCompleteAPIView.as_view(), name='booking_complete'),
]