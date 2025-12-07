# from django.shortcuts import render
# from django.views.decorators.csrf import csrf_exempt, csrf_protect
# from django.http import JsonResponse
# from django.contrib.auth.decorators import login_required
# from userauth.models import ServiceProvider

# import json
# from location.models import CustomerLocation, ServiceProviderLocation
# @login_required
# def save_location(request):
#     if request.method == 'POST':
       
#         data = json.loads(request.body)
#         user_type = data.get('user_type')
#         latitude = data.get('latitude')
#         longitude = data.get('longitude')
#         if user_type == 'customer':
           
#             if hasattr(request.user, 'customer'):
#                 customer = request.user.customer
                
#                 CustomerLocation.objects.update_or_create(
#                     customer=customer,
#                     defaults={'latitude': latitude, 'longitude': longitude},
#                 )
#                 return JsonResponse({'message': 'Customer location updated.'}, status=200)
#             else:
#                 print(f"User {request.user} is not associated with a customer.")
#                 return JsonResponse({'error': 'Unauthorized access. No customer found.'}, status=400)

#         elif user_type == 'service_provider':
#             if hasattr(request.user, 'serviceprovider'):
#                 service_provider = request.user.serviceprovider
#                 ServiceProviderLocation.objects.update_or_create(
#                     service_provider=service_provider,
#                     defaults={'latitude': latitude, 'longitude': longitude},
#                 )
#                 return JsonResponse({'message': 'Service provider location updated.'}, status=200)
#             else:
#                 print(f"User {request.user} is not associated with a service provider.")
#                 return JsonResponse({'error': 'Unauthorized access. No service provider found.'}, status=400)

#         return JsonResponse({'error': 'Invalid user type or unauthorized access.'}, status=400)

#     return JsonResponse({'error': 'Invalid request method.'}, status=400)



# @login_required
# def update_status(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         is_online = data.get('is_online')
        
#         if hasattr(request.user, 'serviceprovider'):
#             service_provider = request.user.serviceprovider
            
#             # Update the 'is_online' field
#             service_provider_location, created = ServiceProviderLocation.objects.update_or_create(
#                 service_provider=service_provider,
#                 defaults={'is_online': is_online}
#             )

#             return JsonResponse({'message': 'Service provider status updated.'}, status=200)

#         return JsonResponse({'error': 'User is not a service provider.'}, status=400)

#     return JsonResponse({'error': 'Invalid request method.'}, status=400)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import CustomerLocation, ServiceProviderLocation
from .serializers import CustomerLocationSerializer, ServiceProviderLocationSerializer


class SaveLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_type = request.data.get("user_type")
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        if user_type == "customer":
            if hasattr(request.user, "customer"):
                customer = request.user.customer
                obj, created = CustomerLocation.objects.update_or_create(
                    customer=customer,
                    defaults={"latitude": latitude, "longitude": longitude},
                )
                serializer = CustomerLocationSerializer(obj)
                return Response({"message": "Customer location updated.", "data": serializer.data}, status=status.HTTP_200_OK)
            return Response({"error": "Unauthorized access. No customer found."}, status=status.HTTP_400_BAD_REQUEST)

        elif user_type == "service_provider":
            if hasattr(request.user, "serviceprovider"):
                service_provider = request.user.serviceprovider
                obj, created = ServiceProviderLocation.objects.update_or_create(
                    service_provider=service_provider,
                    defaults={"latitude": latitude, "longitude": longitude},
                )
                serializer = ServiceProviderLocationSerializer(obj)
                return Response({"message": "Service provider location updated.", "data": serializer.data}, status=status.HTTP_200_OK)
            return Response({"error": "Unauthorized access. No service provider found."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Invalid user type or unauthorized access."}, status=status.HTTP_400_BAD_REQUEST)


class UpdateStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        is_online = request.data.get("is_online")

        if hasattr(request.user, "serviceprovider"):
            service_provider = request.user.serviceprovider
            obj, created = ServiceProviderLocation.objects.update_or_create(
                service_provider=service_provider,
                defaults={"is_online": is_online},
            )
            serializer = ServiceProviderLocationSerializer(obj)
            return Response({"message": "Service provider status updated.", "data": serializer.data}, status=status.HTTP_200_OK)

        return Response({"error": "User is not a service provider."}, status=status.HTTP_400_BAD_REQUEST)