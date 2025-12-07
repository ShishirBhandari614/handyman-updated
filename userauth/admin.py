from django.contrib import admin
from userauth.models import *
admin.site.register(User)
admin.site.register(Customer)
admin.site.register(ServiceProvider)

# Register your models here.
