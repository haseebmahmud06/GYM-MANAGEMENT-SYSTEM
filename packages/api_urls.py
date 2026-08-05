"""
API URL configuration for the packages app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Packages CRUD
    path('', api_views.PackageListCreateAPIView.as_view(), name='package_list'),
    path('<int:pk>/', api_views.PackageDetailAPIView.as_view(), name='package_detail'),
    
    # Categories CRUD
    path('categories/', api_views.CategoryListCreateAPIView.as_view(), name='category_list'),
    path('categories/<int:pk>/', api_views.CategoryDetailAPIView.as_view(), name='category_detail'),
    
    # Package Types CRUD
    path('types/', api_views.PackageTypeListCreateAPIView.as_view(), name='packagetype_list'),
    path('types/<int:pk>/', api_views.PackageTypeDetailAPIView.as_view(), name='packagetype_detail'),
]