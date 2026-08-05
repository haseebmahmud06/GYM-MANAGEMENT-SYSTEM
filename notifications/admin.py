"""Admin configuration for the notifications app."""
from django.contrib import admin
from .models import Notification, Announcement


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'related_to', 'is_read', 'created_at']
    list_filter = ['is_read', 'notification_type', 'related_to']
    search_fields = ['title', 'user__email']


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'published_date', 'created_by']
    list_filter = ['is_active']
    search_fields = ['title']
