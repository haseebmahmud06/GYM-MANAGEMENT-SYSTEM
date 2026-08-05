"""Admin configuration for the accounts app."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for the User model showing gym-specific fields."""
    
    list_display = ['email', 'username', 'member_id', 'first_name', 'last_name', 
                    'membership_status', 'email_verified', 'is_staff', 'is_active']
    list_filter = ['membership_status', 'email_verified', 'is_staff', 'is_active', 'gender']
    search_fields = ['email', 'username', 'first_name', 'last_name', 'member_id', 'phone']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('username', 'first_name', 'last_name', 'phone', 
                                          'date_of_birth', 'gender', 'profile_picture',
                                          'address', 'city', 'state', 'country')}),
        (_('Membership'), {'fields': ('member_id', 'membership_status', 'membership_start_date', 
                                       'membership_end_date')}),
        (_('Health & Fitness'), {'fields': ('height_cm', 'weight_kg', 'medical_conditions', 
                                             'fitness_goals', 'emergency_contact', 'emergency_phone')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 
                                        'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined', 'last_active')}),
        (_('Security'), {'fields': ('email_verified', 'email_verification_token', 
                                     'reset_password_token')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
