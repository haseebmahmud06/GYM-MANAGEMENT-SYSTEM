"""Admin configuration for the trainers app."""
from django.contrib import admin
from .models import Trainer


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'experience_years', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'specialization', 'email']
