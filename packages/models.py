"""
Package models for the Gym Management System.
Handles package types, categories, and membership packages.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


class PackageType(models.Model):
    """Type of package available for membership."""
    name = models.CharField(max_length=100, verbose_name=_("Name"))
    duration_days = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name=_("Duration (Days)"),
    )

    class Meta:
        verbose_name = _("Package Type")
        verbose_name_plural = _("Package Types")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Category(models.Model):
    """Category for grouping packages."""
    STATUS_CHOICES = [
        ("active", _("Active")),
        ("inactive", _("Inactive")),
    ]

    name = models.CharField(max_length=100, verbose_name=_("Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
        verbose_name=_("Status"),
    )
    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True,
        verbose_name=_("Image"),
    )

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Package(models.Model):
    """Membership package detailing pricing, duration, and benefits."""
    STATUS_CHOICES = [
        ("active", _("Active")),
        ("inactive", _("Inactive")),
    ]

    # Relationships: every package belongs to one Category and one PackageType.
    # These link the membership offering to the admin-managed taxonomies so the
    # public site can group packages by category and by type (e.g. "Monthly").
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="packages",
        verbose_name=_("Category"),
        help_text=_("The category this package belongs to"),
    )
    package_type = models.ForeignKey(
        PackageType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="packages",
        verbose_name=_("Package Type"),
        help_text=_("The type/duration class of this package"),
    )

    name = models.CharField(max_length=200, verbose_name=_("Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_("Price"),
    )
    duration_days = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name=_("Duration (Days)"),
    )
    discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_("Discount (%)"),
    )
    benefits = models.TextField(
        blank=True,
        help_text=_("List of benefits, one per line"),
        verbose_name=_("Benefits"),
    )
    available_classes = models.TextField(
        blank=True,
        help_text=_("List of available classes, one per line"),
        verbose_name=_("Available Classes"),
    )
    image = models.ImageField(
        upload_to="packages/",
        blank=True,
        null=True,
        verbose_name=_("Image"),
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
        verbose_name=_("Status"),
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Package")
        verbose_name_plural = _("Packages")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - ${self.price}"

    @property
    def discounted_price(self):
        """Calculate price after discount."""
        return self.price * (1 - self.discount / 100)

    @property
    def benefits_list(self):
        """Return benefits as a list."""
        return [b.strip() for b in self.benefits.split("\n") if b.strip()] if self.benefits else []

    @property
    def available_classes_list(self):
        """Return available classes as a list."""
        return [c.strip() for c in self.available_classes.split("\n") if c.strip()] if self.available_classes else []