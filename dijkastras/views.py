# dijkastras/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from location.models import CustomerLocation, ServiceProviderLocation
from ratings.models import ServiceProviderAvgRating
from .serializers import ServiceProviderSerializer
from math import radians, sin, cos, sqrt, atan2
from django.shortcuts import render

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

class SearchServiceProvidersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        service_type = request.GET.get("service_type")
        provider_id = request.GET.get("provider_id")

        if not service_type:
            return Response({"error": "service_type is required"}, status=400)

        customer = request.user.customer
        customer_location = CustomerLocation.objects.get(customer=customer)

        # 1️⃣ Base queryset FIRST
        providers = ServiceProviderLocation.objects.filter(
            service_provider__user__kyc__service_type__icontains=service_type,
            service_provider__user__kyc__is_verified=True
        )

        # 2️⃣ Gatekeeping for Firebase single-provider check
        if provider_id:
            providers = providers.filter(service_provider_id=provider_id)

        results = []

        for p in providers:
            p.refresh_from_db()
            
            sp = p.service_provider
            user = sp.user
            kyc = user.kyc

            avg_obj = ServiceProviderAvgRating.objects.filter(user=user).first()
            avg_rating = avg_obj.average_rating if avg_obj else 0

            distance = haversine_distance(
                customer_location.latitude,
                customer_location.longitude,
                p.latitude,
                p.longitude
            )

            # 🚧 2 KM HARD GATE
            if distance > 2:
                continue

            results.append({
                "id": sp.id,   # MUST match Firebase provider.id
                "name": user.username,
                "phone": sp.phone,
                "is_online": p.is_online,
                "service_type": kyc.service_type,
                "work_type": kyc.woork_type,
                "photo_url": kyc.photo.url if kyc.photo else None,
                "average_rating": avg_rating,
                "distance": round(distance, 2),
            })

        # Online → Rating → Distance
        results.sort(
            key=lambda x: (not x["is_online"], -x["average_rating"], x["distance"])
        )

        return Response({"providers": results})


def search_results(request):
    return render(request, 'search_results.html')