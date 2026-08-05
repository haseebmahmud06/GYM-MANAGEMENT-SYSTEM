"""Admin configuration for the equipment app."""
from django.contrib import admin
from .models import Equipment


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'condition', 'status', 'next_maintenance_date', 'is_maintenance_overdue']
    list_filter = ['status', 'condition']
    search_fields = ['name', 'brand', 'location']
