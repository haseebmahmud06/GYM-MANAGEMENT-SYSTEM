"""Admin configuration for the workouts app."""
from django.contrib import admin
from .models import (
    Exercise,
    Workout,
    WorkoutExercise,
    WorkoutSet,
    BodyMeasurement,
    PersonalRecord,
    WearableDevice,
    WearableData,
    WorkoutGoal,
    WorkoutPost,
    WorkoutPostComment,
    WorkoutPostLike,
)


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'primary_muscle', 'difficulty', 'equipment', 'category']
    list_filter = ['difficulty', 'category', 'primary_muscle']
    search_fields = ['name', 'primary_muscle']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'date', 'duration_minutes', 'workout_type', 'total_volume']
    list_filter = ['workout_type', 'date']
    search_fields = ['name', 'user__email']


@admin.register(WorkoutExercise)
class WorkoutExerciseAdmin(admin.ModelAdmin):
    list_display = ['id', 'workout', 'exercise_name', 'order']
    search_fields = ['exercise_name']


@admin.register(WorkoutSet)
class WorkoutSetAdmin(admin.ModelAdmin):
    list_display = ['id', 'workout_exercise', 'set_number', 'weight', 'reps']


@admin.register(BodyMeasurement)
class BodyMeasurementAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'weight_kg', 'body_fat_pct', 'bmi']
    list_filter = ['date']
    search_fields = ['user__email']


@admin.register(PersonalRecord)
class PersonalRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'exercise', 'weight', 'reps', 'achieved_date', 'record_type', 'is_current']
    list_filter = ['record_type', 'is_current']
    search_fields = ['user__email', 'exercise']


@admin.register(WearableDevice)
class WearableDeviceAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_type', 'name', 'is_connected', 'last_synced']
    list_filter = ['device_type', 'is_connected']


@admin.register(WearableData)
class WearableDataAdmin(admin.ModelAdmin):
    list_display = ['user', 'device', 'date', 'heart_rate', 'calories', 'steps', 'duration_minutes']
    list_filter = ['date']


@admin.register(WorkoutGoal)
class WorkoutGoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'metric', 'target_value', 'current_value', 'status', 'target_date']
    list_filter = ['status', 'metric']


@admin.register(WorkoutPost)
class WorkoutPostAdmin(admin.ModelAdmin):
    list_display = ['user', 'workout', 'caption', 'like_count', 'created_at']
    list_filter = ['created_at']


@admin.register(WorkoutPostComment)
class WorkoutPostCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'text', 'created_at']


@admin.register(WorkoutPostLike)
class WorkoutPostLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
