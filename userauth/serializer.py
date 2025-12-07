from userauth.models import ServiceProvider,User,Customer 
from rest_framework import serializers
from django.db import transaction
from rest_framework.authtoken.models import Token

class Userserializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email','phone', 'is_customer','is_ServiceProvider']
        


class ServiceProviderSignupSerializer(serializers.ModelSerializer): 
    password2 = serializers.CharField(style = {"input_type":"password"}, write_only = True)
    class Meta:
        model = User
        fields = ['username','email','phone','password','password2']
        extra_kwargs = {
            'password':{'write_only':True}
        }
    
    def save(self, **kwargs):
        user = User(
            username = self.validated_data['username'],
            email=self.validated_data['email'],
            phone = self.validated_data['phone']
            
        )
        password=self.validated_data['password']
        password2=self.validated_data['password2']
        if password!=password2:
            raise serializers.ValidationError({'error':'password do not match'})
        user.set_password(password)
        user.is_ServiceProvider=True
        user.save()
        ServiceProvider.objects.create(user=user, phone=user.phone)
        return user 


class CustomerSignupSerializer(serializers.ModelSerializer): 
     password2 = serializers.CharField(style = {"input_type":"password"}, write_only = True)
     class Meta:
        model = User
        fields =  ['username','email','phone','password','password2']
        extra_kwargs = {
            'password':{'write_only':True}
        }
    
     def save(self, **kwargs):
        user = User(
            username = self.validated_data['username'],
            email=self.validated_data['email'],
            phone = self.validated_data['phone']
            
        )
        password=self.validated_data['password']
        password2=self.validated_data['password2']
        if password!=password2:
            raise serializers.ValidationError({'error':'password do not match'})
        user.set_password(password)
        user.is_customer=True
        user.save()
        Customer.objects.create(user=user)
        return user 
           