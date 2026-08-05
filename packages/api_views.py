"""
REST API views for the packages app.
Provides JSON endpoints for membership packages, categories, and package types.
"""
from rest_framework import generics, permissions, serializers
from .models import Package, Category, PackageType


class PackageSerializer(serializers.ModelSerializer):
    """Serializer for membership packages."""
    # Expose human-readable names of related Category and PackageType so the
    # frontend can display them without additional round-trips.
    category_name = serializers.CharField(source='category.name', read_only=True)
    package_type_name = serializers.CharField(source='package_type.name', read_only=True)
    # Expose computed model @property methods. These are NOT covered by
    # fields='__all__' (which only includes DB fields), so they must be declared
    # explicitly as read-only fields for the frontend (discounted_price,
    # benefits_list, available_classes_list).
    discounted_price = serializers.SerializerMethodField()
    benefits_list = serializers.SerializerMethodField()
    available_classes_list = serializers.SerializerMethodField()

    def get_discounted_price(self, obj):
        return obj.discounted_price

    def get_benefits_list(self, obj):
        return obj.benefits_list

    def get_available_classes_list(self, obj):
        return obj.available_classes_list

    class Meta:
        model = Package
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'category_name', 'package_type_name']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for package categories."""
    class Meta:
        model = Category
        fields = '__all__'


class PackageTypeSerializer(serializers.ModelSerializer):
    """Serializer for package types."""
    class Meta:
        model = PackageType
        fields = '__all__'


class PackageListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating membership packages.
    GET: Public - returns active packages. Admin - returns all packages.
    POST: Admin only - creates a new package.
    """
    serializer_class = PackageSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            return Package.objects.all()
        return Package.objects.filter(status='active')


class PackageDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a package.
    GET: Public - returns a single package.
    PUT/PATCH/DELETE: Admin only.
    """
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class CategoryListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating categories.
    GET: Public. POST: Admin only.
    """
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            return Category.objects.all()
        return Category.objects.filter(status='active')


class CategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a category.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class PackageTypeListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing and creating package types.
    GET: Public. POST: Admin only.
    """
    serializer_class = PackageTypeSerializer
    queryset = PackageType.objects.all()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class PackageTypeDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a package type.
    """
    queryset = PackageType.objects.all()
    serializer_class = PackageTypeSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]