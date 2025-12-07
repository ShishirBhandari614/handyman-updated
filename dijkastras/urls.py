from django.urls import path
from . import views

urlpatterns = [
    path('search-service/', views.search_service_providers, name='search_service_providers'),
]
