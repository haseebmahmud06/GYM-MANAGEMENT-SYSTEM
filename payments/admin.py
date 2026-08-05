"""Admin configuration for the payments app."""
from django.contrib import admin
from .models import Payment, Invoice


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'user', 'amount', 'payment_method', 'status', 'payment_date']
    list_filter = ['status', 'payment_method']
    search_fields = ['transaction_id', 'user__email', 'reference']
    readonly_fields = ['transaction_id', 'payment_date']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'payment', 'total_amount', 'status', 'issue_date', 'due_date']
    list_filter = ['status']
    search_fields = ['invoice_number']
