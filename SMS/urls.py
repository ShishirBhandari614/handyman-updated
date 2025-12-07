from django.urls import path
from .views import book_service


urlpatterns = [
    path('book/', book_service, name='book_service'),
    

]
