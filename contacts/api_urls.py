"""
API URL configuration for the contacts app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Public: Create contact message
    path('', api_views.ContactCreateAPIView.as_view(), name='contact_create'),
    
    # Admin: List, retrieve, delete, mark as read
    path('messages/', api_views.ContactListAPIView.as_view(), name='contact_list'),
    path('messages/<int:pk>/', api_views.ContactDetailAPIView.as_view(), name='contact_detail'),
    path('messages/<int:pk>/read/', api_views.ContactMarkReadAPIView.as_view(), name='contact_mark_read'),
]