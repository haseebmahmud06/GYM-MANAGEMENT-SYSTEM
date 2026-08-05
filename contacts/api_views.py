"""
REST API views for the contacts app.
Provides JSON endpoints for contact form submissions and admin management.
"""
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ContactMessage


class ContactSerializer(serializers.ModelSerializer):
    """Serializer for contact form submissions."""
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'is_resolved', 'admin_reply', 'created_at']
        read_only_fields = ['id', 'is_resolved', 'admin_reply', 'created_at']


class ContactCreateAPIView(generics.CreateAPIView):
    """
    API endpoint for submitting a contact form.
    Accepts POST with name, email, subject, and message.
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]


class ContactListAPIView(generics.ListAPIView):
    """
    API endpoint for listing contact messages (admin).
    Supports filtering by read status and search.
    """
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = ContactMessage.objects.all().order_by('-created_at')
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_resolved=is_read.lower() == 'true')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                subject__icontains=search
            )
        return queryset


class ContactDetailAPIView(generics.RetrieveDestroyAPIView):
    """
    API endpoint for retrieving or deleting a contact message (admin).
    """
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = ContactMessage.objects.all()


class ContactMarkReadAPIView(APIView):
    """
    API endpoint for marking a contact message as read (admin).
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            message = ContactMessage.objects.get(pk=pk)
            message.is_read = True
            message.save()
            return Response({'detail': 'Message marked as read.'})
        except ContactMessage.DoesNotExist:
            return Response(
                {'detail': 'Message not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )