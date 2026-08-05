"""
API URL configuration for the payments app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Payments CRUD
    path('', api_views.PaymentListCreateAPIView.as_view(), name='payment_list'),
    path('<int:pk>/', api_views.PaymentDetailAPIView.as_view(), name='payment_detail'),
    
    # Payment Status Actions
    path('<int:pk>/approve/', api_views.PaymentApproveAPIView.as_view(), name='payment_approve'),
    path('<int:pk>/refund/', api_views.PaymentRefundAPIView.as_view(), name='payment_refund'),
    
    # Invoices
    path('invoices/', api_views.InvoiceListAPIView.as_view(), name='invoice_list'),
    path('invoices/<int:pk>/', api_views.InvoiceDetailAPIView.as_view(), name='invoice_detail'),
]