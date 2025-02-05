from rest_framework import serializers
from .models import CustomUser, Product, Category, Order
from pymongo import MongoClient
from gridfs import GridFS
from backend.settings import MONGO_URI


mongo_client = MongoClient(MONGO_URI)
db = mongo_client['toyzum']
fs = GridFS(db)

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('email', 'phone_number', 'first_name', 'last_name', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.role = validated_data.get('role', instance.role)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)

        instance.set_password(validated_data.get('password', instance.password))
        instance.save()
        return instance
    
class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        models = CustomUser
        fields = ["id", "phone_number", "email"]

class ProductSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    class Meta:
        model = Product
        fields = '__all__'

    def create(self, validated_data):
        product = Product.objects.create(**validated_data)
        return product
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    
    def delete(self, instance):
        instance.delete()
        return
    
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class OrderSerializer(serializers.Serializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'