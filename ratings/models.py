from django.db import models

# Create your models here.
class Booking(models.Model):
    customer = models.ForeignKey("userauth.Customer", on_delete=models.CASCADE)
    service_provider = models.ForeignKey("userauth.ServiceProvider", on_delete=models.CASCADE)
    service_type = models.CharField(max_length=255)
    booking_date = models.DateTimeField()
    status = models.CharField(max_length=50, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('canceled', 'Canceled')])
 
    
    def __str__(self):
        return f"  {self.service_provider.user.username}"

class Rating(models.Model):
    customer = models.ForeignKey("userauth.Customer", on_delete=models.CASCADE)
    service_provider = models.ForeignKey("userauth.ServiceProvider", on_delete=models.CASCADE)
    booking = models.ForeignKey("Booking", on_delete=models.CASCADE)  # Reference to the completed booking
    rating_value = models.PositiveIntegerField(choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)])  # 1 to 5 stars
  

    def __str__(self):
        return f"Rating by {self.customer.user.username} for {self.service_provider.user.username}"

class ServiceProviderAvgRating(models.Model):
    user = models.OneToOneField("userauth.User", on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    average_rating = models.FloatField(default=0.0)  # Add a field for the average rating

    def __str__(self):
        return self.user.username
    
class Cancellation(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    customer = models.ForeignKey("userauth.Customer", on_delete=models.CASCADE)
    service_provider = models.ForeignKey("userauth.ServiceProvider", on_delete=models.CASCADE)
    reason = models.TextField()
    canceled_at = models.DateTimeField(auto_now_add=True)  # Stores the timestamp of cancellation

    def __str__(self):
        return f"Cancellation of Booking {self.booking.id} - Reason: {self.reason}"
