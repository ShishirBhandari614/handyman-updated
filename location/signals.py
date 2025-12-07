import firebase_admin
from firebase_admin import credentials, db
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ServiceProviderLocation
from ratings.models import ServiceProviderAvgRating
from location.models import CustomerLocation
from django.core.cache import cache  # Optional: Use cache to store distances for quick access
from dijkastras.views import haversine_distance  # Assuming this function is defined in your views

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(r"finalsemproject\config\serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://finalsemproject1-83e7e-default-rtdb.asia-southeast1.firebasedatabase.app'
    })

@receiver(post_save, sender=ServiceProviderLocation)
def update_service_provider_status(sender, instance, **kwargs):
    """Updates service provider's real-time status in Firebase, including distance, rating, service type, and work type."""
    try:
        # Get average rating for the service provider
        rating = ServiceProviderAvgRating.objects.get(user=instance.service_provider.user).average_rating
    except ServiceProviderAvgRating.DoesNotExist:
        rating = 0  # Default rating if no rating exists

    # Get the first available customer (or modify based on your logic)
    customer_location = CustomerLocation.objects.first()  # Replace this with actual logic
    if not customer_location:
        print("⚠️ No customer location found.")
        return

    # Fetch pre-calculated distance from cache
    cache_key = f"distance_{instance.service_provider.user.id}_{customer_location.customer.user.id}"
    distance = cache.get(cache_key)  # Retrieve from cache if available

    if distance is None:
        distance = haversine_distance(
            customer_location.latitude, customer_location.longitude,
            instance.latitude, instance.longitude
        )
        cache.set(cache_key, distance, timeout=300)  # Store in cache for 5 minutes

    # Get the service type and work type from KYC (assuming they're stored there)
    try:
        service_type = instance.service_provider.user.kyc.service_type  # Extract the service type
        is_verified= instance.service_provider.user.kyc.is_verified
        woork_type = instance.service_provider.user.kyc.woork_type  # Extract the work type
    except AttributeError:
        service_type = "Unknown"
        woork_type = "Unknown"

    # Prepare provider data for Firebase update
    provider_data = {
        'name': instance.service_provider.user.kyc.name,
        'latitude': instance.latitude,
        'longitude': instance.longitude,
        'is_online': instance.is_online,
        'is_verified':is_verified,
        'photo_url': instance.service_provider.user.kyc.photo.url if instance.service_provider.user.kyc.photo else "",
        'phone': instance.service_provider.phone,
        'rating': round(rating, 2),  # Round to 2 decimal places
        'distance': round(distance, 2),  # Add distance to Firebase
        'service_type': service_type,  # Include the service type
        'woork_type': woork_type  # Include the work type
    }

    # Update Firebase with the new provider data
    ref = db.reference(f'search-service/{instance.service_provider.user.id}')
    try:
        if instance.is_online:
            ref.set(provider_data)  # Add/update provider with rating, distance, service type, and work type
            print(f"✅ Updated Firebase: {provider_data}")
        else:
            ref.update({'is_online': False})  # Update provider status to offline instead of deleting
            print(f"❌ Provider {instance.service_provider.user.id} marked as offline in Firebase")
    except Exception as e:
        print(f"Error updating Firebase: {e}")
