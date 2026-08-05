"""
Workout & Fitness Tracking models for the Gym Management System.

Handles exercise libraries, workout logging, set/rep tracking, body
measurements, personal records, wearable integrations, goals, and social
workout sharing.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

from accounts.models import User


# ---------------------------------------------------------------------------
# Exercise Library
# ---------------------------------------------------------------------------
class Exercise(models.Model):
    """A searchable library entry for a single exercise."""

    CATEGORY_CHOICES = [
        ('chest', _('Chest')),
        ('back', _('Back')),
        ('shoulders', _('Shoulders')),
        ('legs', _('Legs')),
        ('arms', _('Arms')),
        ('core', _('Core')),
        ('cardio', _('Cardio')),
        ('full_body', _('Full Body')),
        ('stretching', _('Stretching')),
    ]

    DIFFICULTY_CHOICES = [
        ('beginner', _('Beginner')),
        ('intermediate', _('Intermediate')),
        ('advanced', _('Advanced')),
        ('expert', _('Expert')),
    ]

    name = models.CharField(max_length=200, verbose_name=_('Name'))
    slug = models.SlugField(max_length=220, unique=True, blank=True, verbose_name=_('Slug'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='full_body', verbose_name=_('Category'))
    primary_muscle = models.CharField(max_length=100, blank=True, verbose_name=_('Primary Muscle'))
    secondary_muscles = models.CharField(
        max_length=300, blank=True,
        help_text=_('Comma-separated list of secondary muscles'),
        verbose_name=_('Secondary Muscles'),
    )
    equipment = models.CharField(max_length=150, blank=True, verbose_name=_('Equipment'))
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner', verbose_name=_('Difficulty'))
    instructions = models.TextField(blank=True, verbose_name=_('Instructions'))
    common_mistakes = models.TextField(blank=True, verbose_name=_('Common Mistakes'))
    tips = models.TextField(blank=True, verbose_name=_('Tips'))
    image = models.ImageField(upload_to='exercises/', blank=True, null=True, verbose_name=_('Image'))
    video_url = models.URLField(blank=True, verbose_name=_('Video Demonstration'))
    is_bookmarked = models.BooleanField(default=False, verbose_name=_('Bookmarked'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Exercise')
        verbose_name_plural = _('Exercises')
        ordering = ['name']
        indexes = [models.Index(fields=['category', 'primary_muscle'])]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def secondary_muscles_list(self):
        return [m.strip() for m in self.secondary_muscles.split(',') if m.strip()] if self.secondary_muscles else []


# ---------------------------------------------------------------------------
# Workout Logging
# ---------------------------------------------------------------------------
class Workout(models.Model):
    """A workout session logged by a member."""

    WORKOUT_TYPE_CHOICES = [
        ('strength', _('Strength')),
        ('cardio', _('Cardio')),
        ('hiit', _('HIIT')),
        ('flexibility', _('Flexibility')),
        ('endurance', _('Endurance')),
        ('mixed', _('Mixed')),
    ]

    STATUS_CHOICES = [
        ('planned', _('Planned')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
    ]

    MUSCLE_GROUP_CHOICES = [
        ('chest', _('Chest')),
        ('back', _('Back')),
        ('shoulders', _('Shoulders')),
        ('legs', _('Legs')),
        ('arms', _('Arms')),
        ('core', _('Core')),
        ('cardio', _('Cardio')),
        ('full_body', _('Full Body')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workouts',
        verbose_name=_('User'),
    )
    name = models.CharField(max_length=200, verbose_name=_('Workout Name'))
    date = models.DateField(verbose_name=_('Date'))
    start_time = models.TimeField(null=True, blank=True, verbose_name=_('Start Time'))
    end_time = models.TimeField(null=True, blank=True, verbose_name=_('End Time'))
    duration_minutes = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1)],
        verbose_name=_('Duration (Minutes)'),
    )
    notes = models.TextField(blank=True, verbose_name=_('Notes'))
    muscle_group = models.CharField(max_length=30, choices=MUSCLE_GROUP_CHOICES, blank=True, verbose_name=_('Muscle Group'))
    workout_type = models.CharField(max_length=20, choices=WORKOUT_TYPE_CHOICES, default='strength', verbose_name=_('Workout Type'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned', verbose_name=_('Status'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    class Meta:
        verbose_name = _('Workout')
        verbose_name_plural = _('Workouts')
        ordering = ['-date', '-created_at']
        indexes = [models.Index(fields=['user', 'date'])]

    def __str__(self):
        return f"{self.name} - {self.date}"

    @property
    def total_volume(self):
        """Training volume = sum(weight × reps × sets) across all sets."""
        total = 0
        for we in self.exercises.all():
            for s in we.sets.all():
                total += (s.weight or 0) * (s.reps or 0) * (s.set_number or 1)
        return round(total, 2)

    @property
    def total_sets(self):
        return sum(we.sets.count() for we in self.exercises.all())

    @property
    def total_reps(self):
        return sum(s.reps or 0 for we in self.exercises.all() for s in we.sets.all())

    @property
    def exercise_count(self):
        return self.exercises.count()

    def compute_duration(self):
        """Derive duration from start/end times if not set explicitly."""
        if not self.duration_minutes and self.start_time and self.end_time:
            start = self.start_time.hour * 60 + self.start_time.minute
            end = self.end_time.hour * 60 + self.end_time.minute
            delta = (end - start) % (24 * 60)
            self.duration_minutes = delta or None


class WorkoutExercise(models.Model):
    """An exercise (with its sets) contained within a workout."""

    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE,
        related_name='exercises',
        verbose_name=_('Workout'),
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workout_entries',
        verbose_name=_('Library Exercise'),
    )
    exercise_name = models.CharField(max_length=200, verbose_name=_('Exercise Name'))
    order = models.PositiveIntegerField(default=0, verbose_name=_('Order'))

    class Meta:
        verbose_name = _('Workout Exercise')
        verbose_name_plural = _('Workout Exercises')
        ordering = ['order', 'id']

    def __str__(self):
        return self.exercise_name

    @property
    def volume(self):
        return sum((s.weight or 0) * (s.reps or 0) * (s.set_number or 1) for s in self.sets.all())


class WorkoutSet(models.Model):
    """A single set within a workout exercise."""

    workout_exercise = models.ForeignKey(
        WorkoutExercise,
        on_delete=models.CASCADE,
        related_name='sets',
        verbose_name=_('Workout Exercise'),
    )
    set_number = models.PositiveIntegerField(default=1, verbose_name=_('Set Number'))
    weight = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_('Weight Used'),
    )
    reps = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_('Repetitions'),
    )
    rest_time = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name=_('Rest Time (Seconds)'),
    )
    rpe = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        verbose_name=_('RPE (Rate of Perceived Exertion)'),
    )
    notes = models.CharField(max_length=300, blank=True, verbose_name=_('Notes'))

    class Meta:
        verbose_name = _('Workout Set')
        verbose_name_plural = _('Workout Sets')
        ordering = ['set_number', 'id']

    def __str__(self):
        return f"Set {self.set_number}: {self.weight}kg x {self.reps}"

    @property
    def volume(self):
        """Training volume for a single set = weight × reps × set_number."""
        return round((self.weight or 0) * (self.reps or 0) * (self.set_number or 1), 2)


# ---------------------------------------------------------------------------
# Body Measurement & Progress
# ---------------------------------------------------------------------------
class BodyMeasurement(models.Model):
    """A member's body measurement snapshot on a given date."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='body_measurements',
        verbose_name=_('User'),
    )
    date = models.DateField(verbose_name=_('Date'))
    weight_kg = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_('Weight (kg)'),
    )
    height_cm = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_('Height (cm)'),
    )
    body_fat_pct = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(70)],
        verbose_name=_('Body Fat (%)'),
    )
    chest_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name=_('Chest (cm)'))
    waist_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name=_('Waist (cm)'))
    arm_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name=_('Arm Size (cm)'))
    leg_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name=_('Leg Size (cm)'))
    bmi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name=_('BMI'))
    notes = models.CharField(max_length=300, blank=True, verbose_name=_('Notes'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('Body Measurement')
        verbose_name_plural = _('Body Measurements')
        ordering = ['-date']
        indexes = [models.Index(fields=['user', 'date'])]

    def __str__(self):
        return f"{self.user.email} - {self.date}"

    def save(self, *args, **kwargs):
        if self.weight_kg and self.height_cm and (self.height_cm or 0) > 0:
            h_m = float(self.height_cm) / 100
            self.bmi = round(float(self.weight_kg) / (h_m * h_m), 2)
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Personal Records
# ---------------------------------------------------------------------------
class PersonalRecord(models.Model):
    """A personal best for a given exercise/metric."""

    RECORD_TYPE_CHOICES = [
        ('bench_press', _('Bench Press')),
        ('squat', _('Squat')),
        ('deadlift', _('Deadlift')),
        ('overhead_press', _('Overhead Press')),
        ('run', _('Fastest Run')),
        ('volume', _('Most Training Volume')),
        ('duration', _('Longest Workout')),
        ('streak', _('Most Consecutive Workout Days')),
        ('custom', _('Custom')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='personal_records',
        verbose_name=_('User'),
    )
    exercise = models.CharField(max_length=200, verbose_name=_('Exercise'))
    record_type = models.CharField(max_length=30, choices=RECORD_TYPE_CHOICES, default='custom', verbose_name=_('Record Type'))
    weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name=_('Weight (kg)'))
    reps = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Repetitions'))
    time_seconds = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Time (Seconds)'))
    volume = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name=_('Volume'))
    achieved_date = models.DateField(auto_now_add=True, verbose_name=_('Achieved Date'))
    is_current = models.BooleanField(default=True, verbose_name=_('Is Current PR'))

    class Meta:
        verbose_name = _('Personal Record')
        verbose_name_plural = _('Personal Records')
        ordering = ['-achieved_date']

    def __str__(self):
        return f"{self.user.email} - {self.exercise} - {self.weight}kg"


# ---------------------------------------------------------------------------
# Wearable Integration
# ---------------------------------------------------------------------------
class WearableDevice(models.Model):
    """A connected wearable device for a member."""

    DEVICE_TYPE_CHOICES = [
        ('apple_watch', _('Apple Watch')),
        ('garmin', _('Garmin')),
        ('fitbit', _('Fitbit')),
        ('whoop', _('Whoop')),
        ('samsung', _('Samsung Health')),
        ('google_fit', _('Google Fit')),
        ('polar', _('Polar')),
        ('other', _('Other')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wearable_devices',
        verbose_name=_('User'),
    )
    device_type = models.CharField(max_length=30, choices=DEVICE_TYPE_CHOICES, default='other', verbose_name=_('Device Type'))
    name = models.CharField(max_length=150, verbose_name=_('Device Name'))
    provider = models.CharField(max_length=100, blank=True, verbose_name=_('Provider'))
    access_token = models.CharField(max_length=500, blank=True, verbose_name=_('Access Token'))
    refresh_token = models.CharField(max_length=500, blank=True, verbose_name=_('Refresh Token'))
    is_connected = models.BooleanField(default=True, verbose_name=_('Connected'))
    last_synced = models.DateTimeField(null=True, blank=True, verbose_name=_('Last Synced'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('Wearable Device')
        verbose_name_plural = _('Wearable Devices')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.email})"


class WearableData(models.Model):
    """Synced health/fitness data from a wearable device."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wearable_data',
        verbose_name=_('User'),
    )
    device = models.ForeignKey(
        WearableDevice,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='data_points',
        verbose_name=_('Device'),
    )
    source = models.CharField(max_length=100, blank=True, verbose_name=_('Source'))
    date = models.DateField(verbose_name=_('Date'))
    heart_rate = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Heart Rate (bpm)'))
    calories = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name=_('Calories Burned'))
    steps = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Steps'))
    duration_minutes = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Workout Duration (min)'))
    distance_km = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name=_('Distance (km)'))
    avg_pace = models.CharField(max_length=20, blank=True, verbose_name=_('Average Pace'))
    active_minutes = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Active Minutes'))
    sleep_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name=_('Sleep (Hours)'))
    sync_timestamp = models.DateTimeField(auto_now_add=True, verbose_name=_('Sync Timestamp'))

    class Meta:
        verbose_name = _('Wearable Data')
        verbose_name_plural = _('Wearable Data')
        ordering = ['-date']
        unique_together = [('user', 'device', 'date')]

    def __str__(self):
        return f"{self.user.email} - {self.date}"


# ---------------------------------------------------------------------------
# Goals
# ---------------------------------------------------------------------------
class WorkoutGoal(models.Model):
    """A fitness goal with progress for a member."""

    STATUS_CHOICES = [
        ('active', _('Active')),
        ('completed', _('Completed')),
        ('missed', _('Missed')),
    ]

    METRIC_CHOICES = [
        ('weekly_sessions', _('Weekly Sessions')),
        ('training_volume', _('Training Volume')),
        ('weight', _('Body Weight')),
        ('bmi', _('BMI')),
        ('distance', _('Distance')),
        ('custom', _('Custom')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workout_goals',
        verbose_name=_('User'),
    )
    name = models.CharField(max_length=200, verbose_name=_('Goal Name'))
    metric = models.CharField(max_length=30, choices=METRIC_CHOICES, default='custom', verbose_name=_('Metric'))
    target_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Target Value'))
    current_value = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Current Value'))
    unit = models.CharField(max_length=40, blank=True, default='sessions', verbose_name=_('Unit'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name=_('Status'))
    target_date = models.DateField(null=True, blank=True, verbose_name=_('Target Date'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('Workout Goal')
        verbose_name_plural = _('Workout Goals')

    def __str__(self):
        return f"{self.user.email} - {self.name}"

    @property
    def progress_pct(self):
        if self.target_value and self.target_value > 0:
            return min(round(float(self.current_value) / float(self.target_value) * 100, 1), 100.0)
        return 0


# ---------------------------------------------------------------------------
# Social / Sharing
# ---------------------------------------------------------------------------
class WorkoutPost(models.Model):
    """A shared workout feed post."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workout_posts',
        verbose_name=_('User'),
    )
    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name=_('Workout'),
    )
    caption = models.CharField(max_length=500, blank=True, verbose_name=_('Caption'))
    like_count = models.PositiveIntegerField(default=0, verbose_name=_('Likes'))
    is_public = models.BooleanField(default=True, verbose_name=_('Public'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('Workout Post')
        verbose_name_plural = _('Workout Posts')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.workout.name}"


class WorkoutPostLike(models.Model):
    """A like on a workout post."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_post_likes', verbose_name=_('User'))
    post = models.ForeignKey(WorkoutPost, on_delete=models.CASCADE, related_name='likes', verbose_name=_('Post'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('Workout Post Like')
        verbose_name_plural = _('Workout Post Likes')
        unique_together = [('user', 'post')]

    def __str__(self):
        return f"{self.user.email} likes {self.post.id}"


class WorkoutPostComment(models.Model):
    """A comment on a workout post."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_comments', verbose_name=_('User'))
    post = models.ForeignKey(WorkoutPost, on_delete=models.CASCADE, related_name='comments', verbose_name=_('Post'))
    text = models.CharField(max_length=500, verbose_name=_('Comment'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))

    class Meta:
        verbose_name = _('Workout Post Comment')
        verbose_name_plural = _('Workout Post Comments')
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.email}: {self.text[:30]}"
