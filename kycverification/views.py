
from django.shortcuts import render, redirect
# from django.contrib.auth.decorators import login_required
# from .models import KYC
from django.http import HttpResponseForbidden
# @login_required
# def kyc_form_view(request):
#     if not request.user.is_ServiceProvider:
#         return HttpResponseForbidden("You are not authorized to access this page.")
#     if request.method == "POST":
#         name = request.POST.get("name")
#         address = request.POST.get("address") 
#         photo = request.FILES.get("photo")
#         selected_services = request.POST.getlist("service_type[]")

# # Example: selected_services = ['Carpenter', 'Painter']
#         service_type = ', '.join(selected_services)
#         print(service_type)
#         woork_type = request.POST.get("working_type")
#         print(woork_type)
        
#         citizenship_number = request.POST.get("citizenship_number")
        
#         citizenship_photo = request.FILES.get("citizenship_photo")
#         training_certificate = request.FILES.get("training_certificate")

#         # Save KYC data
#         kyc, created = KYC.objects.get_or_create(service_provider=request.user)
#         kyc.name = name
#         kyc.address = address
#         kyc.service_type = service_type
#         kyc.woork_type = woork_type
        
#         kyc.citizenship_number = citizenship_number
#         kyc.photo = photo
#         kyc.citizenship_photo = citizenship_photo
#         kyc.training_certificate = training_certificate
#         kyc.is_verified = False  # Ensure KYC starts as unverified
#         kyc.save()

#         return render(request, "kycverification.html", {"submitted": True})

#     return render(request, "kycverification.html")

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import KYC
from .serializers import KYCSerializer
from django.http import HttpResponseForbidden
from django.shortcuts import render, redirect



def kyc_form_view(request):
    if not request.user.is_ServiceProvider:
        return HttpResponseForbidden("You are not authorized to access this page.")
    return render(request, "kycverification.html")  

def kyc_update_view(request):
    if not request.user.is_ServiceProvider:
        return HttpResponseForbidden("You are not authorized to access this page.")
    return render(request, "update_kyc.html")  

   
class KYCAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_ServiceProvider:
            return Response({"error": "You are not authorized to access this page."},
                            status=status.HTTP_403_FORBIDDEN)

        # Attach service_provider automatically
        data = request.data.copy()
        data["service_provider"] = request.user.id  

        serializer = KYCSerializer(data=data)
        if serializer.is_valid():
            # Save or update existing KYC
            kyc, created = KYC.objects.get_or_create(service_provider=request.user)
            serializer.update(kyc, serializer.validated_data)
            return Response({"message": "KYC submitted successfully", "submitted": True},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, *args, **kwargs):
        """Update existing KYC"""
        if not request.user.is_ServiceProvider:
            return Response({"error": "You are not authorized to access this page."},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            kyc = request.user.kyc
        except KYC.DoesNotExist:
            return Response({"error": "KYC record does not exist. Please create first."},
                            status=status.HTTP_404_NOT_FOUND)

        # Create a mutable copy of request.data
        data = request.data.copy()
        
        # Remove empty file fields so they don't overwrite existing photos
        # If a file field is empty (no file selected), remove it from data
        # This way the serializer won't try to update it
        # Check if file fields exist and are actually file objects (not empty strings)
        if 'photo' in data:
            photo = data.get('photo')
            if not photo or (hasattr(photo, 'size') and photo.size == 0):
                data.pop('photo')
        if 'citizenship_photo' in data:
            citizenship_photo = data.get('citizenship_photo')
            if not citizenship_photo or (hasattr(citizenship_photo, 'size') and citizenship_photo.size == 0):
                data.pop('citizenship_photo')
        if 'training_certificate' in data:
            training_certificate = data.get('training_certificate')
            if not training_certificate or (hasattr(training_certificate, 'size') and training_certificate.size == 0):
                data.pop('training_certificate')

        serializer = KYCSerializer(kyc, data=data, partial=True)  # partial=True allows updating only some fields
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "KYC updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        """Fetch logged-in user's KYC details"""
        try:
            
            kyc = request.user.kyc
            serializer = KYCSerializer(kyc)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except KYC.DoesNotExist:
            return Response({"error": "No KYC record found"}, status=status.HTTP_404_NOT_FOUND)