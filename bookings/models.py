"""
Booking models for the Gym Management System.
Handles class bookings, personal training sessions, and general session bookings.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Booking(models.Model):
    """Booking for classes, personal training, or gym sessions."""
    BOOKING_TYPE_CHOICES = [
        ("class", _("Class")),
        ("personal_training", _("Personal Training")),
        ("session", _("Session")),
    ]

    STATUS_CHOICES = [
        ("pending", _("Pending")),
        ("approved", _("Approved")),
        ("completed", _("Completed")),
        ("cancelled", _("Cancelled")),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
        verbose_name=_("User"),
    )
    package = models.ForeignKey(
        "packages.Package",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
        verbose_name=_("Package"),
    )
    trainer = models.ForeignKey(
        "trainers.Trainer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
        verbose_name=_("Trainer"),
    )
    booking_type = models.CharField(
        max_length=30,
        choices=BOOKING_TYPE_CHOICES,
        default="class",
        verbose_name=_("Booking Type"),
    )
    title = models.CharField(max_length=200, verbose_name=_("Title"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    booking_date = models.DateField(verbose_name=_("Booking Date"))
    start_time = models.TimeField(verbose_name=_("Start Time"))
    end_time = models.TimeField(verbose_name=_("End Time"))
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        verbose_name=_("Status"),
    )
    notes = models.TextField(blank=True, verbose_name=_("Notes"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Booking")
        verbose_name_plural = _("Bookings")
        ordering = ["-booking_date", "-start_time"]

    def __str__(self):
        return f"{self.title} - {self.user} ({self.get_booking_type_display()})"

    @property
    def duration_minutes(self):
        """Calculate booking duration in minutes."""
        if self.start_time and self.end_time:
            from datetime import datetime
            start = datetime.combine(self.booking_date, self.start_time)
            end = datetime.combine(self.booking_date, self.end_time)
            return int((end - start).total_seconds() / 60)
        return 0