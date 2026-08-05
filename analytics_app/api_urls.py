"""
API URL configuration for the analytics/dashboard app.

Maps dashboard chart endpoints and the real-data report export endpoints.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Dashboard summary statistics
    path('stats/', api_views.DashboardStatsAPIView.as_view(), name='dashboard_stats'),

    # Chart data endpoints (JSON for Recharts)
    path('revenue/', api_views.RevenueChartAPIView.as_view(), name='revenue_chart'),
    path('attendance/', api_views.AttendanceChartAPIView.as_view(), name='attendance_chart'),
    path('growth/', api_views.GrowthChartAPIView.as_view(), name='growth_chart'),
    path('popular-packages/', api_views.PopularPackagesAPIView.as_view(), name='popular_packages'),
    path('recent-registrations/', api_views.RecentRegistrationsAPIView.as_view(), name='recent_registrations'),

    # Real-data report exports (CSV downloads)
    path('reports/export/', api_views.ReportExportAPIView.as_view(), name='report_export'),

    # R analytics pipeline (generates ggplot2 visualisations from DB data)
    path('reports/r/', api_views.RReportAPIView.as_view(), name='report_r'),
    path('reports/r/workout/', api_views.WorkoutRReportAPIView.as_view(), name='report_r_workout'),

    # Serve generated R chart images to the frontend
    path('reports/r-output/<str:filename>/', api_views.ROutputImageAPIView.as_view(), name='report_r_output'),
]
