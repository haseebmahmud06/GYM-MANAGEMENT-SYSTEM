"""
REST API views for the equipment app.
Provides JSON endpoints for gym equipment inventory with full CRUD.
"""
from rest_framework import generics, permissions, serializers
from .models import Equipment


class EquipmentSerializer(serializers.ModelSerializer):
    """Serializer for equipment."""
    class Meta:
        model = Equipment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class EquipmentListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating equipment.
    GET: Public - returns all equipment.
    POST: Admin only - creates new equipment.
    """
    serializer_class = EquipmentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Equipment.objects.all()
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(description__icontains=search)
        # Status filter
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset


class EquipmentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting equipment.
    GET: Public. PUT/PATCH/DELETE: Admin only.
    """
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]