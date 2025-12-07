from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from .models import Booking,Rating,ServiceProviderAvgRating
from userauth.models import Customer, ServiceProvider  # Import related models
import json
from django.db import models
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from userauth.models import ServiceProvider, Customer
from ratings.models import Booking, Cancellation
from SMS.utils import send_sms
from django.utils.timezone import now
import json

from django.contrib.auth.decorators import login_required


from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
import json


from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
# from .models import Customer, ServiceProvider, Booking

@login_required
def viewprofile(request):
    context = {}
    user = request.user  # Logged-in user

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            return JsonResponse({
                "success": True,
                "message": "Booking processed successfully!"
            })
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)

    elif request.method == "GET":
        # Extract query parameters
        service_type = request.GET.get('service_type')
        service_provider_id = request.GET.get('user_id')
        phone_number = request.GET.get('phone_number')
        customer_phone = request.GET.get('customer_phone')
        profile = request.GET.get('profile')
        customer_id = request.GET.get('customer_id')  # ✅ Now optional

        # Check if the logged-in user is a Customer or Service Provider
        is_customer = Customer.objects.filter(user=user).exists()
        is_service_provider = ServiceProvider.objects.filter(user=user).exists()

        try:
            if is_customer:
                # User is a Customer → Show Service Provider details
                customer = get_object_or_404(Customer, user=user)

                if not service_provider_id:
                    return JsonResponse({"success": False, "message": "Service Provider ID is missing."}, status=400)

                service_provider = get_object_or_404(ServiceProvider, user_id=service_provider_id)

                # Fetch latest pending booking
                booking = Booking.objects.filter(
                    customer=customer,
                    service_provider=service_provider,
                    service_type=service_type,
                    status='pending'
                ).order_by('-booking_date').first()  # Use .first() instead of .latest() to prevent exceptions

                context = {
                    "booking_date": booking.booking_date.strftime("%Y-%m-%d %H:%M:%S") if booking else "N/A",
                    "booking_id": booking.id if booking else None,
                    "status": booking.status if booking else "no_pending",
                    "user_id": service_provider.user.id,
                    "phone_number": service_provider.phone,  # Fixed
                    "customer_name": customer.user.username,
                    "customer_phone": customer.phone,  # Fixed
                    "service_type": service_type,
                    "service_provider_name": service_provider.user.kyc.name if hasattr(service_provider.user, 'kyc') else "",
                    "profile": profile or (service_provider.profile_picture.url if service_provider.profile_picture else ""),
                    "customer_id": customer.id
                }
                print("Customer Context:", context)

            elif is_service_provider:
                # ✅ Only fetch customer if customer_id is provided
                service_provider = get_object_or_404(ServiceProvider, user=user)

                if customer_id:
                    customer = get_object_or_404(Customer, user_id=customer_id)

                    # Fetch latest pending booking
                    booking = Booking.objects.filter(
                        customer=customer,
                        service_provider=service_provider,
                        service_type=service_type,
                        status='pending'
                    ).order_by('-booking_date').first()  # Use .first() instead of .latest()

                    context = {
                        "booking_date": booking.booking_date.strftime("%Y-%m-%d %H:%M:%S") if booking else "N/A",
                        "booking_id": booking.id if booking else None,
                        "status": booking.status if booking else "no_pending",
                        "user_id": customer.user.id,
                        "phone_number": customer.phone,  
                        "customer_name": customer.user.username,
                        "customer_phone": customer.phone,  
                        "service_type": service_type,
                        "service_provider_name": service_provider.user.kyc.name if hasattr(service_provider.user, 'kyc') else "",
                        "profile": profile or (customer.profile_picture.url if customer.profile_picture else ""),
                        "customer_id": customer.id
                    }
                else:
                    context = {
                        "status": "no_customer_id",
                        "message": "No customer data available.",
                        "service_provider_name": service_provider.user.kyc.name if hasattr(service_provider.user, 'kyc') else "",
                    }
                    print("Service Provider Context without Customer ID:", context)

            else:
                return JsonResponse({"success": False, "message": "Unauthorized access."}, status=403)

        except Customer.DoesNotExist:
            return JsonResponse({"success": False, "message": "Customer profile not found."}, status=404)

        return render(request, "ORDR.html", context)

    else:
        return JsonResponse({"success": False, "message": "Invalid request method."}, status=405)



import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db import models
# from .models import Customer, ServiceProvider, Booking, Rating, ServiceProviderAvgRating

def submit_rating(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Extract the necessary fields
            customer_id = data.get('customer_id')
            service_provider_id = data.get('service_provider_id')
            booking_id = data.get('booking_id')
            rating_value = data.get('rating_value')

            print("Customer ID:", customer_id)

            # Fetch customer, service provider, and booking
            customer = get_object_or_404(Customer, id=customer_id)
            service_provider = get_object_or_404(ServiceProvider, user_id=service_provider_id)
            booking = get_object_or_404(Booking, id=booking_id)

            # Check if the booking is completed
            if booking.status != 'completed':
                booking.status = 'completed'
                booking.save()

            # Create the rating
            rating = Rating.objects.create(
                customer=customer,
                service_provider=service_provider,
                booking=booking,
                rating_value=rating_value,
            )

            # Calculate and update the service provider's average rating
            average_rating = Rating.objects.filter(service_provider=service_provider).aggregate(models.Avg('rating_value'))['rating_value__avg']
            
            service_provider_avg_rating, created = ServiceProviderAvgRating.objects.get_or_create(user=service_provider.user)
            service_provider_avg_rating.average_rating = average_rating
            service_provider_avg_rating.save()

            # Save the updated rating on the service provider
            service_provider.average_rating = average_rating
            service_provider.save()

            return JsonResponse({
                "success": True,
                "message": "Rating submitted successfully!",
                "average_rating": average_rating
            }, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    # ✅ Handle GET and other request methods properly
    return JsonResponse({"error": "Invalid request method. Use POST instead."}, status=405)

        
def booking_history(request):
    customer = request.user.customer
    bookings = Booking.objects.filter(customer=customer).prefetch_related('rating_set').order_by('-booking_date')

    # Annotate each booking with the average rating of the service provider
    for booking in bookings:
        service_provider = booking.service_provider
        # Fetch the average rating from the ServiceProviderAvgRating model
        avg_rating = ServiceProviderAvgRating.objects.filter(user=service_provider.user).first()

        # Add the average rating to the booking object (this will make it accessible in the template)
        booking.avg_rating = avg_rating.average_rating if avg_rating else 0.0

    return render(request, 'booking_history.html', {'bookings': bookings})

# @csrf_exempt
# def submit_cancellation(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         booking_id = data.get('booking_id')
#         reason = data.get('reason')

#         # Get the booking object
#         try:
#             booking = Booking.objects.get(id=booking_id)
#         except Booking.DoesNotExist:
#             return JsonResponse({'success': False, 'message': 'Booking not found.'}, status=400)

#         # Create the cancellation record
#         Cancellation.objects.create(
#             booking=booking,
#             reason=reason
#         )

        # # Update the booking status to canceled
        # booking.status = 'canceled'
        # booking.save()

        # return JsonResponse({'success': True})
def viewbooking(request):
    return render(request, "viewbooking.html")



@csrf_exempt
def cancel_booking(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("Received cancellation data:", data)

            booking_id = data.get('booking_id')
            service_provider_id = data.get('service_provider_id')
            phone_number = data.get('phone_number')
            customer_id = data.get('customer_id')
            reason = data.get('reason')
            print(booking_id)
            print(service_provider_id)
            print(phone_number)
            print(reason)

            if not booking_id or not service_provider_id or not customer_id or not reason:
                return JsonResponse({"success": False, "message": "Missing required fields."}, status=400)

            # Get booking, service provider, and customer
            booking = get_object_or_404(Booking, id=booking_id)
            service_provider = get_object_or_404(ServiceProvider, user_id=service_provider_id)
            customer = get_object_or_404(Customer, id=customer_id)
            print(booking)
            print(customer)

            # Update booking status to "canceled"
            booking.status = 'canceled'
            booking.save()

            # Save cancellation reason
            Cancellation.objects.create(
                booking=booking,
                customer=customer,
                service_provider=service_provider,
                reason=reason,
                canceled_at=now()
            )

            # Prepare the cancellation message
            message = (f"Dear {service_provider.user.kyc.name}, your booking with {customer.user.username} "
                       f"has been canceled. Reason: {reason}")

            # Send SMS to service provider and check if it was successful
            sms_response = send_sms(phone_number, message)

            # Check the SMS response for success
            if sms_response.get("success"):
                return JsonResponse({"success": True, "message": "Booking canceled. SMS sent!"})
            else:
                # In case of failure, log the error message from the SMS service
                error_message = sms_response.get("message", "Unknown error")
                return JsonResponse({"success": False, "message": f"Booking canceled, but SMS failed. Error: {error_message}"}, status=400)

        except Exception as e:
            print("Error in cancel_booking view:", str(e))
            return JsonResponse({"success": False, "message": f"An error occurred: {str(e)}"}, status=500)

    return JsonResponse({"success": False, "message": "Invalid request method."}, status=400)
