"""
Payment and Invoice models for the Gym Management System.
Handles payment transactions and invoice generation.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import uuid


class Payment(models.Model):
    """Payment record for bookings, memberships, or other services."""
    PAYMENT_METHOD_CHOICES = [
        ("cash", _("Cash")),
        ("card", _("Card")),
        ("transfer", _("Bank Transfer")),
        ("online", _("Online Payment")),
    ]

    STATUS_CHOICES = [
        ("pending", _("Pending")),
        ("partial", _("Partial")),
        ("paid", _("Paid")),
        ("refunded", _("Refunded")),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
        verbose_name=_("User"),
    )
    booking = models.ForeignKey(
        "bookings.Booking",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
        verbose_name=_("Booking"),
    )
    membership_type = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_("Membership Type"),
        help_text=_("Type of membership this payment is for"),
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name=_("Amount")
    )
    payment_date = models.DateTimeField(
        auto_now_add=True, verbose_name=_("Payment Date")
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="cash",
        verbose_name=_("Payment Method"),
    )
    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name=_("Transaction ID"),
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        verbose_name=_("Status"),
    )
    reference = models.CharField(
        max_length=100, blank=True, verbose_name=_("Reference")
    )
    notes = models.TextField(blank=True, verbose_name=_("Notes"))

    class Meta:
        verbose_name = _("Payment")
        verbose_name_plural = _("Payments")
        ordering = ["-payment_date"]

    def __str__(self):
        return f"Payment #{self.transaction_id[:8]} - {self.amount} ({self.get_status_display()})"


class Invoice(models.Model):
    """Invoice generated for a payment."""
    STATUS_CHOICES = [
        ("draft", _("Draft")),
        ("sent", _("Sent")),
        ("paid", _("Paid")),
        ("overdue", _("Overdue")),
        ("cancelled", _("Cancelled")),
    ]

    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name="invoices",
        verbose_name=_("Payment"),
    )
    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Invoice Number"),
    )
    issue_date = models.DateField(
        auto_now_add=True, verbose_name=_("Issue Date")
    )
    due_date = models.DateField(verbose_name=_("Due Date"))
    total_amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name=_("Total Amount")
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft",
        verbose_name=_("Status"),
    )
    pdf_file = models.FileField(
        upload_to="invoices/",
        blank=True,
        null=True,
        verbose_name=_("PDF File"),
    )

    class Meta:
        verbose_name = _("Invoice")
        verbose_name_plural = _("Invoices")
        ordering = ["-issue_date"]

    def __str__(self):
        return f"Invoice #{self.invoice_number} - {self.total_amount}"

    def save(self, *args, **kwargs):
        """Auto-generate invoice number if not set."""
        if not self.invoice_number:
            self.invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
