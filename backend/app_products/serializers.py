from rest_framework import serializers

from app_products import models

class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Industry
        fields = ('id', 'name', 'image', 'slug', 'created_at')
        read_only_fields = ('id', 'slug', 'created_at')


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Category
        fields = ('id', 'name', 'image', 'industry', 'slug', 'created_at')
        read_only_fields = ('id', 'slug', 'created_at')


class ProductSerializer(serializers.ModelSerializer):
    # The view supplies seller and initial quantity; stock changes belong to inventory.
    class Meta:
        model = models.Product
        fields = (
            'id', 'name', 'description', 'price', 'discounted_price', 'images',
            'quantity', 'categories', 'gender', 'min_age', 'max_age', 'seller',
            'featured', 'flash_sale', 'slug', 'created_at',
        )
        read_only_fields = ('id', 'quantity', 'seller', 'slug', 'created_at')


class TaxRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TaxRule
        fields = ('id', 'code', 'name', 'is_active')
        read_only_fields = ('id',)


class TaxRuleVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TaxRuleVersion
        fields = (
            'id', 'tax_rule', 'revision', 'treatment', 'rate_percent',
            'effective_from', 'effective_until', 'created_at',
        )
        read_only_fields = ('id', 'created_at')


class PricingPolicySerializer(serializers.ModelSerializer):
    # The view supplies created_by. The model calculates remaining_target_profit.
    class Meta:
        model = models.PricingPolicy
        fields = (
            'id', 'product', 'revision', 'target_profit', 'profit_discount',
            'remaining_target_profit', 'keep_price_floor', 'tax_rule',
            'effective_from', 'effective_until', 'created_at', 'created_by',
        )
        read_only_fields = ('id', 'created_at', 'created_by', 'remaining_target_profit')
