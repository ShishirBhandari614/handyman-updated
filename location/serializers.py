from rest_framework import serializers
from .models import CustomerLocation, ServiceProviderLocation

class CustomerLocationSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source="customer.user.username", read_only=True)

    class Meta:
        model = CustomerLocation
        fields = ["id", "customer", "customer_username", "latitude", "longitude"]


class ServiceProviderLocationSerializer(serializers.ModelSerializer):
    service_provider_username = serializers.CharField(source="service_provider.user.username", read_only=True)

    class Meta:
        model = ServiceProviderLocation
        fields = ["id", "service_provider", "service_provider_username", "latitude", "longitude", "is_online"]