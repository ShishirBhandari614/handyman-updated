from rest_framework import serializers
from .models import KYC

class KYCSerializer(serializers.ModelSerializer):
    # Accept service_type as a string (comma-separated) or list
    service_type = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = KYC
        fields = [
            "id",
            "service_provider",
            "name",
            "address",
            "service_type",
            "woork_type",
            "citizenship_number",
            "photo",
            "citizenship_photo",
            "training_certificate",
            "is_verified",
            "submitted_at",
        ]
        read_only_fields = ["service_provider", "is_verified", "submitted_at"]

    def create(self, validated_data):
        # Handle service_type - convert list to comma-separated string if needed
        if 'service_type' in validated_data:
            service_type = validated_data['service_type']
            if isinstance(service_type, list):
                validated_data['service_type'] = ', '.join(service_type)
        
        # Handle woork_type - ensure it's a string (can contain multiple values like "Hourly - Rs 300, One Time - Rs 1000")
        if 'woork_type' in validated_data:
            woork_type = validated_data['woork_type']
            if isinstance(woork_type, list):
                validated_data['woork_type'] = ', '.join(woork_type)
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Only update photos if new file is provided, otherwise exclude from update
        if 'photo' in validated_data and not validated_data['photo']:
            validated_data.pop('photo')
        if 'citizenship_photo' in validated_data and not validated_data['citizenship_photo']:
            validated_data.pop('citizenship_photo')
        if 'training_certificate' in validated_data and not validated_data['training_certificate']:
            validated_data.pop('training_certificate')
        
        # Handle service_type - convert list to comma-separated string if needed
        if 'service_type' in validated_data:
            service_type = validated_data['service_type']
            if isinstance(service_type, list):
                validated_data['service_type'] = ', '.join(service_type)
            elif isinstance(service_type, str):
                # Already a string, keep as is
                pass
        
        # Handle woork_type - ensure it's a string (can contain multiple values)
        if 'woork_type' in validated_data:
            woork_type = validated_data['woork_type']
            if isinstance(woork_type, list):
                validated_data['woork_type'] = ', '.join(woork_type)

        return super().update(instance, validated_data)
