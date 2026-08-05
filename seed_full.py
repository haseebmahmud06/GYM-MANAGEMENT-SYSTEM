"""
Seed gym content and revenue data.

- Update package prices to USD ($1000+)
- Add Coach Haseeb & Coach Elizabeth
- Add Elite Monthly Premium package
- Attach category images (Cardio/Strength/Yoga)
- Seed paid payments so dashboard shows ~$45,000 monthly / ~$1,000,000 total

Run:  python -c "exec(open('seed_full.py').read())"
Idempotent.
"""
import os
import shutil
from datetime import timedelta
from decimal import Decimal

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitness_first_gym.settings')
django.setup()

from django.utils import timezone  # noqa: E402

from packages.models import Package, Category, PackageType  # noqa: E402
from trainers.models import Trainer  # noqa: E402
from accounts.models import User  # noqa: E402
from payments.models import Payment  # noqa: E402

# Run from the project root (where manage.py lives).
MEDIA = os.path.join(os.getcwd(), 'media')

# ===========================================================================
# 1. Update package prices to USD ($1000+)
# ===========================================================================
# Map package names to their new USD prices.
PACKAGE_PRICES = {
    'elite membership': Decimal('1500.00'),
    'Elite Strength': Decimal('1000.00'),
}
for name, price in PACKAGE_PRICES.items():
    pkg = Package.objects.filter(name__iexact=name).first()
    if pkg:
        pkg.price = price
        # duration stays, discount reset to 0 to avoid -200% oddity
        pkg.discount = Decimal('0.00')
        pkg.save()
        print(f"Package '{pkg.name}' -> ${pkg.price}")
    else:
        print(f"  ! package not found: {name}")

# ===========================================================================
# 2. Add trainers: Coach Haseeb & Coach Elizabeth
# ===========================================================================
TRAINERS = [
    dict(
        name='Coach Haseeb', specialization='Strength & Conditioning',
        experience_years=6, photo='trainers/blackman.jpeg.jpg', status='active',
        bio='Certified strength coach specializing in powerlifting and functional conditioning.',
    ),
    dict(
        name='Coach Elizabeth', specialization='Yoga & Flexibility',
        experience_years=5, photo='trainers/woman.jpeg.jpg', status='active',
        bio='Certified yoga instructor and mobility specialist focused on flexibility and recovery.',
    ),
]
for data in TRAINERS:
    photo_path = os.path.join(MEDIA, data['photo'])
    trainer, created = Trainer.objects.get_or_create(
        name=data['name'],
        defaults=data,
    )
    if not created:
        trainer.specialization = data['specialization']
        trainer.experience_years = data['experience_years']
        trainer.photo = data['photo']
        trainer.status = data['status']
        trainer.bio = data['bio']
        trainer.save()
    print(f"Trainer: {trainer.name} ({'created' if created else 'updated'}) - {trainer.experience_years} yrs -> {trainer.photo}")

# ===========================================================================
# 3. Add new membership package (Elite Monthly Premium, $1500/mo)
# ===========================================================================
monthly = PackageType.objects.filter(name__iexact='Monthly').first() or PackageType.objects.filter(duration_days=30).first()
strength_cat = Category.objects.filter(name__iexact='Strength').first()

pkg, created = Package.objects.get_or_create(
    name='Elite Monthly Premium',
    defaults=dict(
        description='Premium monthly membership with full facility access, personal training consultation, and wellness programs.',
        price=Decimal('1500.00'),
        duration_days=30,
        discount=Decimal('0.00'),
        category=strength_cat,
        package_type=monthly,
        benefits='Full gym access\nUnlimited group classes\n1 personal training session / month\nNutrition consultation\nLocker & towel service',
        available_classes='Strength\nYoga\nCardio',
        image='packages/FitnessBrand.jpeg.jpg',
        status='active',
    ),
)
if not created:
    pkg.price = Decimal('1500.00')
    pkg.image = 'packages/FitnessBrand.jpeg.jpg'
    pkg.status = 'active'
    pkg.save()
print(f"Package: {pkg.name} (${pkg.price}/mo) image={pkg.image}")

# ===========================================================================
# 4. Attach category images (Cardio / Strength / Yoga)
# ===========================================================================
# 'cardio' file has no extension - create a cardio.jpg copy if needed.
bare_cardio = os.path.join(MEDIA, 'categories', 'cardio')
cardio_jpg = os.path.join(MEDIA, 'categories', 'cardio.jpg')
if os.path.exists(bare_cardio) and not os.path.exists(cardio_jpg):
    shutil.copyfile(bare_cardio, cardio_jpg)
    print('Copied categories/cardio -> categories/cardio.jpg')

CATEGORY_IMAGES = {
    'Cardio': 'categories/cardio.jpg',
    'Strength': 'categories/strenght.jpg',
    'Yoga': 'categories/yoga.jpg',
}
for name, img in CATEGORY_IMAGES.items():
    cat = Category.objects.filter(name__iexact=name).first()
    if not cat:
        cat = Category.objects.create(name=name, description=f'{name} training category', status='active')
    full = os.path.join(MEDIA, img.split('/')[1] if img.startswith('categories/') else img)
    full = os.path.join(MEDIA, 'categories', os.path.basename(img))
    if os.path.exists(full):
        cat.image = img
        cat.save()
        print(f"Category: {cat.name} -> {cat.image}")
    else:
        print(f"  ! missing category image: {full}")

# ===========================================================================
# 5. Seed payments for revenue targets
#    monthly_revenue = sum(paid payments this month)
#    total_revenue    = sum(all paid payments)
#    Target: ~$45,000 this month, ~$1,000,000 total
# ===========================================================================
from django.db.models import Sum  # noqa: E402

today = timezone.now()
members = list(User.objects.filter(is_staff=False))
if not members:
    print('  ! no members to attach payments to; creating fell back to any user')
    members = list(User.objects.all())

mids = [m.id for m in members]
def user_for(i):
    return User.objects.get(id=mids[i % len(mids)])

# Per-month schedules: months_ago -> target monthly total (in USD)
# We want current month ~$50k, and 12 rolling months summing to ~$1,000,000.
monthly_schedule = {
    0:  Decimal('50000'),   # this month
    1:  Decimal('82000'),
    2:  Decimal('85000'),
    3:  Decimal('87000'),
    4:  Decimal('90000'),
    5:  Decimal('91000'),
    6:  Decimal('92000'),
    7:  Decimal('93000'),
    8:  Decimal('94000'),
    9:  Decimal('90000'),
    10: Decimal('86000'),
    11: Decimal('88000'),
}

# Clean out any previously-seeded payments so we don't duplicate.
Payment.objects.filter(notes='Seeded revenue data').delete()
Payment.objects.all().delete()

def month_start_dt(months_ago):
    # First day of the month that is `months_ago` months before this month.
    y = today.year
    m = today.month - months_ago
    while m <= 0:
        m += 12
        y -= 1
    return today.replace(year=y, month=m, day=1)

created_count = 0
for months_ago, total in monthly_schedule.items():
    base_dt = month_start_dt(months_ago)
    rows = []  # (payment_obj, target_date)
    acc = Decimal('0.00')
    idx = 0
    while acc < total:
        chunk = Decimal(str(1000 + (idx % 3) * 750))
        if acc + chunk > total:
            chunk = total - acc
        p = Payment.objects.create(
            user=user_for(idx),
            amount=chunk,
            payment_method=['card', 'transfer', 'online', 'cash'][idx % 4],
            membership_type='Monthly Premium',
            status='paid',
            notes='Seeded revenue data',
        )
        # auto_now_add set payment_date=now; we backdate it after create.
        acc += chunk
        rows.append((p, base_dt + timedelta(days=(idx % 27), hours=(idx % 12))))
        idx += 1
    # Backdate payment_date via update() (bypasses auto_now_add).
    for p, d in rows:
        Payment.objects.filter(pk=p.pk).update(payment_date=d)
    created_count += len(rows)

# Recompute realities
tot = Payment.objects.filter(status='paid').aggregate(s=Sum('amount'))['s'] or 0
current_month = Payment.objects.filter(status='paid', payment_date__year=today.year, payment_date__month=today.month).aggregate(s=Sum('amount'))['s'] or 0
print(f"\nPayments created this run: {created_count}")
print(f"Current-month paid revenue: ${current_month:,.2f}")
print(f"Total paid revenue:         ${tot:,.2f}")
print(f"Total payment records:      {Payment.objects.count()}")
