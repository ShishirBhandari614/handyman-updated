from django.shortcuts import render, redirect
from rest_framework.parsers import JSONParser
from rest_framework import generics 
import json
from django.urls import reverse
from django.http import JsonResponse
from rest_framework.response import Response,SimpleTemplateResponse
from userauth.serializer import Userserializer, CustomerSignupSerializer, ServiceProviderSignupSerializer
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from rest_framework.exceptions import AuthenticationFailed
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.http import HttpResponseForbidden
from kycverification.models import KYC
from django.contrib import messages
from location.models import ServiceProviderLocation

class CustomerAuthenticationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return render(request, 'customer.html')

    def post(self, request):
        action = request.data.get('action')
        print(action)
        if action not in ['signup', 'login']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'signup':
            serializer = CustomerSignupSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Signup successful'}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif action == 'login':
            username = request.data.get('username')
            password = request.data.get('password')
            print(username, password)
            
            # Check if both username and password are provided
            if not username or not password:
                return Response({'error': 'Both username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    return Response({'error': 'User account is inactive'}, status=status.HTTP_403_FORBIDDEN)
                
                if not user.is_customer:
                    return Response({'error': 'User is not registered as a customer'}, status=status.HTTP_403_FORBIDDEN)

                login(request, user)
                token, _ = Token.objects.get_or_create(user=user)
                return Response({'token': token.key, 'username': user.username}, status=status.HTTP_200_OK)

            # If authentication fails
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
              
#  authenticationFailed('Invalid username or password') 
    
               
 
        
class ServiceProviderAuthenticationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return render(request, 'serviceprovider.html')

    def post(self, request):
        action = request.data.get('action')
        print(action)
        if action not in ['signup', 'login']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'signup':
            serializer = ServiceProviderSignupSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Signup successful'}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif action == 'login':
            username = request.data.get('username')
            password = request.data.get('password')
            
            # Check if both username and password are provided
            if not username or not password:
                return Response({'error': 'Both username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    return Response({'error': 'User account is inactive'}, status=status.HTTP_403_FORBIDDEN)
                
                if not user.is_ServiceProvider:
                    return Response({'error': 'User is not registered as a Service Provider'}, status=status.HTTP_403_FORBIDDEN)


                login(request, user)
                token, _ = Token.objects.get_or_create(user=user)
                return Response({'token': token.key, 'username': user.username}, status=status.HTTP_200_OK)

            # If authentication fails
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@method_decorator(login_required, name='dispatch')
class customerdashboard(View):
    def get(self, request):
        """
        View to render the customer dashboard.
        """
        if not request.user.is_customer:
            return HttpResponseForbidden("Access Denied: You are not a customer.")

        context = {
            'username': request.user.username,
            'phone': request.user.phone,
        }
        return render(request, 'customerdas.html', context)

        
@method_decorator(login_required, name='dispatch')
class ServiceProviderDashboardView(View):
    def get(self, request):
        # Ensure the user is a service provider
        if not request.user.is_ServiceProvider:
            return HttpResponseForbidden("Access Denied: You are not a service provider.")

        # KYC Logic
        try:
            kyc = KYC.objects.get(service_provider=request.user)
            if kyc.is_verified:
                kyc_message = "KYC Verified"
                kyc_link = None  # Hide KYC link if verified
            else:
                kyc_message = "Waiting for KYC Verification"
                kyc_link = "Update KYC"
        except KYC.DoesNotExist:
            kyc_message = "KYC Form Not Submitted"
            kyc_link = "Submit KYC"

        # Context for rendering the dashboard
        context = {
            'username': request.user.username,
            'email': request.user.email,
            'kyc_message': kyc_message,  # Pass the KYC message to the template
            'kyc_link': kyc_link,  # Dynamic KYC link
        }

        return render(request, 'servicedas.html', context)


# Redirect after login based on user type
def dashboard_view(request):
    
    user = request.user

    if user.is_customer:
        return redirect('/customerdashboard/')  # Redirect to customer dashboard
    elif user.is_ServiceProvider:
        return redirect('/serviceproviderdashboard/')  # Redirect to service provider dashboard
    else:
        return HttpResponseForbidden("Access Denied: You do not have access to any dashboard.")
    
    


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = request.auth  
            print(f'Token received: {token}')  
            
            # If token exists, delete it
            if token:
                token.delete()
                if hasattr(request.user, 'serviceprovider'):
                    service_provider = request.user.serviceprovider
                    ServiceProviderLocation.objects.filter(service_provider=service_provider).update(is_online=False)
                    print(f"Service provider {service_provider.user.username} status set to offline.")
                logout(request)
                return Response({'message': 'Logout successful.'}, status=200)
            else:
                return Response({'message': 'Token not found.'}, status=400)

        except Exception as e:
            return Response({'message': 'Logout failed. Please try again.', 'error': str(e)}, status=400)
        
@login_required
@csrf_exempt  
def update_phone_number(request):
    user = request.user 

    if request.method == 'POST':
        new_phone = request.POST.get('new_phone') 

        if new_phone and new_phone.isdigit() and len(new_phone) == 10: 
            user.phone = new_phone
            user.save()

            if hasattr(user, 'serviceprovider'):
                user.serviceprovider.phone = new_phone
                user.serviceprovider.save()

            messages.success(request, 'Phone number updated successfully.')
            return redirect('/settings/change-phone-number/')  
        else:
            messages.error(request, 'Invalid phone number. Please enter a valid 10-digit number.')

    return render(request, 'chngphno.html')