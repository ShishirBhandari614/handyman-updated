from django.urls import path
from kycverification.views import *
app_name='kycverification'

urlpatterns = [
    path('kyc-verification/', kyc_form_view, name='kyc_form_view'),
    path('kyc-update/', kyc_update_view, name='kyc_update_view'),
    path('api/kyc-verification/', KYCAPIView.as_view(), name='kyc_api_view'),
]