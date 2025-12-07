from django.urls import path
from userauth.views import *

app_name = 'userauth'
urlpatterns = [

    # path('login/', LoginPage),
    path('signup/serviceprovider/', ServiceProviderAuthenticationView.as_view(), name='service_authentication'),
    path('signup/customer/', CustomerAuthenticationView.as_view(), name='customer-signup'),
    path('serviceproviderdashboard/', ServiceProviderDashboardView.as_view(), name= "serviceproviderdashboard"),
    path('customerdashboard/', customerdashboard.as_view(),),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('settings/change-phone-number/', update_phone_number, name='change_phone_number'),
    # path('login/',LoginAPIView.as_view()),
    
]
