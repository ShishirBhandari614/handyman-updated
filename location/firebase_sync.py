from firebase_admin import db
from ratings.models import ServiceProviderAvgRating

def update_provider_in_firebase(location):
    service_provider = location.service_provider
    user = service_provider.user
    kyc = getattr(user, "kyc", None)

    try:
        rating_obj = ServiceProviderAvgRating.objects.get(user=user)
        avg_rating = rating_obj.average_rating
        profile_picture_url = rating_obj.profile_picture.url if rating_obj.profile_picture else None
    except ServiceProviderAvgRating.DoesNotExist:
        avg_rating = None
        profile_picture_url = None

    ref = db.reference(f"service_providers/{service_provider.id}")

    ref.set({
        "id": service_provider.id,
        "name": user.username,
        "phone": service_provider.phone,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "is_online": location.is_online,
        "service_type": kyc.service_type if kyc else None,
        "work_type": kyc.woork_type if kyc else None,
        "photo_url": kyc.photo.url if kyc and kyc.photo else None,
        "average_rating": avg_rating,
        "profile_picture_url": profile_picture_url,
    })
