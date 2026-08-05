"""
Seed script for the Workout & Fitness Tracking module.
Populates the Exercise library with a curated set of common exercises so the
Exercise Library page has meaningful content. Idempotent - safe to re-run.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitness_first_gym.settings')
django.setup()

from workouts.models import Exercise  # noqa: E402

EXERCISES = [
    # --- Chest ---
    {'name': 'Barbell Bench Press', 'category': 'chest', 'primary_muscle': 'Chest', 'secondary_muscles': 'Triceps, Anterior Deltoids', 'equipment': 'Barbell, Bench', 'difficulty': 'intermediate',
     'instructions': 'Lie on a flat bench, grip the bar slightly wider than shoulder-width. Lower the bar to mid-chest, then press back up to full arm extension without locking out explosively.',
     'common_mistakes': 'Bouncing the bar off the chest, flaring elbows to 90 degrees, arching the lower back excessively.',
     'tips': 'Keep your shoulder blades retracted and feet planted on the floor for stability.', 'video_url': ''},
    {'name': 'Push-Up', 'category': 'chest', 'primary_muscle': 'Chest', 'secondary_muscles': 'Triceps, Core, Anterior Deltoids', 'equipment': 'Bodyweight', 'difficulty': 'beginner',
     'instructions': 'Start in a high plank with hands slightly wider than shoulder-width. Lower your chest toward the floor, keeping a straight line from head to heels, then press back up.',
     'common_mistakes': 'Sagging hips, flaring elbows, rushed tempo.',
     'tips': 'Squeeze your glutes and core throughout to maintain a rigid torso.', 'video_url': ''},
    {'name': 'Incline Dumbbell Press', 'category': 'chest', 'primary_muscle': 'Upper Chest', 'secondary_muscles': 'Anterior Deltoids, Triceps', 'equipment': 'Dumbbells, Incline Bench', 'difficulty': 'intermediate',
     'instructions': 'Set the bench to a 30-45 degree incline. Press the dumbbells from shoulder level to full extension, keeping shoulders packed.',
     'common_mistakes': 'Using a bench angle that is too steep, turning it into a shoulder press.',
     'tips': 'Control the lowering phase for 2-3 seconds to maximize upper chest activation.', 'video_url': ''},

    # --- Back ---
    {'name': 'Deadlift', 'category': 'back', 'primary_muscle': 'Back', 'secondary_muscles': 'Glutes, Hamstrings, Core, Forearms', 'equipment': 'Barbell', 'difficulty': 'advanced',
     'instructions': 'Stand with feet hip-width, bar over mid-foot. Hinge at the hips, grip the bar, brace your core, and stand up driving through the whole foot. Return the bar to the floor with control.',
     'common_mistakes': 'Rounding the lower back, pulling with the arms, letting the bar drift forward.',
     'tips': 'Set your lats before pulling and keep the bar close to your body throughout.', 'video_url': ''},
    {'name': 'Pull-Up', 'category': 'back', 'primary_muscle': 'Lats', 'secondary_muscles': 'Biceps, Rhomboids, Core', 'equipment': 'Pull-Up Bar', 'difficulty': 'intermediate',
     'instructions': 'Hang from a bar with an overhand grip. Pull your chin over the bar by driving elbows down, then lower with control to a full hang.',
     'common_mistakes': 'Swinging or kipping, partial range of motion.',
     'tips': 'Initiate the pull by imagining you are pulling the bar to your chest.', 'video_url': ''},
    {'name': 'Barbell Row', 'category': 'back', 'primary_muscle': 'Back', 'secondary_muscles': 'Biceps, Rear Deltoids', 'equipment': 'Barbell', 'difficulty': 'intermediate',
     'instructions': 'Hinge forward with a flat back, grip the bar. Row the bar to your lower chest, squeezing your shoulder blades, then lower with control.',
     'common_mistakes': 'Standing upright (turning it into a shrug), jerking the weight, rounding the back.',
     'tips': 'Keep the torso at a ~45 degree angle and pull to the navel.', 'video_url': ''},

    # --- Shoulders ---
    {'name': 'Overhead Press', 'category': 'shoulders', 'primary_muscle': 'Shoulders', 'secondary_muscles': 'Triceps, Upper Chest', 'equipment': 'Barbell', 'difficulty': 'intermediate',
     'instructions': 'Stand with the bar at shoulder height, grip slightly wider than shoulders. Press the bar overhead to full extension, then lower under control.',
     'common_mistakes': 'Excessive lower back arch, pressing around the face instead of through.',
     'tips': 'Squeeze the glutes and brace your core to protect the lower back.', 'video_url': ''},
    {'name': 'Lateral Raise', 'category': 'shoulders', 'primary_muscle': 'Medial Deltoids', 'secondary_muscles': 'Traps', 'equipment': 'Dumbbells', 'difficulty': 'beginner',
     'instructions': 'Stand with a light dumbbell in each hand. Raise the arms out to the sides to shoulder height with a slight bend in the elbows, then lower slowly.',
     'common_mistakes': 'Using too much weight and swinging, shrugging the traps.',
     'tips': 'Lead with the elbows and keep the movement controlled, not jerky.', 'video_url': ''},

    # --- Legs ---
    {'name': 'Back Squat', 'category': 'legs', 'primary_muscle': 'Quads', 'secondary_muscles': 'Glutes, Hamstrings, Core', 'equipment': 'Barbell', 'difficulty': 'intermediate',
     'instructions': 'Rest the bar on your upper traps. Sit back and down until thighs are at least parallel, keeping chest up and knees tracking over toes. Drive back up through the whole foot.',
     'common_mistakes': 'Knees caving inward, heels lifting, rounding the back at the bottom.',
     'tips': 'Take a deep breath and brace before each rep.', 'video_url': ''},
    {'name': 'Front Squat', 'category': 'legs', 'primary_muscle': 'Quads', 'secondary_muscles': 'Glutes, Core, Upper Back', 'equipment': 'Barbell', 'difficulty': 'advanced',
     'instructions': 'Rack the bar on the front of the shoulders. Squat down keeping your elbows high and torso upright, then stand back up.',
     'common_mistakes': 'Elbows dropping, torso collapsing forward.',
     'tips': 'Keep elbows high to maintain an upright torso.', 'video_url': ''},
    {'name': 'Romanian Deadlift', 'category': 'legs', 'primary_muscle': 'Hamstrings', 'secondary_muscles': 'Glutes, Lower Back', 'equipment': 'Barbell, Dumbbells', 'difficulty': 'intermediate',
     'instructions': 'Hold the bar at hip height. Push hips back while keeping a soft knee bend, lowering the bar along the legs until you feel a hamstring stretch. Return by driving hips forward.',
     'common_mistakes': 'Round-the-back or excessive knee bend turning it into a squat.',
     'tips': 'Focus on the hip hinge and a tall neutral spine.', 'video_url': ''},
    {'name': 'Leg Press', 'category': 'legs', 'primary_muscle': 'Quads', 'secondary_muscles': 'Glutes, Hamstrings', 'equipment': 'Leg Press Machine', 'difficulty': 'beginner',
     'instructions': 'Sit in the machine with feet shoulder-width on the platform. Lower the platform until knees reach ~90 degrees, then press back to near full extension.',
     'common_mistakes': 'Lowering too deep causing the hips to curl, locking knees hard.',
     'tips': 'Keep the lower back pressed into the pad throughout.', 'video_url': ''},

    # --- Arms ---
    {'name': 'Barbell Curl', 'category': 'arms', 'primary_muscle': 'Biceps', 'secondary_muscles': 'Forearms', 'equipment': 'Barbell', 'difficulty': 'beginner',
     'instructions': 'Stand holding a barbell with an underhand grip. Curl the bar up by flexing the elbows while keeping upper arms pinned to your sides, then lower with control.',
     'common_mistakes': 'Swinging the hips, using momentum, allowing elbows to drift forward.',
     'tips': 'Control the negative and avoid rocking.', 'video_url': ''},
    {'name': 'Triceps Pushdown', 'category': 'arms', 'primary_muscle': 'Triceps', 'secondary_muscles': 'Forearms', 'equipment': 'Cable Machine', 'difficulty': 'beginner',
     'instructions': 'Facing a high cable, grip the bar and press it down to full extension by straightening the elbows, keeping upper arms fixed. Return slowly.',
     'common_mistakes': 'Using the whole body, flaring elbows.',
     'tips': 'Keep elbows tucked and focus on the extension.', 'video_url': ''},

    # --- Core ---
    {'name': 'Plank', 'category': 'core', 'primary_muscle': 'Core', 'secondary_muscles': 'Shoulders, Glutes', 'equipment': 'Bodyweight', 'difficulty': 'beginner',
     'instructions': 'Hold a forearm plank with a straight line from head to heels. Brace the core and breathe steadily.',
     'common_mistakes': 'Sagging hips, holding breath, raising the hips too high.',
     'tips': 'Squeeze glutes and pull navel toward spine.', 'video_url': ''},
    {'name': 'Hanging Leg Raise', 'category': 'core', 'primary_muscle': 'Lower Abs', 'secondary_muscles': 'Hip Flexors, Grip', 'equipment': 'Pull-Up Bar', 'difficulty': 'intermediate',
     'instructions': 'Hang from a bar and raise your legs to parallel or higher by flexing the core. Lower slowly without swinging.',
     'common_mistakes': 'Swinging, using momentum instead of the abs.',
     'tips': 'Tilt the pelvis back and avoid rocking.', 'video_url': ''},

    # --- Cardio ---
    {'name': 'Treadmill Run', 'category': 'cardio', 'primary_muscle': 'Legs', 'secondary_muscles': 'Core, Cardiorespiratory system', 'equipment': 'Treadmill', 'difficulty': 'beginner',
     'instructions': 'Run at a comfortable pace, maintaining good upright posture. Gradually increase speed or incline for progression.',
     'common_mistakes': 'Hunching, overstriding, gripping the handles.',
     'tips': 'Keep a rhythmic breathing pattern and light foot strike.', 'video_url': ''},
    {'name': 'Burpee', 'category': 'cardio', 'primary_muscle': 'Full Body', 'secondary_muscles': 'Chest, Legs, Core', 'equipment': 'Bodyweight', 'difficulty': 'intermediate',
     'instructions': 'From standing, squat down and kick back into a plank, perform a push-up, jump the feet forward, and explode up into a jump.',
     'common_mistakes': 'Letting the hips sag during the plank, incomplete reps.',
     'tips': 'Maintain intensity while keeping technique.', 'video_url': ''},

    # --- Full Body ---
    {'name': 'Clean and Press', 'category': 'full_body', 'primary_muscle': 'Full Body', 'secondary_muscles': 'Shoulders, Legs, Back', 'equipment': 'Barbell', 'difficulty': 'advanced',
     'instructions': 'Explosively pull the bar from the floor to the shoulders (clean), then press it overhead (press). Lower and repeat.',
     'common_mistakes': 'Pulling with the arms, incomplete extension at the hips.',
     'tips': 'Generate power from the hips and legs.', 'video_url': ''},

    # --- Stretching ---
    {'name': 'Hip Flexor Stretch', 'category': 'stretching', 'primary_muscle': 'Hip Flexors', 'secondary_muscles': 'Quads, Core', 'equipment': 'Bodyweight', 'difficulty': 'beginner',
     'instructions': 'Kneel on one knee with the other foot forward. Tuck the pelvis and gently lean forward to feel a stretch at the front of the hip. Hold 20-30s.',
     'common_mistakes': 'Arching the lower back, bouncing.',
     'tips': 'Squeeze the glute of the trailing leg to deepen the stretch.', 'video_url': ''},
    {'name': 'Hamstring Stretch', 'category': 'stretching', 'primary_muscle': 'Hamstrings', 'secondary_muscles': 'Lower Back, Calves', 'equipment': 'Bodyweight, Yoga Mat', 'difficulty': 'beginner',
     'instructions': 'Sit with one leg extended and reach toward the toes with a flat back. Hold gently without bouncing.',
     'common_mistakes': 'Rounding the back to reach further.',
     'tips': 'Hinge at the hips and keep the spine neutral.', 'video_url': ''},
]

created = 0
for data in EXERCISES:
    _, was_created = Exercise.objects.get_or_create(name=data['name'], defaults=data)
    if was_created:
        created += 1

print(f"Exercise library seed complete. {created} new exercises added. Total: {Exercise.objects.count()}")
