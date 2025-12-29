from django.contrib import admin
from .models import Booking, Rating, ServiceProviderAvgRating

# Register the Booking model if it's not already registered
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('customer', 'service_provider', 'service_type', 'booking_date', 'status', 'provider_availability')
    list_filter = ('status', 'provider_availability')
    search_fields = ('customer__user__username', 'service_provider__user__username', 'service_type')

# Register the ServiceProviderAvgRating model
@admin.register(ServiceProviderAvgRating)
class ServiceProviderAvgRatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'average_rating', 'profile_picture')  # Customize the fields you want to display
    search_fields = ('user__username',)  # Enable search by username
