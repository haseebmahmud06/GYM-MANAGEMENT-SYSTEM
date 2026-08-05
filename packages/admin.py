"""Admin configuration for the packages app."""
from django.contrib import admin
from .models import PackageType, Category, Package


@admin.register(PackageType)
class PackageTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration_days']
    search_fields = ['name']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'description']
    list_filter = ['status']
    search_fields = ['name']


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'discount', 'discounted_price', 'duration_days', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
