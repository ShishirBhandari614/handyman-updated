from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class CustomerLocation(models.Model):
    customer = models.ForeignKey("userauth.Customer", on_delete=models.CASCADE, related_name="customer_location")
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"{self.customer.user.username} - ({self.latitude}, {self.longitude})"
        
class ServiceProviderLocation(models.Model):
    service_provider = models.ForeignKey("userauth.ServiceProvider", on_delete=models.CASCADE, related_name="serviceprovider_location")
    latitude = models.FloatField()
    longitude = models.FloatField()
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.service_provider.user.username} - ({self.latitude}, {self.longitude})"



