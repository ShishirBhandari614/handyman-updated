from django.shortcuts import render
from kycverification.models import KYC
from location.models import CustomerLocation, ServiceProviderLocation
from ratings.models import ServiceProviderAvgRating, Booking
from math import radians, sin, cos, sqrt, atan2
import heapq

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    return R * c
    print(f"Calculated Distance: {distance} km")
    return distance

def dijkstra_algorithm(customer_location, service_providers):
    graph = {}
    for provider in service_providers:
        dist = haversine_distance(
            customer_location.latitude, customer_location.longitude, 
            provider.latitude, provider.longitude
        )
        graph[(provider.latitude, provider.longitude)] = (provider, dist)

    pq = [(0, (customer_location.latitude, customer_location.longitude))]
    visited = set()
    distances = {}

    while pq:
        current_distance, current_location = heapq.heappop(pq)

        if current_location in visited:
            continue

        visited.add(current_location)
        distances[current_location] = current_distance

        for neighbor, (provider, weight) in graph.items():
            if neighbor not in visited:
                heapq.heappush(pq, (current_distance + weight, neighbor))

    sorted_providers = sorted(
        graph.values(), key=lambda x: distances.get((x[0].latitude, x[0].longitude), float('inf'))
    )
    
    return sorted_providers

from django.shortcuts import render


def search_service_providers(request):
    service_type = request.GET.get('service_type')
    print(f"Service Type: {service_type}") 

    customer = request.user.customer
    customer_location = CustomerLocation.objects.get(customer=customer)

    service_providers = ServiceProviderLocation.objects.filter(
        service_provider__user__kyc__service_type__iexact=service_type,  
        service_provider__user__kyc__is_verified=True
    )

    providers_with_ratings_and_distance = []

    for provider_location in service_providers:
        service_provider = provider_location.service_provider
        kyc_info = service_provider.user.kyc 

        
        avg_rating = ServiceProviderAvgRating.objects.filter(user=service_provider.user).first()
        rating = avg_rating.average_rating if avg_rating else 0 

        recent_booking = Booking.objects.filter(service_provider=service_provider).order_by('-booking_date').first()
        status = recent_booking.status if recent_booking else 'pending'

        distance = haversine_distance(
            customer_location.latitude, customer_location.longitude, 
            provider_location.latitude, provider_location.longitude
        )
        print(f"Distance to {service_provider.user.username}: {distance} km") 
        print(f"woork_type for {service_provider.user.username}: {kyc_info.woork_type}") 

        if distance <= 3 and status != 'pending' and status:
            providers_with_ratings_and_distance.append({
                'service_type': service_type,
                'provider_location': provider_location,
                'rating': round(rating, 2),  
                'is_online': provider_location.is_online,
                'distance': round(distance, 2), 
                'status': status,
                'woork_type': kyc_info.woork_type,  
            })

    providers_with_ratings_and_distance.sort(key=lambda x: (x['rating'], x['distance']), reverse=True)

    online_providers = [provider for provider in providers_with_ratings_and_distance if provider['is_online']]
    offline_providers = [provider for provider in providers_with_ratings_and_distance if not provider['is_online']]

    all_providers_sorted = online_providers + offline_providers

    context = {
        'customer_location': customer_location,
        'providers': all_providers_sorted,  
        'service_type': service_type,
        'customer': customer,
        'woork_types': [provider['woork_type'] for provider in all_providers_sorted],  
    }

    return render(request, 'search_results.html', context)
