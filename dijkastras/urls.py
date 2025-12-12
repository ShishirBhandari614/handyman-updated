from django.urls import path
from . import views
from .views import search_results, SearchServiceProvidersAPIView

urlpatterns = [
    path('search-service/', views.SearchServiceProvidersAPIView.as_view(), name='search_service_providers'),
    # path('search-results/', views.SearchResultsAPIView.as_view(), name='search_results'),
    path('search-results/', search_results, name='search_results'),

]
