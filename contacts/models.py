"""
Contact Message model for the Gym Management System.
Handles visitor inquiries and admin responses.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class ContactMessage(models.Model):
    """Visitor inquiry submitted via the contact form."""
    
    name = models.CharField(max_length=200, verbose_name=_('Full Name'))
    email = models.EmailField(verbose_name=_('Email Address'))
    phone = models.CharField(max_length=20, blank=True, verbose_name=_('Phone Number'))
    subject = models.CharField(max_length=200, verbose_name=_('Subject'))
    message = models.TextField(verbose_name=_('Message'))
    is_resolved = models.BooleanField(default=False, verbose_name=_('Is Resolved'))
    admin_reply = models.TextField(blank=True, verbose_name=_('Admin Reply'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Resolved At'))
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_messages',
        verbose_name=_('Resolved By'),
    )
    
    class Meta:
        verbose_name = _('Contact Message')
        verbose_name_plural = _('Contact Messages')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subject} - {self.name} ({self.email})"
    
    def mark_resolved(self, user):
        """Mark message as resolved."""
        from django.utils import timezone
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.resolved_by = user
        self.save(update_fields=['is_resolved', 'resolved_at', 'resolved_by'])
