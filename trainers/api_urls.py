"""
API URL configuration for the trainers app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.TrainerListCreateAPIView.as_view(), name='trainer_list'),
    path('<int:pk>/', api_views.TrainerDetailAPIView.as_view(), name='trainer_detail'),
]