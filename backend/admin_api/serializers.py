from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from rest_framework import serializers


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username

        return token
    
class UserSerializers(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(source='profile.phone_number', required=True)

    class Meta:
        model=User
        fields=['first_name', "last_name", "username", "email", 'password', 'phone_number']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        phone_number = profile_data.get('phone_number')

        user = User.objects.create_user(
            first_name = validated_data.get("first_name", ""),
            last_name = validated_data.get("last_name", ""),
            username = validated_data.get("username"),
            email = validated_data.get("email"),
            password = validated_data.get("password")
        )

        user.profile.phone_number = phone_number
        user.profile.save()
        
        return user
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        phone_number = profile_data.get('phone_number')

        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Profile fields
        if phone_number:
            instance.profile.phone_number = phone_number
            instance.profile.save()

        return instance