"""
API URL configuration for the accounts app.
Maps REST API endpoints for authentication, profile management, and member management.
"""
from django.urls import path
from . import api_views

app_name = 'accounts_api'

urlpatterns = [
    # Registration & Profile
    path('register/', api_views.RegisterView.as_view(), name='register'),
    path('profile/', api_views.UserProfileView.as_view(), name='profile'),
    path('change-password/', api_views.ChangePasswordView.as_view(), name='change_password'),

    # Google OAuth
    path('google/', api_views.GoogleLoginView.as_view(), name='google_login'),
    
    # Password Reset
    path('forgot-password/', api_views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/<uuid:token>/', api_views.ResetPasswordView.as_view(), name='reset_password'),
    
    # Members Management (Admin)
    path('members/', api_views.MemberListAPIView.as_view(), name='member_list'),
    path('members/<int:pk>/', api_views.MemberDetailAPIView.as_view(), name='member_detail'),
    
    # Membership Purchase & Renewal
    path('membership/purchase/', api_views.PurchaseMembershipView.as_view(), name='purchase_membership'),
    path('membership/renew/', api_views.RenewMembershipView.as_view(), name='renew_membership'),
]