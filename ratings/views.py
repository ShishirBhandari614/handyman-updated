import json
from django.db import models
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.utils.timezone import now
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

# REST Framework imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# App-specific imports
from .models import Booking, Rating, ServiceProviderAvgRating, Cancellation
from userauth.models import Customer, ServiceProvider
from .serializers import BookingSerializer, NotificationSerializer
from SMS.utils import send_sms
from ratings.utils import push_booking_update, push_firebase_notification


# --- Views ---

# @login_required
# def viewprofile(request):
#     user = request.user 

#     if request.method == "POST":
#         try:
#             return JsonResponse({
#                 "success": True,
#                 "message": "Booking processed successfully!"
#             })
#         except Exception as e:
#             return JsonResponse({"success": False, "message": str(e)}, status=500)

#     elif request.method == "GET":
#         service_type = request.GET.get('service_type')
#         service_provider_id = request.GET.get('user_id')
#         profile = request.GET.get('profile')
#         customer_id = request.GET.get('customer_id') 

#         is_customer = Customer.objects.filter(user=user).exists()
#         is_service_provider = ServiceProvider.objects.filter(user=user).exists()

#         try:
#             if is_customer:
#                 customer = get_object_or_404(Customer, user=user)
#                 if not service_provider_id:
#                     return JsonResponse({"success": False, "message": "Service Provider ID is missing."}, status=400)

#                 service_provider = get_object_or_404(ServiceProvider, user_id=service_provider_id)
#                 booking = Booking.objects.filter(
#                     customer=customer,
#                     service_provider=service_provider,
#                     service_type=service_type,
#                     status='pending'
#                 ).order_by('-booking_date').first()

#                 context = {
#                     "booking_date": booking.booking_date.strftime("%Y-%m-%d %H:%M:%S") if booking else "N/A",
#                     "booking_id": booking.id if booking else None,
#                     "status": booking.status if booking else "no_pending",
#                     "user_id": service_provider.user.id,
#                     "phone_number": service_provider.phone,
#                     "customer_name": customer.user.username,
#                     "customer_phone": customer.phone,
#                     "service_type": service_type,
#                     "service_provider_name": getattr(service_provider.user.kyc, 'name', "") if hasattr(service_provider.user, 'kyc') else "",
#                     "profile": profile or (service_provider.profile_picture.url if service_provider.profile_picture else ""),
#                     "customer_id": customer.id
#                 }

#             elif is_service_provider:
#                 service_provider = get_object_or_404(ServiceProvider, user=user)
#                 if customer_id:
#                     customer = get_object_or_404(Customer, user_id=customer_id)
#                     booking = Booking.objects.filter(
#                         customer=customer,
#                         service_provider=service_provider,
#                         service_type=service_type,
#                         status='pending'
#                     ).order_by('-booking_date').first()

#                     context = {
#                         "booking_date": booking.booking_date.strftime("%Y-%m-%d %H:%M:%S") if booking else "N/A",
#                         "booking_id": booking.id if booking else None,
#                         "status": booking.status if booking else "no_pending",
#                         "user_id": customer.user.id,
#                         "phone_number": customer.phone,
#                         "customer_name": customer.user.username,
#                         "customer_phone": customer.phone,
#                         "service_type": service_type,
#                         "service_provider_name": getattr(service_provider.user.kyc, 'name', "") if hasattr(service_provider.user, 'kyc') else "",
#                         "profile": profile or (customer.profile_picture.url if customer.profile_picture else ""),
#                         "customer_id": customer.id
#                     }
#                 else:
#                     context = {
#                         "status": "no_customer_id",
#                         "message": "No customer data available.",
#                         "service_provider_name": getattr(service_provider.user.kyc, 'name', "") if hasattr(service_provider.user, 'kyc') else "",
#                     }
#             else:
#                 return JsonResponse({"success": False, "message": "Unauthorized access."}, status=403)

#             return render(request, "ORDR.html", context)

#         except Customer.DoesNotExist:
#             return JsonResponse({"success": False, "message": "Customer profile not found."}, status=404)

#     return JsonResponse({"success": False, "message": "Invalid request method."}, status=405)


# def submit_rating(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             customer = get_object_or_404(Customer, id=data.get('customer_id'))
#             service_provider = get_object_or_404(ServiceProvider, user_id=data.get('service_provider_id'))
#             booking = get_object_or_404(Booking, id=data.get('booking_id'))

#             if booking.status != 'completed':
#                 booking.status = 'completed'
#                 booking.save()

#             Rating.objects.create(
#                 customer=customer,
#                 service_provider=service_provider,
#                 booking=booking,
#                 rating_value=data.get('rating_value'),
#             )

#             avg_val = Rating.objects.filter(service_provider=service_provider).aggregate(models.Avg('rating_value'))['rating_value__avg']
            
#             avg_record, _ = ServiceProviderAvgRating.objects.get_or_create(user=service_provider.user)
#             avg_record.average_rating = avg_val
#             avg_record.save()

#             service_provider.average_rating = avg_val
#             service_provider.save()

#             return JsonResponse({"success": True, "average_rating": avg_val}, status=201)
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)
#     return JsonResponse({"error": "Method not allowed"}, status=405)


# def booking_history(request):
#     """Note: You had two versions of this view. This one renders the history list."""
#     customer = request.user.customer
#     bookings = Booking.objects.filter(customer=customer).order_by('-booking_date')

#     for booking in bookings:
#         avg_rating = ServiceProviderAvgRating.objects.filter(user=booking.service_provider.user).first()
#         booking.avg_rating = avg_rating.average_rating if avg_rating else 0.0

#     return render(request, 'booking_history.html', {'bookings': bookings})


# @csrf_exempt
# def cancel_booking(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             booking = get_object_or_404(Booking, id=data.get('booking_id'))
#             service_provider = get_object_or_404(ServiceProvider, user_id=data.get('service_provider_id'))
#             customer = get_object_or_404(Customer, id=data.get('customer_id'))

#             booking.status = 'canceled'
#             booking.save()

#             Cancellation.objects.create(
#                 booking=booking, customer=customer,
#                 service_provider=service_provider,
#                 reason=data.get('reason'), canceled_at=now()
#             )

#             msg = f"Dear {service_provider.user.kyc.name}, booking with {customer.user.username} canceled. Reason: {data.get('reason')}"
#             sms_res = send_sms(data.get('phone_number'), msg)

#             if sms_res.get("success"):
#                 return JsonResponse({"success": True, "message": "Canceled. SMS sent!"})
#             return JsonResponse({"success": False, "message": "Canceled, SMS failed."}, status=400)

#         except Exception as e:
#             return JsonResponse({"success": False, "message": str(e)}, status=500)
#     return JsonResponse({"success": False}, status=405)


class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            availability = "online" if request.data.get("is_online") else "offline"
            booking = serializer.save(
                customer=request.user.customer,
                provider_availability=availability,
                booking_date=timezone.now(),
                status="pending"
            )
            push_booking_update(booking)

            # Notification
            create_notification(
                sender=request.user,
                recipient=booking.service_provider.user,
                message=f"Your booking has been requested by {request.user.username}",
                booking=booking
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class UserBookingsByStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.is_customer:
            try:
                queryset = Booking.objects.filter(customer=user.customer)
            except Exception:
                return Response({"error": "Customer profile not found"}, status=400)

        elif user.is_ServiceProvider:
            try:
                queryset = Booking.objects.filter(service_provider=user.serviceprovider)
            except Exception:
                return Response({"error": "Service provider profile not found"}, status=400)

        else:
            return Response({"error": "Unauthorized role"}, status=403)

        serializer = BookingSerializer(queryset, many=True)

        response = {}
        for booking in serializer.data:
            status = booking["status"]
            response.setdefault(status, []).append(booking)
        
        print(response)

        return Response(response)


def create_notification(*, sender, recipient, message, booking):
    sender_role = "service_provider" if sender.is_ServiceProvider else "customer"
    recipient_role = "service_provider" if recipient.is_ServiceProvider else "customer"
    # 1️⃣ Save to DB via serializer
    serializer = NotificationSerializer(
        data={
            "sender": sender.id,
            "sender_role": sender_role,
            "recipient": recipient.id,
            "recipient_role": recipient_role,   
            "message": message,
            "booking_id": booking.id
        }
    )
    serializer.is_valid(raise_exception=True)
    notification = serializer.save()
    # 2️⃣ Push to Firebase
    push_firebase_notification(
        recipient.id,
        {
            "message": notification.message,
            "booking_id": notification.booking_id,
            "notification_id": notification.id,
            "sender_id": sender.id,
            "sender_role": sender_role,
            "recipient_id": recipient.id,
            "recipient_role": recipient_role,
        }
    )

    return notification

def viewbooking(request):
    return render(request, 'boooking_detail.html')

class UpdateBookingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        new_status = request.data.get("status")
        if not new_status:
            return Response({"error": "Status required"}, status=400)

        booking = get_object_or_404(Booking, id=booking_id)
        booking.status = new_status
        booking.save()

        push_booking_update(booking)

        # Booking-specific notification
        if request.user.is_ServiceProvider:
            recipient = booking.customer.user
            message = f"Your booking has been {new_status} by the service provider"
        else:
            recipient = booking.service_provider.user
            message = f"Booking status updated to {new_status} by customer"

        create_notification(
            sender=request.user,
            recipient=recipient,
            message=message,
            booking=booking
        )

        return Response({"id": booking.id, "status": booking.status})



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_detail(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)
    serializer = BookingSerializer(booking)
    return Response(serializer.data)


class CreateNotificationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = NotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 1️⃣ Save to DB
        notification = serializer.save()

        # 2️⃣ Push to Firebase
        push_firebase_notification(
            notification.recipient.id,
            {
                "message": notification.message,
                "booking_id": notification.booking_id,
                "notification_id": notification.id,
            }
        )

        return Response(
            {
                "message": "Notification created",
                "notification": NotificationSerializer(notification).data,
            },
            status=status.HTTP_201_CREATED,
        )

def service_booking_details(request):
    return render(request,'service_booking_details.html')