"""Admin configuration for the bookings app."""
from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'booking_type', 'booking_date', 'start_time', 'status', 'created_at']
    list_filter = ['status', 'booking_type']
    search_fields = ['title', 'user__email', 'user__first_name']
    date_hierarchy = 'booking_date'
