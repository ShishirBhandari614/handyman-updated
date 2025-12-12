from django.urls import path
from location.views import *
app_name='location'

urlpatterns = [
    # path('savelocation/', save_location, name='save-location'),
    path('update-status/', UpdateStatusView.as_view(), name='update_status'),
    path('savelocation/', SaveLocationView.as_view(), name='save-location'),
    # path('updatestatus/', UpdateStatusView.as_view(), name='update_status'),
]