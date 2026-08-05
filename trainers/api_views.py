"""
REST API views for the trainers app.
Provides JSON endpoints for trainer profiles with full CRUD.
"""
from rest_framework import generics, permissions, serializers
from .models import Trainer


class TrainerSerializer(serializers.ModelSerializer):
    """Serializer for trainers."""
    class Meta:
        model = Trainer
        fields = '__all__'
        read_only_fields = ['created_at']


class TrainerListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating trainers.
    GET: Public - returns active trainers. Admin - returns all.
    POST: Admin only - creates a new trainer.
    """
    serializer_class = TrainerSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        queryset = Trainer.objects.all() if user and user.is_authenticated and user.is_staff else Trainer.objects.filter(status='active')
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(specialization__icontains=search)
        return queryset


class TrainerDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a trainer.
    GET: Public. PUT/PATCH/DELETE: Admin only.
    """
    queryset = Trainer.objects.all()
    serializer_class = TrainerSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]