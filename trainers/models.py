"""
Trainer model for the Gym Management System.
Manages trainer profiles with specializations and schedules.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Trainer(models.Model):
    """Trainer profile linked to a User account or standalone."""
    STATUS_CHOICES = [
        ("active", _("Active")),
        ("inactive", _("Inactive")),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trainer_profile",
        verbose_name=_("User"),
    )
    name = models.CharField(max_length=200, verbose_name=_("Full Name"))
    specialization = models.CharField(
        max_length=200, blank=True, verbose_name=_("Specialization")
    )
    experience_years = models.PositiveIntegerField(
        default=0, verbose_name=_("Years of Experience")
    )
    bio = models.TextField(blank=True, verbose_name=_("Biography"))
    photo = models.ImageField(
        upload_to="trainers/", blank=True, null=True, verbose_name=_("Photo")
    )
    certificates = models.FileField(
        upload_to="trainers/certificates/",
        blank=True,
        null=True,
        verbose_name=_("Certificates"),
    )
    working_hours = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Working Hours"),
        help_text=_('JSON format: {"Monday": {"start": "09:00", "end": "17:00"}, ...}'),
    )
    phone = models.CharField(max_length=20, blank=True, verbose_name=_("Phone Number"))
    email = models.EmailField(blank=True, verbose_name=_("Email Address"))
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="active", verbose_name=_("Status")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Trainer")
        verbose_name_plural = _("Trainers")
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def working_days(self):
        """Return list of working days from working_hours JSON."""
        if isinstance(self.working_hours, dict):
            return list(self.working_hours.keys())
        return []