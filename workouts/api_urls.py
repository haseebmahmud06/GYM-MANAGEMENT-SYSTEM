"""
API URL configuration for the workouts app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Exercise Library
    path('exercises/', api_views.ExerciseListCreateAPIView.as_view(), name='exercise_list'),
    path('exercises/<int:pk>/', api_views.ExerciseDetailAPIView.as_view(), name='exercise_detail'),
    path('exercises/<int:pk>/bookmark/', api_views.ExerciseToggleBookmarkAPIView.as_view(), name='exercise_bookmark'),

    # Workout Logging
    path('workouts/', api_views.WorkoutListCreateAPIView.as_view(), name='workout_list'),
    path('workouts/<int:pk>/', api_views.WorkoutDetailAPIView.as_view(), name='workout_detail'),
    path('workouts/<int:pk>/complete/', api_views.WorkoutCompleteAPIView.as_view(), name='workout_complete'),

    # Workout Exercises & Sets
    path('workout-exercises/', api_views.WorkoutExerciseListCreateAPIView.as_view(), name='workout_exercise_list'),
    path('workout-exercises/<int:pk>/', api_views.WorkoutExerciseDetailAPIView.as_view(), name='workout_exercise_detail'),
    path('sets/', api_views.WorkoutSetListCreateAPIView.as_view(), name='set_list'),
    path('sets/<int:pk>/', api_views.WorkoutSetDetailAPIView.as_view(), name='set_detail'),

    # Body Measurements
    path('measurements/', api_views.BodyMeasurementListCreateAPIView.as_view(), name='measurement_list'),
    path('measurements/<int:pk>/', api_views.BodyMeasurementDetailAPIView.as_view(), name='measurement_detail'),

    # Personal Records
    path('personal-records/', api_views.PersonalRecordListAPIView.as_view(), name='personal_record_list'),

    # Progress Analytics
    path('progress/', api_views.ProgressAPIView.as_view(), name='progress'),

    # Wearable Integration
    path('wearable/devices/', api_views.WearableDeviceListAPIView.as_view(), name='wearable_device_list'),
    path('wearable/connect/', api_views.WearableConnectAPIView.as_view(), name='wearable_connect'),
    path('wearable/disconnect/<int:pk>/', api_views.WearableDisconnectAPIView.as_view(), name='wearable_disconnect'),
    path('wearable/data/', api_views.WearableDataListCreateAPIView.as_view(), name='wearable_data'),

    # Goals
    path('goals/', api_views.WorkoutGoalListCreateAPIView.as_view(), name='goal_list'),
    path('goals/<int:pk>/', api_views.WorkoutGoalDetailAPIView.as_view(), name='goal_detail'),

    # Social / Sharing
    path('posts/', api_views.WorkoutPostListCreateAPIView.as_view(), name='post_list'),
    path('posts/<int:pk>/', api_views.WorkoutPostDetailAPIView.as_view(), name='post_detail'),
    path('posts/<int:pk>/like/', api_views.WorkoutPostLikeAPIView.as_view(), name='post_like'),
    path('posts/<int:pk>/comments/', api_views.WorkoutPostCommentCreateAPIView.as_view(), name='post_comment'),

    # Plate Calculator
    path('plate-calculator/', api_views.PlateCalculatorAPIView.as_view(), name='plate_calculator'),
]
