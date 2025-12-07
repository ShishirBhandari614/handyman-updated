
from django.db import models
from django.conf import settings
class KYC(models.Model):
    service_provider = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="kyc")
    name = models.CharField(max_length=255)
    address = models.TextField()
    service_type = models.CharField(max_length=150, null=True, blank=True)
    woork_type = models.TextField()

    citizenship_number = models.CharField(max_length=50)
    photo = models.ImageField(upload_to="kyc/photos/")
    citizenship_photo = models.ImageField(upload_to="kyc/citizenship_photos/")
    training_certificate = models.ImageField(upload_to="kyc/training_certificates/")
    is_verified = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)
   

    def __str__(self):
        return f"KYC for {self.service_provider.username}"
    