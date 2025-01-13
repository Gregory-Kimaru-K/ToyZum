from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.db import models

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['phone_number'] = user.phone_number
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['role'] = user.role

        return token

    def validate(self, attrs):
        UserModel=get_user_model()
        email_or_phone=attrs.get('email', None) or attrs.get('phone_number', None)
        password = attrs.get('password')

        if not email_or_phone or not password:
            raise serializers.ValidationError("Email/phone number and password required")

        user = UserModel.objects.filter(
            models.Q(email=email_or_phone) | models.Q(phone_number=email_or_phone)
        ).first()

        if user and user.check_password(password):
            attrs['email'] = user.email
            return super().validate(attrs)

        raise serializers.ValidationError('Invalid credentials!')

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class=MyTokenObtainPairSerializer