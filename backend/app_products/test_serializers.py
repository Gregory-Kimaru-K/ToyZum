from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from .models import Category, Industry, Product, TaxRule
from .serializers import (
    CategorySerializer, IndustrySerializer, PricingPolicySerializer,
    ProductSerializer, TaxRuleSerializer, TaxRuleVersionSerializer,
)


class ProductSerializerTests(TestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create(
            email='owner@example.com', phone_number='254700000010',
            first_name='Store', last_name='Owner', is_staff=True,
        )
        self.industry = Industry.objects.create(name='Games')
        self.couples = Category.objects.create(name='Couples', industry=self.industry)
        self.friends = Category.objects.create(name='Friends', industry=self.industry)
        self.product = Product.objects.create(
            name='Party game', description='A game', price='1000',
            quantity=3, gender='UNISEX', seller=self.owner,
        )
        self.rule = TaxRule.objects.create(code='standard', name='Standard')
        self.start = timezone.now() - timedelta(days=1)

    def test_department_slug_is_generated_and_duplicate_name_is_rejected(self):
        serializer = IndustrySerializer(data={'name': 'Toys', 'slug': 'injected'})
        serializer.is_valid(raise_exception=True)
        self.assertEqual(serializer.save().slug, 'toys')
        duplicate = IndustrySerializer(data={'name': 'Toys'})
        self.assertFalse(duplicate.is_valid())
        self.assertIn('name', duplicate.errors)

    def test_category_accepts_an_existing_department_id(self):
        invalid = CategorySerializer(data={'name': 'Cards', 'industry': 99999})
        self.assertFalse(invalid.is_valid())
        serializer = CategorySerializer(data={'name': 'Cards', 'industry': self.industry.pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.assertEqual(serializer.data['industry'], self.industry.pk)

    def test_product_saves_multiple_categories_with_view_supplied_creator_and_stock(self):
        serializer = ProductSerializer(data={
            'name': 'New game', 'description': 'A game', 'price': '1000',
            'gender': 'UNISEX', 'categories': [self.couples.pk, self.friends.pk],
            'seller': 99999, 'quantity': 100, 'slug': 'injected',
        })
        serializer.is_valid(raise_exception=True)
        product = serializer.save(seller=self.owner, quantity=0)
        self.assertEqual(product.seller, self.owner)
        self.assertEqual(product.quantity, 0)
        self.assertEqual(product.slug, 'new-game')
        self.assertEqual(set(serializer.data['categories']), {self.couples.pk, self.friends.pk})

    def test_product_patch_can_clear_categories_without_overwriting_stock_or_creator(self):
        self.product.categories.add(self.couples)
        serializer = ProductSerializer(self.product, data={
            'categories': [], 'quantity': 99, 'seller': 99999,
        }, partial=True)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        product.refresh_from_db()
        self.assertEqual(product.categories.count(), 0)
        self.assertEqual(product.quantity, 3)
        self.assertEqual(product.seller, self.owner)

    def test_public_product_data_does_not_embed_private_policy_or_contact_details(self):
        data = ProductSerializer(self.product).data
        for field in ('pricing_policies', 'target_profit', 'unit_cost', 'email', 'phone_number'):
            self.assertNotIn(field, data)

    def test_tax_classification_and_dated_version_save(self):
        rule = TaxRuleSerializer(data={'code': 'exempt', 'name': 'Exempt'})
        rule.is_valid(raise_exception=True)
        rule.save()
        serializer = TaxRuleVersionSerializer(data={
            'tax_rule': rule.instance.pk, 'revision': 1, 'treatment': 'EXEMPT',
            'rate_percent': '0', 'effective_from': self.start.isoformat(),
        })
        serializer.is_valid(raise_exception=True)
        version = serializer.save()
        self.assertEqual(version.rate_percent, Decimal('0'))
        self.assertEqual(serializer.data['tax_rule'], rule.instance.pk)

    def test_policy_uses_view_supplied_creator_and_calculated_remaining_profit(self):
        serializer = PricingPolicySerializer(data={
            'product': self.product.pk, 'revision': 1, 'target_profit': '200',
            'profit_discount': '100', 'tax_rule': self.rule.pk,
            'effective_from': self.start.isoformat(),
            'created_by': 99999, 'remaining_target_profit': '999',
        })
        serializer.is_valid(raise_exception=True)
        policy = serializer.save(created_by=self.owner)
        self.assertEqual(policy.created_by, self.owner)
        self.assertEqual(Decimal(str(serializer.data['remaining_target_profit'])), Decimal('100'))
