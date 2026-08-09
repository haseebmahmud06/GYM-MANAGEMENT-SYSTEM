"""
Main URL configuration for Fitness First Gym Management System.
Maps all app URLs and includes REST API routes under /api/.
The React SPA (FEG/) serves the frontend; Django provides the REST API.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve as static_serve
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),
    
    # REST API endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('accounts.api_urls')),
    path('api/packages/', include('packages.api_urls')),
    path('api/bookings/', include('bookings.api_urls')),
    path('api/payments/', include('payments.api_urls')),
    path('api/trainers/', include('trainers.api_urls')),
    path('api/attendance/', include('attendance.api_urls')),
    path('api/equipment/', include('equipment.api_urls')),
    path('api/notifications/', include('notifications.api_urls')),
    path('api/contact/', include('contacts.api_urls')),
    path('api/dashboard/', include('analytics_app.api_urls')),
    path('api/workouts/', include('workouts.api_urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serve media files in production too (single-server free deploy).
# In a larger setup this would be handled by S3/Cloudinary or a CDN, but for a
# free render deploy serving from disk is the simplest option.
if not settings.DEBUG:
    urlpatterns += [
        path(
            f'{settings.MEDIA_URL.lstrip("/")}<path:path>',
            static_serve,
            kwargs={'document_root': settings.MEDIA_ROOT},
        ),
    ]
