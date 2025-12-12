from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ServiceProviderLocation
from .firebase_sync import update_provider_in_firebase

@receiver(post_save, sender=ServiceProviderLocation)
def update_provider(sender, instance, **kwargs):
    update_provider_in_firebase(instance)
