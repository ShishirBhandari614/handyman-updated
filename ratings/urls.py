from django.urls import path
from ratings.views import *
app_name='ratings'

urlpatterns = [
    path('viewprofile/', viewprofile, name='viewprofile'), 
    path('submit-rating/', submit_rating, name='submit_rating'),
    path('booking-history/', booking_history, name='booking_history'),
    path('view-booking/', viewbooking, name='view_booking'),
    path("cancel-booking/", cancel_booking, name="cancel_booking"),

    # path('submit-cancellation/', submit_cancellation, name='submit_cancellation'),  
]