"""Admin configuration for the attendance app."""
from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'check_in', 'check_out', 'status', 'is_late', 'duration_hours']
    list_filter = ['status', 'is_late']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    date_hierarchy = 'date'
