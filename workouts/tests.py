"""
Tests for the Workout & Fitness Tracking module.
Verifies model logic (volume computation, BMI), API endpoints (workout CRUD,
sets, progress, personal records, plate calculator), and authentication.
"""
from decimal import Decimal

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from .models import (
    Exercise, Workout, WorkoutExercise, WorkoutSet, BodyMeasurement,
    PersonalRecord, WorkoutPost,
)


def create_user(email='member@ffg.com', password='Passw0rd!123', **kwargs):
    return User.objects.create_user(
        email=email, username=email.split('@')[0],
        first_name='Test', last_name='User', password=password,
        height_cm=180, **kwargs,
    )


class WorkoutModelTests(TestCase):
    """Test workout model volume/BMI calculations."""

    def setUp(self):
        self.user = create_user()

    def test_workout_total_volume(self):
        w = Workout.objects.create(
            user=self.user, name='Chest Day', date=timezone.now().date(),
            workout_type='strength', status='completed',
        )
        we = WorkoutExercise.objects.create(workout=w, exercise_name='Bench', order=1)
        WorkoutSet.objects.create(workout_exercise=we, set_number=1, weight=60, reps=10)
        WorkoutSet.objects.create(workout_exercise=we, set_number=2, weight=60, reps=8)
        # Volume = (60*10*1) + (60*8*2) = 600 + 960 = 1560
        self.assertEqual(w.total_volume, 1560)

    def test_set_volume(self):
        we = WorkoutExercise.objects.create(
            workout=Workout.objects.create(user=self.user, name='W', date=timezone.now().date()),
            exercise_name='Squat', order=1,
        )
        s = WorkoutSet.objects.create(workout_exercise=we, set_number=3, weight=50, reps=5)
        self.assertEqual(s.volume, Decimal('750.00'))

    def test_bmi_calculation(self):
        m = BodyMeasurement.objects.create(user=self.user, date=timezone.now().date(), weight_kg=81, height_cm=180)
        self.assertIsNotNone(m.bmi)
        self.assertAlmostEqual(float(m.bmi), 25.0, places=1)


class WorkoutAPITests(TestCase):
    """Test workout API endpoints with authentication."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)

    def test_create_workout_requires_auth(self):
        client = APIClient()
        resp = client.post(reverse('workout_list'), {'name': 'X', 'date': '2026-01-01'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_and_list_workout(self):
        resp = self.client.post(reverse('workout_list'), {
            'name': 'Leg Day', 'date': '2026-01-01', 'workout_type': 'strength',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['user'], self.user.id)

        resp = self.client.get(reverse('workout_list'))
        self.assertEqual(resp.data['count'], 1)

    def test_add_set_and_progress_volume(self):
        w = self.client.post(reverse('workout_list'), {'name': 'W', 'date': '2026-01-01', 'workout_type': 'strength'}).data
        we = self.client.post(reverse('workout_exercise_list'), {'workout': w['id'], 'exercise_name': 'Bench', 'order': 1}).data
        self.client.post(reverse('set_list'), {'workout_exercise': we['id'], 'set_number': 1, 'weight': 100, 'reps': 5, 'rpe': 8, 'rest_time': 60})
        # Progress only counts completed workouts - complete it first.
        self.client.post(reverse('workout_complete', args=[w['id']]))

        progress = self.client.get(reverse('progress'), {'metric': 'volume', 'grouping': 'monthly'}).data
        self.assertEqual(progress['summary']['total_volume'], 500)  # 100*5*1

    def test_personal_record_detection_on_complete(self):
        ex = Exercise.objects.create(name='Bench Press', category='chest', primary_muscle='Chest')
        w = self.client.post(reverse('workout_list'), {'name': 'W', 'date': '2026-01-01', 'workout_type': 'strength', 'status': 'planned'}).data
        we = self.client.post(reverse('workout_exercise_list'), {'workout': w['id'], 'exercise': ex.id, 'exercise_name': 'Bench Press', 'order': 1}).data
        self.client.post(reverse('set_list'), {'workout_exercise': we['id'], 'set_number': 1, 'weight': 100, 'reps': 5})

        resp = self.client.post(reverse('workout_complete', args=[w['id']]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data['new_records']), 1)

        prs = PersonalRecord.objects.filter(user=self.user)
        self.assertGreaterEqual(prs.count(), 1)

    def test_plate_calculator(self):
        resp = self.client.get(reverse('plate_calculator'), {'target': 100, 'barbell': 20, 'unit': 'kg'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        plates = {p['plate']: p['quantity'] for p in resp.data['plates']}
        self.assertEqual(plates.get(25), 1)
        self.assertEqual(plates.get(15), 1)


class ExerciseAPITests(TestCase):
    """Test exercise library endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)
        Exercise.objects.create(name='Push-Up', category='chest', primary_muscle='Chest', difficulty='beginner')

    def test_list_exercises(self):
        resp = self.client.get(reverse('exercise_list'))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_filter_by_category(self):
        resp = self.client.get(reverse('exercise_list'), {'category': 'chest'})
        self.assertEqual(resp.data['count'], 1)
        resp = self.client.get(reverse('exercise_list'), {'category': 'back'})
        self.assertEqual(resp.data['count'], 0)

    def test_only_admin_can_create_exercise(self):
        resp = self.client.post(reverse('exercise_list'), {'name': 'Squat', 'category': 'legs'})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_toggle_bookmark(self):
        ex = Exercise.objects.first()
        resp = self.client.post(reverse('exercise_bookmark', args=[ex.id]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['is_bookmarked'])


class WearableTests(TestCase):
    """Test wearable integration endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)

    def test_connect_device(self):
        resp = self.client.post(reverse('wearable_connect'), {'device_type': 'apple_watch', 'name': 'My Watch'})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['user'], self.user.id)

    def test_list_devices(self):
        resp = self.client.get(reverse('wearable_device_list'))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class GoalTests(TestCase):
    """Test goal endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)

    def test_create_goal_and_progress(self):
        resp = self.client.post(reverse('goal_list'), {
            'name': 'Train 4x', 'metric': 'weekly_sessions', 'target_value': 4, 'unit': 'sessions',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['progress_pct'], 0)


class SocialPostTests(TestCase):
    """Test social post endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = create_user()
        self.client.force_authenticate(user=self.user)

    def test_create_and_like_post(self):
        w = Workout.objects.create(user=self.user, name='W', date=timezone.now().date())
        post = self.client.post(reverse('post_list'), {'workout': w.id, 'caption': 'Great session!'}).data
        self.assertEqual(post['user'], self.user.id)

        like = self.client.post(reverse('post_like', args=[post['id']]))
        self.assertTrue(like.data['liked'])
        self.assertEqual(like.data['like_count'], 1)

        unlike = self.client.post(reverse('post_like', args=[post['id']]))
        self.assertFalse(unlike.data['liked'])

    def test_add_comment(self):
        w = Workout.objects.create(user=self.user, name='W', date=timezone.now().date())
        post = self.client.post(reverse('post_list'), {'workout': w.id}).data
        resp = self.client.post(reverse('post_comment', args=[post['id']]), {'text': 'Nice work!'})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['text'], 'Nice work!')
