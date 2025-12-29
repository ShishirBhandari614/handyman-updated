from django.urls import path
from .views import book_service, SendSMSView



urlpatterns = [
    path('book/', book_service, name='book_service'),
    path('send-sms/', SendSMSView.as_view(), name='send_sms'),
    

]
