from rest_framework import serializers
from app_accounts.models import CustomUser
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from copy import copy

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('email', 'phone_number', 'first_name', 'last_name', 'role', 'password')
        read_only_fields = ('role',)
        extra_kwargs = {'password': {'write_only': True, 'trim_whitespace': False}}

    def validate(self, attrs):
        if 'password' in attrs:
            candidate = copy(self.instance) if self.instance else CustomUser()
            for field in ('email', 'phone_number', 'first_name', 'last_name'):
                if field in attrs:
                    setattr(candidate, field, attrs[field])
            try:
                validate_password(attrs['password'], user=candidate)
            except DjangoValidationError as error:
                raise serializers.ValidationError({'password': error.messages})
        return attrs

    def create(self, validated_data):
        # Public registration can never grant store-management privileges.
        return CustomUser.objects.create_user(
            **validated_data, role='END_USER', is_staff=False, is_superuser=False
        )

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password is not None:
            instance.set_password(password)
        return super().update(instance, validated_data)


class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "phone_number", "email"]