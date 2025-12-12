from rest_framework import serializers
class ServiceProviderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    phone = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    is_online = serializers.BooleanField()
    service_type = serializers.CharField()
    work_type = serializers.CharField()
    photo_url = serializers.CharField(allow_null=True)
    average_rating = serializers.FloatField()
    distance = serializers.FloatField()
