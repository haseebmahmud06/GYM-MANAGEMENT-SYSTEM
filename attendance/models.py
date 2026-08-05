"""
Attendance model for the Gym Management System.
Tracks member check-in/check-out times, lateness, and attendance patterns.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Attendance(models.Model):
    """Record of a member's gym attendance with check-in/out times."""
    
    STATUS_CHOICES = [
        ('present', _('Present')),
        ('absent', _('Absent')),
        ('late', _('Late')),
        ('half_day', _('Half Day')),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        verbose_name=_('Member'),
    )
    check_in = models.DateTimeField(verbose_name=_('Check In'))
    check_out = models.DateTimeField(null=True, blank=True, verbose_name=_('Check Out'))
    date = models.DateField(verbose_name=_('Date'))
    is_late = models.BooleanField(default=False, verbose_name=_('Late Check-in'))
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='present', verbose_name=_('Status')
    )
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Attendance')
        verbose_name_plural = _('Attendance Records')
        ordering = ['-date', '-check_in']
        unique_together = ['user', 'date']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.date} ({self.get_status_display()})"
    
    @property
    def duration_hours(self):
        """Calculate duration between check-in and check-out in hours."""
        if self.check_in and self.check_out:
            delta = self.check_out - self.check_in
            return round(delta.total_seconds() / 3600, 2)
        return 0
    
    @property
    def is_checked_out(self):
        """Check if member has checked out."""
        return self.check_out is not None
    
    def save(self, *args, **kwargs):
        """Auto-set status based on check-in time and determine if late."""
        from datetime import time
        if self.check_in and not self.is_late:
            # Consider late if check-in after 9:00 AM
            if self.check_in.time() > time(9, 0):
                self.is_late = True
                if self.status not in ['late', 'absent', 'half_day']:
                    self.status = 'late'
        super().save(*args, **kwargs)
