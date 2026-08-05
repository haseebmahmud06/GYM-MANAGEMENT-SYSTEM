"""
REST API views for the accounts app.
Provides JSON endpoints for registration, profile management, authentication,
member management (admin), and membership purchase/renewal.
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import update_session_auth_hash
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import User
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
)
from packages.models import Package
from payments.models import Payment


class GoogleLoginView(APIView):
    """
    API endpoint for "Sign in with Google".

    Accepts the Google ID token (credential) obtained from the frontend via
    Google Identity Services, verifies its signature with the Google
    `google.auth` library, then either retrieves the existing user or creates a
    new one (using the verified email as the unique identifier).

    On success, returns a fresh JWT token pair plus the user profile so the
    frontend can authenticate automatically — mirroring the normal email/login
    response shape used by the rest of the app.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        from rest_framework_simplejwt.tokens import RefreshToken

        credential = request.data.get('credential') or request.data.get('id_token')
        if not credential:
            return Response(
                {'detail': 'Google credential is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        if not client_id or 'YOUR_GOOGLE_CLIENT_ID' in client_id:
            return Response(
                {'detail': 'Google OAuth is not configured on the server.'},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        try:
            # Verify the ID token signature and ensure it was issued for our
            # configured OAuth client (audience).
            info = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                audience=client_id,
            )
        except Exception:
            return Response(
                {'detail': 'Invalid Google credential.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = info.get('email')
        if not email:
            return Response(
                {'detail': 'Google account has no email address.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Retrieve or create the user keyed by the verified Google email.
        user, created = User.objects.get_or_create(
            email__iexact=email,
            defaults={
                'username': email,  # email doubles as the unique username
                'email': email,
                'first_name': info.get('given_name', ''),
                'last_name': info.get('family_name', ''),
                'email_verified': True,
            },
        )

        # Keep profile metadata fresh from Google on every sign-in.
        if not created:
            user.email_verified = True
            if info.get('given_name'):
                user.first_name = info.get('given_name')
            if info.get('family_name'):
                user.last_name = info.get('family_name')
            user.save()

        # Issue JWT tokens so the frontend can authenticate automatically.
        refresh = RefreshToken.for_user(user)
        tokens = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
        return Response({
            'tokens': tokens,
            'user': UserSerializer(user).data,
            'created': created,
        }, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    Accepts POST with user details and returns the created user profile.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for retrieving and updating the current user's profile.
    GET: Returns the authenticated user's profile.
    PATCH: Updates the authenticated user's profile.
    """
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return UserProfileSerializer
        return UserSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = UserSerializer(instance)
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """
    API endpoint for changing the current user's password.
    Accepts POST with old_password and new_password.
    """

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'detail': 'Both old_password and new_password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(old_password):
            return Response(
                {'detail': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {'detail': 'New password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)

        return Response({'detail': 'Password changed successfully.'})


class ForgotPasswordView(APIView):
    """
    API endpoint for requesting a password reset email.
    Accepts POST with email address.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'detail': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
            import uuid
            user.reset_password_token = uuid.uuid4()
            user.save(update_fields=['reset_password_token'])

            reset_link = request.build_absolute_uri(
                f'/accounts/reset-password/{user.reset_password_token}/'
            )

            # In production, send email here
            return Response({
                'detail': 'Password reset link has been sent to your email.',
                'reset_link': reset_link,  # Only in development
            })
        except User.DoesNotExist:
            return Response(
                {'detail': 'No account found with this email.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class ResetPasswordView(APIView):
    """
    API endpoint for resetting password with a token.
    Accepts POST with token and new password.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, token):
        password = request.data.get('password')
        if not password:
            return Response(
                {'detail': 'Password is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(password) < 8:
            return Response(
                {'detail': 'Password must be at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(reset_password_token=token)
            user.set_password(password)
            user.reset_password_token = None
            user.save(update_fields=['password', 'reset_password_token'])
            return Response({'detail': 'Password has been reset successfully.'})
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid or expired reset token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MemberListAPIView(generics.ListAPIView):
    """
    API endpoint for listing gym members (admin only).
    Supports search, filtering by membership status, and pagination.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    search_fields = ['first_name', 'last_name', 'email', 'username', 'member_id', 'phone']
    filterset_fields = ['membership_status', 'is_active']

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')


class MemberDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a member (admin only).
    """
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAdminUser]


class PurchaseMembershipView(APIView):
    """
    API endpoint for purchasing a membership package.
    Accepts POST with package_id and payment_method.
    Creates a payment record and activates membership.
    """

    def post(self, request):
        user = request.user
        package_id = request.data.get('package_id')
        payment_method = request.data.get('payment_method', 'online')

        if not package_id:
            return Response(
                {'detail': 'package_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            package = Package.objects.get(pk=package_id, status='active')
        except Package.DoesNotExist:
            return Response(
                {'detail': 'Package not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create payment record
        payment = Payment.objects.create(
            user=user,
            membership_type=package.name,
            amount=package.discounted_price,
            payment_method=payment_method,
            status='paid',
            reference=f"MEM-{package.name}-{user.id}",
        )

        # Activate membership
        today = timezone.now().date()
        user.membership_status = 'active'
        user.membership_start_date = today
        user.membership_end_date = today + timedelta(days=package.duration_days)
        user.save()

        return Response({
            'detail': 'Membership purchased successfully.',
            'payment': {
                'id': payment.id,
                'amount': float(payment.amount),
                'transaction_id': payment.transaction_id,
                'status': payment.status,
            },
            'membership': {
                'status': user.membership_status,
                'start_date': user.membership_start_date,
                'end_date': user.membership_end_date,
            },
        }, status=status.HTTP_201_CREATED)


class RenewMembershipView(APIView):
    """
    API endpoint for renewing an existing membership.
    Accepts POST with package_id and payment_method.
    Extends the membership end date based on package duration.
    """

    def post(self, request):
        user = request.user
        package_id = request.data.get('package_id')
        payment_method = request.data.get('payment_method', 'online')

        if not package_id:
            return Response(
                {'detail': 'package_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            package = Package.objects.get(pk=package_id, status='active')
        except Package.DoesNotExist:
            return Response(
                {'detail': 'Package not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create payment record
        payment = Payment.objects.create(
            user=user,
            membership_type=package.name,
            amount=package.discounted_price,
            payment_method=payment_method,
            status='paid',
            reference=f"REN-{package.name}-{user.id}",
        )

        # Extend membership
        today = timezone.now().date()
        if user.membership_status == 'active' and user.membership_end_date and user.membership_end_date >= today:
            user.membership_end_date = user.membership_end_date + timedelta(days=package.duration_days)
        else:
            user.membership_status = 'active'
            user.membership_start_date = today
            user.membership_end_date = today + timedelta(days=package.duration_days)
        user.save()

        return Response({
            'detail': 'Membership renewed successfully.',
            'payment': {
                'id': payment.id,
                'amount': float(payment.amount),
                'transaction_id': payment.transaction_id,
                'status': payment.status,
            },
            'membership': {
                'status': user.membership_status,
                'start_date': user.membership_start_date,
                'end_date': user.membership_end_date,
            },
        }, status=status.HTTP_200_OK)