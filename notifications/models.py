"""
Notification and Announcement models for the Gym Management System.
Handles user notifications (email, SMS, in-app) and global announcements.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Notification(models.Model):
    """User notification for membership expiry, booking reminders, payments, etc."""
    
    NOTIFICATION_TYPES = [
        ('email', _('Email')),
        ('sms', _('SMS')),
        ('in_app', _('In-App')),
    ]
    
    RELATED_TO_CHOICES = [
        ('membership', _('Membership')),
        ('booking', _('Booking')),
        ('payment', _('Payment')),
        ('class', _('Class')),
        ('general', _('General')),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('User'),
    )
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    message = models.TextField(verbose_name=_('Message'))
    notification_type = models.CharField(
        max_length=20, choices=NOTIFICATION_TYPES, default='in_app', verbose_name=_('Type')
    )
    related_to = models.CharField(
        max_length=20, choices=RELATED_TO_CHOICES, default='general', verbose_name=_('Related To')
    )
    is_read = models.BooleanField(default=False, verbose_name=_('Is Read'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    
    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        self.is_read = True
        self.save(update_fields=['is_read'])


class Announcement(models.Model):
    """Global announcements displayed to all members."""
    
    title = models.CharField(max_length=200, verbose_name=_('Title'))
    content = models.TextField(verbose_name=_('Content'))
    published_date = models.DateTimeField(auto_now_add=True, verbose_name=_('Published Date'))
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcements',
        verbose_name=_('Created By'),
    )
    
    class Meta:
        verbose_name = _('Announcement')
        verbose_name_plural = _('Announcements')
        ordering = ['-published_date']
    
    def __str__(self):
        return self.title
