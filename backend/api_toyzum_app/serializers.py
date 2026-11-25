from copy import copy
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import CustomUser, Product, Category, Industry, Order, Adverts, Cart, StockMovement

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

class ProductSerializer(serializers.ModelSerializer):
    category_details = serializers.SerializerMethodField()

    def get_category_details(self, product):
        return [{'id': category.pk, 'name': category.name, 'slug': category.slug,
                 'industry': category.industry_id} for category in product.categories.all()]

    def validate(self, attrs):
        if 'quantity' in attrs:
            if attrs['quantity'] < 0:
                raise serializers.ValidationError({'quantity': 'Stock cannot be negative.'})
            if self.instance and attrs['quantity'] != self.instance.quantity:
                raise serializers.ValidationError({'quantity': 'Use Receive stock to add units; do not overwrite the stock balance.'})
        if 'categories' in attrs:
            selected = list(dict.fromkeys(attrs['categories']))
            attrs['categories'] = selected
            attrs['category'] = selected[0] if selected else None
        elif 'category' in attrs:
            primary = attrs['category']
            selected = list(self.instance.categories.all()) if self.instance and primary else []
            if primary and primary not in selected:
                selected.insert(0, primary)
            attrs['categories'] = selected
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            product = super().create(validated_data)
            if product.quantity > 0:
                request = self.context.get('request')
                actor = request.user if request and request.user.is_authenticated else None
                StockMovement.objects.create(
                    product=product, movement_type='OPENING', quantity_change=product.quantity,
                    balance_after=product.quantity, recorded_by=actor, reference='Initial product stock',
                )
        return product

    class Meta:
        model = Product
        fields = '__all__'
    
class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ('id', 'name', 'image', 'created_at', 'slug')
        read_only_fields = ('id', 'created_at', 'slug')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    client = CustomUserSerializer(read_only=True)
    class Meta:
        model = Order
        fields = '__all__'


class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only = True)

    class Meta:
        model = Cart
        fields = "__all__"

class AdvertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adverts
        fields = "__all__"