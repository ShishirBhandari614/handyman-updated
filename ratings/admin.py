from django.contrib import admin
from .models import Booking, Notification, Rating, ServiceProviderAvgRating

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

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'sender', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('recipient__username', 'sender__username', 'message')
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected notifications as read"
