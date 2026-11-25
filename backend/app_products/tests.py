from datetime import timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone
from .models import Product, PricingPolicy, TaxRule, TaxRuleVersion


class PricingModelTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create(email='models@example.com', phone_number='254700000001', first_name='Model', last_name='Test')
        self.product = Product.objects.create(name='Game', description='Game', price='1000', quantity=0, gender='UNISEX', seller=self.user)
        self.rule = TaxRule.objects.create(code='standard', name='Standard')
        self.start = timezone.now() - timedelta(days=1)

    def tax(self, **kwargs):
        return TaxRuleVersion.objects.create(**dict(dict(tax_rule=self.rule, revision=1, treatment='TAXABLE', rate_percent='16', effective_from=self.start), **kwargs))

    def policy(self, **kwargs):
        return PricingPolicy.objects.create(**dict(dict(product=self.product, revision=1, target_profit='200', profit_discount='100', tax_rule=self.rule, effective_from=self.start), **kwargs))

    def test_profit_discount_and_decimal_storage(self):
        policy = self.policy()
        self.assertEqual(policy.remaining_target_profit, Decimal('100'))
        policy.refresh_from_db()
        self.assertEqual(policy.target_profit, Decimal('200.00'))

    def test_discount_cannot_exceed_profit(self):
        with self.assertRaises(ValidationError):
            self.policy(profit_discount='201')

    def test_database_also_rejects_invalid_profit(self):
        policy = self.policy()
        with self.assertRaises(IntegrityError), transaction.atomic():
            PricingPolicy.objects.filter(pk=policy.pk).update(profit_discount=300)

    def test_tax_rate_and_classification_validation(self):
        for changes in ({'rate_percent': '-1'}, {'rate_percent': '101'}, {'treatment': 'EXEMPT', 'rate_percent': '16'}):
            with self.subTest(changes=changes), self.assertRaises(ValidationError):
                self.tax(**changes)

    def test_adjacent_tax_versions_are_allowed_but_overlaps_are_rejected(self):
        first = self.tax()
        next_start = self.start + timedelta(days=3)
        with self.assertRaises(ValidationError):
            self.tax(revision=2, effective_from=next_start)
        first.effective_until = next_start
        first.save()
        second = self.tax(revision=2, rate_percent='17', effective_from=next_start)
        self.assertEqual(second.rate_percent, Decimal('17'))

    def test_policy_periods_cannot_overlap(self):
        self.policy()
        with self.assertRaises(ValidationError):
            self.policy(revision=2, effective_from=self.start + timedelta(days=1))

    def test_rates_and_policy_inputs_cannot_be_overwritten(self):
        rate = self.tax()
        rate.rate_percent = Decimal('17')
        with self.assertRaises(ValidationError):
            rate.save()
        policy = self.policy()
        policy.target_profit = Decimal('300')
        with self.assertRaises(ValidationError):
            policy.save()

    def test_zero_rate_and_exemption_remain_distinct(self):
        rate = self.tax(treatment='ZERO_RATED', rate_percent='0')
        self.assertEqual(rate.treatment, 'ZERO_RATED')
        self.assertEqual(rate.rate_percent, Decimal('0'))
