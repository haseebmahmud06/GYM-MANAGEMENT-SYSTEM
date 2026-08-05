"""
REST API views for the workouts app.

Provides JSON endpoints for the exercise library, workout logging, set/rep
tracking, body measurements, personal records, wearable integration, goals,
and social workout sharing.
"""
from django.db.models import Sum, Count, Q, Max
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal

from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Exercise, Workout, WorkoutExercise, WorkoutSet, BodyMeasurement,
    PersonalRecord, WearableDevice, WearableData, WorkoutGoal,
    WorkoutPost, WorkoutPostLike, WorkoutPostComment,
)


# ===========================================================================
# Serializers
# ===========================================================================
class ExerciseSerializer(serializers.ModelSerializer):
    secondary_muscles_list = serializers.SerializerMethodField()

    class Meta:
        model = Exercise
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def get_secondary_muscles_list(self, obj):
        return obj.secondary_muscles_list


class WorkoutSetSerializer(serializers.ModelSerializer):
    volume = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutSet
        fields = '__all__'
        read_only_fields = ['volume']

    def get_volume(self, obj):
        return obj.volume


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    sets = WorkoutSetSerializer(many=True, read_only=True)
    volume = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutExercise
        fields = '__all__'
        read_only_fields = ['volume', 'sets']

    def get_volume(self, obj):
        return obj.volume


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    total_volume = serializers.SerializerMethodField()
    total_sets = serializers.SerializerMethodField()
    total_reps = serializers.SerializerMethodField()
    exercise_count = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='')

    class Meta:
        model = Workout
        fields = '__all__'
        read_only_fields = [
            'created_at', 'updated_at', 'user', 'user_name',
            'total_volume', 'total_sets', 'total_reps', 'exercise_count',
        ]

    def get_total_volume(self, obj):
        return obj.total_volume

    def get_total_sets(self, obj):
        return obj.total_sets

    def get_total_reps(self, obj):
        return obj.total_reps

    def get_exercise_count(self, obj):
        return obj.exercise_count

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.compute_duration()
        instance.save()
        return instance


class BodyMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = '__all__'
        read_only_fields = ['bmi', 'created_at']


class PersonalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalRecord
        fields = '__all__'
        read_only_fields = ['achieved_date', 'is_current']


class WearableDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WearableDevice
        fields = '__all__'
        read_only_fields = ['user', 'access_token', 'refresh_token', 'created_at', 'last_synced']


class WearableDataSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True, default='')

    class Meta:
        model = WearableData
        fields = '__all__'
        read_only_fields = ['sync_timestamp', 'device_name']


class WorkoutGoalSerializer(serializers.ModelSerializer):
    progress_pct = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutGoal
        fields = '__all__'
        read_only_fields = ['user', 'progress_pct']

    def get_progress_pct(self, obj):
        return obj.progress_pct


class WorkoutPostCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='')
    user_avatar = serializers.CharField(source='user.profile_picture', read_only=True, default='')

    class Meta:
        model = WorkoutPostComment
        fields = '__all__'
        read_only_fields = ['user', 'post', 'created_at', 'user_name', 'user_avatar']


class WorkoutPostSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='')
    user_avatar = serializers.CharField(source='user.profile_picture', read_only=True, default='')
    workout_name = serializers.CharField(source='workout.name', read_only=True, default='')
    workout_volume = serializers.SerializerMethodField()
    comments = WorkoutPostCommentSerializer(many=True, read_only=True)
    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutPost
        fields = '__all__'
        read_only_fields = ['user', 'like_count', 'created_at', 'user_name', 'user_avatar', 'workout_name', 'workout_volume', 'comments', 'liked_by_me']

    def get_workout_volume(self, obj):
        return obj.workout.total_volume

    def get_liked_by_me(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False
        return obj.likes.filter(user=user).exists()


# ===========================================================================
# Exercise Library
# ===========================================================================
class ExerciseListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ExerciseSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Exercise.objects.all()
        params = self.request.query_params

        category = params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        muscle = params.get('muscle')
        if muscle:
            queryset = queryset.filter(primary_muscle__icontains=muscle)

        difficulty = params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        equipment = params.get('equipment')
        if equipment:
            queryset = queryset.filter(equipment__icontains=equipment)

        bookmarked = params.get('bookmarked')
        if bookmarked in ('true', 'True', '1'):
            queryset = queryset.filter(is_bookmarked=True)

        search = params.get('search')
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(primary_muscle__icontains=search) | Q(description__icontains=search))

        return queryset


class ExerciseDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class ExerciseToggleBookmarkAPIView(APIView):
    """Toggle a member's bookmark on an exercise."""

    def post(self, request, pk):
        try:
            exercise = Exercise.objects.get(pk=pk)
        except Exercise.DoesNotExist:
            return Response({'detail': 'Exercise not found.'}, status=status.HTTP_404_NOT_FOUND)
        exercise.is_bookmarked = not exercise.is_bookmarked
        exercise.save()
        return Response({'detail': 'Bookmark updated.', 'is_bookmarked': exercise.is_bookmarked})


# ===========================================================================
# Workouts & Sets
# ===========================================================================
class WorkoutListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = WorkoutSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Workout.objects.all() if user.is_staff else Workout.objects.filter(user=user)

        params = self.request.query_params
        status_param = params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        workout_type = params.get('workout_type')
        if workout_type:
            queryset = queryset.filter(workout_type=workout_type)

        date_from = params.get('date_from')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)

        date_to = params.get('date_to')
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        search = params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkoutDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkoutSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Workout.objects.all()
        return Workout.objects.filter(user=user)

    def perform_update(self, serializer):
        instance = serializer.save()
        instance.compute_duration()
        instance.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise PermissionError("You do not have permission to delete this workout.")
        instance.delete()


class WorkoutCompleteAPIView(APIView):
    """Mark a workout as completed and detect personal records."""

    def post(self, request, pk):
        try:
            workout = Workout.objects.get(pk=pk)
        except Workout.DoesNotExist:
            return Response({'detail': 'Workout not found.'}, status=status.HTTP_404_NOT_FOUND)

        if workout.user != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        workout.status = 'completed'
        try:
            workout.compute_duration()
        except Exception:
            pass
        workout.save()

        new_records = _detect_personal_records(request.user, workout)

        return Response({
            'detail': 'Workout completed successfully.',
            'new_records': PersonalRecordSerializer(new_records, many=True).data,
        })


def _detect_personal_records(user, workout):
    """Detect and store new personal records from a completed workout."""
    created = []
    for we in workout.exercises.all():
        if not we.exercise:
            continue
        best = we.sets.order_by('-weight', '-reps').first()
        if not best or not best.weight:
            continue
        weight = best.weight
        reps = best.reps or 0
        # e1RM approximation for strength records
        est_max = float(weight) * (1 + (reps or 0) / 30.0)
        prev = PersonalRecord.objects.filter(
            user=user, exercise__iexact=we.exercise_name, is_current=True
        ).order_by('-weight').first()
        is_lift = (we.exercise.primary_muscle or '').lower() in (
            'chest', 'back', 'legs', 'shoulders', 'arms', 'core',
        )
        if is_lift and (not prev or est_max > float(prev.weight or 0)):
            PersonalRecord.objects.filter(user=user, exercise__iexact=we.exercise_name).update(is_current=False)
            rec = PersonalRecord.objects.create(
                user=user, exercise=we.exercise_name,
                record_type=_record_type_for(we.exercise_name),
                weight=Decimal(str(round(est_max, 2))), reps=reps,
            )
            created.append(rec)
    return created


def _record_type_for(name):
    name = (name or '').lower()
    if 'bench' in name:
        return 'bench_press'
    if 'squat' in name:
        return 'squat'
    if 'deadlift' in name or 'lift' in name:
        return 'deadlift'
    if 'press' in name:
        return 'overhead_press'
    if 'run' in name or 'cardio' in name:
        return 'run'
    return 'custom'


class WorkoutExerciseListCreateAPIView(generics.ListCreateAPIView):
    """Add an exercise (unordered sets) to a workout and/or the library."""

    serializer_class = WorkoutExerciseSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        workout_id = self.request.query_params.get('workout')
        qs = WorkoutExercise.objects.all()
        # A member can only see exercises within their workouts.
        exercise_ids = Workout.objects.filter(
            Q(user=self.request.user) | Q(user__is_staff=True)
        ).values_list('id', flat=True)
        qs = qs.filter(workout_id__in=exercise_ids)
        if workout_id:
            qs = qs.filter(workout_id=workout_id)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class WorkoutExerciseDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkoutExercise.objects.all()
    serializer_class = WorkoutExerciseSerializer


class WorkoutSetListCreateAPIView(generics.ListCreateAPIView):
    """Create/replace a set for a given workout exercise."""

    serializer_class = WorkoutSetSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = WorkoutSet.objects.all()
        we_id = self.request.query_params.get('workout_exercise')
        if we_id:
            qs = qs.filter(workout_exercise_id=we_id)
        return qs

    def perform_create(self, serializer):
        instance = serializer.save()


class WorkoutSetDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WorkoutSet.objects.all()
    serializer_class = WorkoutSetSerializer


# ===========================================================================
# Body Measurements
# ===========================================================================
class BodyMeasurementListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = BodyMeasurementSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = BodyMeasurement.objects.all() if user.is_staff else BodyMeasurement.objects.filter(user=user)
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

    def perform_create(self, serializer):
        data = serializer.validated_data
        # Use the profile height if not provided explicitly.
        if 'height_cm' not in data or not data.get('height_cm'):
            if self.request.user.height_cm:
                data['height_cm'] = self.request.user.height_cm
        serializer.save(user=self.request.user)


class BodyMeasurementDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BodyMeasurementSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return BodyMeasurement.objects.all()
        return BodyMeasurement.objects.filter(user=user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise PermissionError("Cannot delete this measurement.")
        instance.delete()


# ===========================================================================
# Personal Records
# ===========================================================================
class PersonalRecordListAPIView(generics.ListAPIView):
    serializer_class = PersonalRecordSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = PersonalRecord.objects.all() if user.is_staff else PersonalRecord.objects.filter(user=user)
        record_type = self.request.query_params.get('record_type')
        if record_type:
            qs = qs.filter(record_type=record_type)
        return qs


# ===========================================================================
# Progress Analytics
# ===========================================================================
class ProgressAPIView(APIView):
    """Aggregated progress data for Recharts."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        params = request.query_params
        grouping = params.get('grouping', 'monthly')  # daily|weekly|monthly|yearly
        metric = params.get('metric', 'volume')       # volume|frequency|strength|measurements

        range_type = params.get('range', '12m')
        start = self._parse_start(range_type)

        if metric == 'volume':
            data = self._volume_by(grouping, user, start)
        elif metric == 'frequency':
            data = self._frequency_by(grouping, user, start)
        elif metric == 'strength':
            data = self._strength_by(grouping, user, start)
        elif metric == 'measurements':
            data = self._measurements(user, start)
        else:
            data = self._volume_by(grouping, user, start)

        # Summary
        summary = self._summary(user, start)

        return Response({'metric': metric, 'grouping': grouping, 'data': data, 'summary': summary})

    def _parse_start(self, range_type):
        today = timezone.now().date()
        if range_type == '30d':
            return today - timedelta(days=30)
        if range_type == '90d':
            return today - timedelta(days=90)
        if range_type == '6m':
            return today - timedelta(days=182)
        if range_type == 'all':
            return None
        return today - timedelta(days=365)

    def _truncate(self, grouping):
        if grouping == 'daily':
            return TruncDate('date')
        if grouping == 'weekly':
            return TruncWeek('date')
        if grouping == 'yearly':
            return TruncMonth('date')
        return TruncMonth('date')

    def _label(self, key, grouping):
        if not key:
            return 'N/A'
        if grouping == 'daily':
            return key.strftime('%Y-%m-%d')
        if grouping == 'weekly':
            return key.strftime('W%W %Y')
        if grouping == 'yearly':
            return key.strftime('%Y')
        return key.strftime('%Y-%m')

    def _volume_by(self, grouping, user, start):
        qs = Workout.objects.filter(user=user, status='completed')
        if start:
            qs = qs.filter(date__gte=start)
        rows = qs.annotate(key=self._truncate(grouping)).values('key')
        result = []
        for row in rows:
            workouts = Workout.objects.filter(user=user, date__year=row['key'].year, date__month=row['key'].month)
            volume = sum(w.total_volume for w in workouts)
            result.append({'label': self._label(row['key'], grouping), 'volume': round(volume, 2), 'sessions': len(workouts)})
        return result

    def _frequency_by(self, grouping, user, start):
        qs = Workout.objects.filter(user=user, status='completed')
        if start:
            qs = qs.filter(date__gte=start)
        rows = qs.annotate(key=self._truncate(grouping)).values('key').annotate(sessions=Count('id'))
        return [{'label': self._label(r['key'], grouping), 'sessions': r['sessions']} for r in rows]

    def _strength_by(self, grouping, user, start):
        qs = PersonalRecord.objects.filter(user=user, is_current=True)
        if start:
            qs = qs.filter(achieved_date__gte=start)
        rows = qs.annotate(key=TruncDate('achieved_date')).values('key', 'exercise', 'weight')
        return [{'label': self._label(r['key'], 'daily'), 'exercise': r['exercise'], 'weight': float(r['weight'] or 0)} for r in rows]

    def _measurements(self, user, start):
        qs = BodyMeasurement.objects.filter(user=user)
        if start:
            qs = qs.filter(date__gte=start)
        rows = qs.order_by('date').values(
            'date', 'weight_kg', 'body_fat_pct', 'chest_cm', 'waist_cm', 'arm_cm', 'leg_cm', 'bmi'
        )
        return [{
            'label': r['date'].strftime('%Y-%m-%d') if r['date'] else 'N/A',
            'weight': float(r['weight_kg'] or 0),
            'body_fat': float(r['body_fat_pct'] or 0),
            'bmi': float(r['bmi'] or 0),
            'chest': float(r['chest_cm'] or 0),
            'waist': float(r['waist_cm'] or 0),
            'arm': float(r['arm_cm'] or 0),
            'leg': float(r['leg_cm'] or 0),
        } for r in rows]

    def _summary(self, user, start):
        workouts = Workout.objects.filter(user=user, status='completed')
        if start:
            workouts = workouts.filter(date__gte=start)
        total_volume = sum(w.total_volume for w in workouts)
        total_sessions = workouts.count()
        total_hours = sum((w.duration_minutes or 0) for w in workouts) / 60.0

        # Streak (consecutive workout days)
        streak = 0
        days = set(workouts.values_list('date', flat=True))
        cursor = timezone.now().date()
        while cursor in days:
            streak += 1
            cursor -= timedelta(days=1)

        latest = BodyMeasurement.objects.filter(user=user).order_by('-date').first()
        return {
            'total_volume': round(total_volume, 2),
            'total_sessions': total_sessions,
            'total_hours': round(total_hours, 2),
            'current_streak': streak,
            'latest_weight': float(latest.weight_kg) if latest else None,
            'latest_bmi': float(latest.bmi) if latest else None,
            'personal_records': PersonalRecord.objects.filter(user=user, is_current=True).count(),
        }


# ===========================================================================
# Wearable Integration
# ===========================================================================
class WearableDeviceListAPIView(generics.ListAPIView):
    """List a member's connected wearable devices."""

    serializer_class = WearableDeviceSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return WearableDevice.objects.all()
        return WearableDevice.objects.filter(user=user)


class WearableConnectAPIView(APIView):
    """Register a new wearable device (simulated OAuth connect)."""

    def post(self, request):
        serializer = WearableDeviceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user, provider=request.data.get('provider', 'manual'))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WearableDisconnectAPIView(APIView):
    """Disconnect a wearable device."""

    def post(self, request, pk):
        try:
            device = WearableDevice.objects.get(pk=pk)
        except WearableDevice.DoesNotExist:
            return Response({'detail': 'Device not found.'}, status=status.HTTP_404_NOT_FOUND)
        if device.user != request.user and not request.user.is_staff:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        device.is_connected = False
        device.save()
        return Response({'detail': 'Device disconnected.', 'is_connected': False})


class WearableDataListCreateAPIView(generics.ListCreateAPIView):
    """List or sync wearable health data."""

    serializer_class = WearableDataSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = WearableData.objects.all() if user.is_staff else WearableData.objects.filter(user=user)
        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ===========================================================================
# Goals
# ===========================================================================
class WorkoutGoalListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = WorkoutGoalSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = WorkoutGoal.objects.all() if user.is_staff else WorkoutGoal.objects.filter(user=user)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkoutGoalDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkoutGoalSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return WorkoutGoal.objects.all()
        return WorkoutGoal.objects.filter(user=user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise PermissionError("Cannot delete this goal.")
        instance.delete()


# ===========================================================================
# Social / Sharing
# ===========================================================================
class WorkoutPostListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = WorkoutPostSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        # Members see their own posts + public posts from others.
        queryset = WorkoutPost.objects.filter(is_public=True)
        if not user.is_staff:
            queryset = queryset.filter(Q(user=user) | Q(is_public=True))
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkoutPostDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkoutPostSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return WorkoutPost.objects.all()
        return WorkoutPost.objects.filter(Q(user=user) | Q(is_public=True))

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise PermissionError("Cannot delete this post.")
        instance.delete()


class WorkoutPostLikeAPIView(APIView):
    """Like/unlike a workout post."""

    def post(self, request, pk):
        try:
            post = WorkoutPost.objects.get(pk=pk)
        except WorkoutPost.DoesNotExist:
            return Response({'detail': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        like, created = WorkoutPostLike.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            post.like_count = max(0, post.like_count - 1)
            post.save()
            return Response({'detail': 'Unliked.', 'liked': False, 'like_count': post.like_count})
        post.like_count += 1
        post.save()
        return Response({'detail': 'Liked.', 'liked': True, 'like_count': post.like_count})


class WorkoutPostCommentCreateAPIView(generics.CreateAPIView):
    serializer_class = WorkoutPostCommentSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        post_id = self.kwargs.get('pk')
        try:
            post = WorkoutPost.objects.get(pk=post_id)
        except WorkoutPost.DoesNotExist:
            raise serializers.ValidationError({'detail': 'Post not found.'})
        serializer.save(user=self.request.user, post=post)


# ===========================================================================
# Plate Calculator
# ===========================================================================
PLATE_STANDARD_KG = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]
PLATE_STANDARD_LB = [45, 35, 25, 10, 5, 2.5, 1.25]


class PlateCalculatorAPIView(APIView):
    """Calculate required plates per side for a target weight."""

    def get(self, request):
        target = request.query_params.get('target')
        barbell = request.query_params.get('barbell', '20')
        unit = request.query_params.get('unit', 'kg')
        try:
            target = float(target)
            barbell = float(barbell)
        except (TypeError, ValueError):
            return Response({'detail': 'A numeric target weight is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if target < barbell:
            return Response({'detail': 'Target weight must be greater than barbell weight.'}, status=status.HTTP_400_BAD_REQUEST)

        plates = PLATE_STANDARD_KG if unit == 'kg' else PLATE_STANDARD_LB
        remaining = target - barbell
        per_side = remaining / 2.0
        result = []
        for plate in plates:
            if per_side <= 0:
                break
            count = int(per_side // plate)
            if count > 0:
                result.append({'plate': plate, 'quantity': count})
                per_side = round(per_side - count * plate, 2)

        unloaded = per_side > 0.01
        return Response({
            'target': target,
            'barbell': barbell,
            'unit': unit,
            'plates': result,
            'per_side_total': round((target - barbell) / 2.0, 2),
            'exact': not unloaded,
        })
