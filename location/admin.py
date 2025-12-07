from django.contrib import admin

# Register your models here.
from location.models import CustomerLocation, ServiceProviderLocation
@admin.register(CustomerLocation)
class CustomerLocationAdmin(admin.ModelAdmin):
    list_display = ('customer', 'latitude', 'longitude')
    
@admin.register(ServiceProviderLocation)
class ServiceProviderLocationAdmin(admin.ModelAdmin):
    list_display = ('service_provider', 'latitude', 'longitude','is_online')