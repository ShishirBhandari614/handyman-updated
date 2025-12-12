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
        if not service_type:
            return Response({"error": "service_type is required"}, status=400)

        customer = request.user.customer
        customer_location = CustomerLocation.objects.get(customer=customer)

        providers = ServiceProviderLocation.objects.filter(
            service_provider__user__kyc__service_type__icontains=service_type,
            service_provider__user__kyc__is_verified=True
        )

        results = []
        for p in providers:
            sp = p.service_provider
            user = sp.user
            kyc = user.kyc

            avg_obj = ServiceProviderAvgRating.objects.filter(user=user).first()
            avg_rating = avg_obj.average_rating if avg_obj else 0

            distance = haversine_distance(
                customer_location.latitude, customer_location.longitude,
                p.latitude, p.longitude
            )

            results.append({
                "id": sp.id,
                "name": user.username,
                "phone": sp.phone,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "is_online": p.is_online,
                "service_type": kyc.service_type,
                "work_type": kyc.woork_type,
                "photo_url": kyc.photo.url if kyc.photo else None,
                "average_rating": avg_rating,
                "distance": round(distance, 2),
            })

        # Sort online first, then rating, then distance
        results.sort(key=lambda x: (not x["is_online"], -x["average_rating"], x["distance"]))

        serializer = ServiceProviderSerializer(results, many=True)
        return Response(serializer.data)

def search_results(request):
    return render(request, 'search_results.html')