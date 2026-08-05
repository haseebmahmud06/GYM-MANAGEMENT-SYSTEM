"""
API URL configuration for the equipment app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.EquipmentListCreateAPIView.as_view(), name='equipment_list'),
    path('<int:pk>/', api_views.EquipmentDetailAPIView.as_view(), name='equipment_detail'),
]