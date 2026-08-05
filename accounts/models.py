"""
Custom User Model for Fitness First Gym.
Extends AbstractUser to include gym-specific fields like phone, date_of_birth, gender, profile picture.
All users in the system use this model - roles are determined by is_staff/is_superuser flags.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
import uuid


class User(AbstractUser):
    """Custom user model with gym-specific fields. Uses email as unique identifier."""
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    MEMBERSHIP_STATUS = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Core fields
    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(max_length=20, validators=[RegexValidator(r'^\+?1?\d{9,15}$')], blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    
    # Address
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Nigeria')
    
    # Membership tracking
    membership_status = models.CharField(max_length=20, choices=MEMBERSHIP_STATUS, default='pending')
    membership_start_date = models.DateField(null=True, blank=True)
    membership_end_date = models.DateField(null=True, blank=True)
    member_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    # Gym stats
    height_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    
    # Health information
    medical_conditions = models.TextField(blank=True, help_text="Any medical conditions the gym should know about")
    fitness_goals = models.TextField(blank=True, help_text="User's fitness goals")
    
    # Metadata
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    last_active = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # For password reset
    reset_password_token = models.UUIDField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def save(self, *args, **kwargs):
        """Auto-generate member_id if not set."""
        if not self.member_id:
            self.member_id = f"FFG-{str(uuid.uuid4()).upper()[:8]}"
        super().save(*args, **kwargs)
    
    def get_age(self):
        """Calculate age from date_of_birth."""
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None
    
    def get_membership_days_remaining(self):
        """Calculate remaining days in membership."""
        if self.membership_end_date:
            from datetime import date
            delta = self.membership_end_date - date.today()
            return max(delta.days, 0)
        return 0
    
    def is_membership_valid(self):
        """Check if membership is currently valid."""
        if self.membership_status == 'active' and self.membership_end_date:
            from datetime import date
            return self.membership_end_date >= date.today()
        return False
