"""
Equipment model for the Gym Management System.
Tracks gym equipment condition, maintenance, and status.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class Equipment(models.Model):
    """Gym equipment with condition tracking and maintenance scheduling."""
    CONDITION_CHOICES = [
        ("excellent", _("Excellent")),
        ("good", _("Good")),
        ("fair", _("Fair")),
        ("poor", _("Poor")),
    ]

    STATUS_CHOICES = [
        ("operational", _("Operational")),
        ("under_maintenance", _("Under Maintenance")),
        ("broken", _("Broken")),
        ("retired", _("Retired")),
    ]

    name = models.CharField(max_length=200, verbose_name=_("Equipment Name"))
    brand = models.CharField(max_length=200, blank=True, verbose_name=_("Brand"))
    purchase_date = models.DateField(
        null=True, blank=True, verbose_name=_("Purchase Date")
    )
    condition = models.CharField(
        max_length=20,
        choices=CONDITION_CHOICES,
        default="good",
        verbose_name=_("Condition"),
    )
    maintenance_date = models.DateField(
        null=True, blank=True, verbose_name=_("Last Maintenance Date")
    )
    next_maintenance_date = models.DateField(
        null=True, blank=True, verbose_name=_("Next Maintenance Date")
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="operational",
        verbose_name=_("Status"),
    )
    image = models.ImageField(
        upload_to="equipment/", blank=True, null=True, verbose_name=_("Image")
    )
    description = models.TextField(blank=True, verbose_name=_("Description"))
    location = models.CharField(
        max_length=200, blank=True, verbose_name=_("Location in Gym")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Equipment")
        verbose_name_plural = _("Equipment")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"

    @property
    def is_maintenance_overdue(self):
        """Check if next maintenance date has passed."""
        if self.next_maintenance_date:
            from datetime import date
            return self.next_maintenance_date < date.today()
        return False

    @property
    def days_until_next_maintenance(self):
        """Calculate days until next maintenance."""
        if self.next_maintenance_date:
            from datetime import date
            delta = self.next_maintenance_date - date.today()
            return max(delta.days, 0)
        return None