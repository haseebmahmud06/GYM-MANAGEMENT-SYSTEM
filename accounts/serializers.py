"""
REST API serializers for the accounts app.
Provides JSON serialization for user data and JWT authentication endpoints.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for reading user profile data."""
    
    age = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone', 'date_of_birth', 'age', 'gender', 'profile_picture',
            'address', 'city', 'state', 'country',
            'member_id', 'membership_status', 'membership_start_date', 'membership_end_date',
            'height_cm', 'weight_kg', 'emergency_contact', 'emergency_phone',
            'medical_conditions', 'fitness_goals',
            'email_verified', 'is_active', 'is_staff', 'is_superuser', 'date_joined',
        ]
        read_only_fields = ['id', 'email', 'member_id', 'date_joined', 'email_verified']
    
    def get_age(self, obj):
        return obj.get_age()
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password validation."""
    
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 'phone',
            'date_of_birth', 'gender', 'password', 'confirm_password'
        ]
    
    def validate_email(self, value):
        """Ensure email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value
    
    def validate(self, attrs):
        """Ensure passwords match."""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs
    
    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'date_of_birth', 'gender',
            'address', 'city', 'state', 'country', 'profile_picture',
            'height_cm', 'weight_kg', 'emergency_contact', 'emergency_phone',
            'medical_conditions', 'fitness_goals',
        ]


class UserLoginSerializer(serializers.Serializer):
    """Serializer for JWT authentication login."""
    
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        """Authenticate user with email and password."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            attrs['user'] = user
            return attrs
        
        raise serializers.ValidationError('Must include "email" and "password".')
