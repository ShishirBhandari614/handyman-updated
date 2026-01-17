# bookings/serializers.py
from rest_framework import serializers
from .models import Booking, Notification

from django.utils import timezone

class BookingSerializer(serializers.ModelSerializer):
    customer_lat = serializers.FloatField(source="customer.customer_location.latitude", read_only=True)
    customer_lng = serializers.FloatField(source="customer.customer_location.longitude", read_only=True)
    customer_name = serializers.CharField(source="customer.user.username", read_only=True)
    customer_phone = serializers.CharField(source="customer.user.phone", read_only=True)
    provider_name = serializers.CharField(source="service_provider.user.kyc.name", read_only=True)

    provider_phone = serializers.CharField(source="service_provider.phone", read_only=True)
    # Change this line in BookingSerializer:
    provider_photo = serializers.ImageField(source="service_provider.user.kyc.photo", read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            "id",
            "customer",
            "customer_name",
            "customer_phone",
            "service_provider",
            "provider_name",
            "provider_phone",
            "provider_photo",
            "service_type",
            "booking_date",
            "status",
            "provider_availability",
            "customer_lat",
            "customer_lng",
        ]
        read_only_fields = ["id", "customer", "booking_date", "status"]

    def create(self, validated_data):
        validated_data["booking_date"] = timezone.now()
        validated_data["status"] = "pending"
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "sender",
            "sender_role",
            "recipient",
            "recipient_role",
            "message",
            "booking_id",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "is_read"]