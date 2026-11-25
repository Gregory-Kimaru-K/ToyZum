from datetime import timedelta
from decimal import Decimal
import uuid
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models.deletion import ProtectedError
from django.test import TestCase
from django.utils import timezone
from app_products.models import Product, PricingPolicy, TaxRule, TaxRuleVersion
from .pricing import prepare_batch_price
from .models import StockReceipt, StockBatch, ProductPriceVersion, BatchPriceAssignment, StockReservation, StockMovement, InventorySummary


class InventoryModelTests(TestCase):
    def setUp(self):
        self.now = timezone.now()
        user = get_user_model().objects.create(email='stock@example.com', phone_number='254700000002', first_name='Stock', last_name='Test')
        self.product = Product.objects.create(name='Game', description='Game', price='1000', quantity=0, gender='UNISEX', seller=user)
        self.rule = TaxRule.objects.create(code='vat', name='VAT')
        self.tax = TaxRuleVersion.objects.create(tax_rule=self.rule, revision=1, treatment='TAXABLE', rate_percent='16', effective_from=self.now-timedelta(days=2))
        self.policy = PricingPolicy.objects.create(product=self.product, revision=1, target_profit='200', tax_rule=self.rule, effective_from=self.now-timedelta(days=2))
        self.receipt = StockReceipt.objects.create(recorded_by=user, received_at=self.now)
        self.batch = StockBatch.objects.create(product=self.product, receipt=self.receipt, unit_cost='800', quantity_received=10, quantity_on_hand=10)
        self.assignment = prepare_batch_price(self.batch, policy=self.policy, tax_version=self.tax, tax_applied=True, at=self.now)
        self.price = self.assignment.price_version

    def test_batches_preserve_costs_and_sort_by_receipt_time(self):
        receipt = StockReceipt.objects.create(received_at=self.now + timedelta(days=1))
        later = StockBatch.objects.create(product=self.product, receipt=receipt, unit_cost='900', quantity_received=5, quantity_on_hand=5)
        self.assertEqual(list(self.product.stock_batches.all()), [self.batch, later])
        self.batch.unit_cost = Decimal('850')
        with self.assertRaises(ValidationError):
            self.batch.save()

    def test_reserved_quantity_changes_available_not_physical_stock(self):
        self.batch.quantity_reserved = 2
        self.batch.save()
        self.assertEqual(self.batch.quantity_on_hand, 10)
        self.assertEqual(self.batch.quantity_available, 8)

    def test_database_prevents_overselling_counters(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            StockBatch.objects.filter(pk=self.batch.pk).update(quantity_reserved=11)
        with self.assertRaises(IntegrityError), transaction.atomic():
            StockBatch.objects.filter(pk=self.batch.pk).update(quantity_on_hand=12)

    def test_receipt_request_ids_are_unique(self):
        with self.assertRaises(ValidationError):
            StockReceipt.objects.create(request_id=self.receipt.request_id)
        with self.assertRaises(IntegrityError), transaction.atomic():
            StockReceipt.objects.bulk_create([StockReceipt(request_id=self.receipt.request_id)])

    def test_price_cannot_fall_below_its_floor(self):
        self.assignment.floor_gross_price = Decimal('1200')
        with self.assertRaises(ValidationError):
            self.assignment.full_clean()

    def test_price_components_must_add_up(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            ProductPriceVersion.objects.filter(pk=self.price.pk).update(gross_price=1200)

    def test_prepared_price_history_is_preserved(self):
        self.price.gross_price = Decimal('1200')
        with self.assertRaises(ValidationError):
            self.price.save()

    def test_price_requires_the_correct_product_policy(self):
        other = Product.objects.create(name='Other', description='Other', price='900', quantity=0, gender='UNISEX', seller=self.receipt.recorded_by)
        policy = PricingPolicy.objects.create(product=other, revision=1, target_profit='200', tax_rule=self.rule, effective_from=self.now-timedelta(days=1))
        self.price.policy = policy
        with self.assertRaises(ValidationError):
            self.price.full_clean()

    def test_tax_cannot_be_recorded_as_unapplied(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            ProductPriceVersion.objects.filter(pk=self.price.pk).update(tax_applied=False)

    def test_reservations_require_a_matching_batch_price_and_expiry(self):
        other = StockBatch.objects.create(product=self.product, receipt=self.receipt, unit_cost='900', quantity_received=5, quantity_on_hand=5)
        reservation = StockReservation(checkout_reference=uuid.uuid4(), batch=other, price_assignment=self.assignment, quantity=1, expires_at=self.now+timedelta(minutes=15))
        with self.assertRaises(ValidationError):
            reservation.full_clean()
        reservation.batch = self.batch
        reservation.expires_at = self.now-timedelta(minutes=1)
        with self.assertRaises(ValidationError):
            reservation.full_clean()

    def test_movements_are_audited_and_retries_cannot_duplicate_them(self):
        movement = StockMovement.objects.create(batch=self.batch, kind='RECEIPT', quantity_delta=10, balance_after=10)
        movement.reference = 'changed'
        with self.assertRaises(ValidationError):
            movement.save()
        with self.assertRaises(ValidationError):
            movement.delete()
        with self.assertRaises(ValidationError):
            StockMovement.objects.create(batch=self.batch, kind='RECEIPT', quantity_delta=10, balance_after=10, operation_id=movement.operation_id)

    def test_movement_directions_and_reversals_are_validated(self):
        with self.assertRaises(ValidationError):
            StockMovement.objects.create(batch=self.batch, kind='SALE', quantity_delta=1, balance_after=9)
        original = StockMovement.objects.create(batch=self.batch, kind='SALE', quantity_delta=-1, balance_after=9)
        reverse = StockMovement.objects.create(batch=self.batch, kind='ADJUSTMENT', quantity_delta=1, balance_after=10, reverses=original)
        self.assertEqual(reverse.reverses, original)

    def test_summary_is_a_bounded_read_projection(self):
        summary = InventorySummary.objects.create(product=self.product, total_on_hand=10, total_reserved=2, current_price_version=self.price, quantity_at_current_price=8)
        self.assertEqual(summary.quantity_available, 8)
        with self.assertRaises(IntegrityError), transaction.atomic():
            InventorySummary.objects.filter(pk=summary.pk).update(quantity_at_current_price=9)

    def test_historical_product_is_protected_from_deletion(self):
        with self.assertRaises(ProtectedError):
            self.product.delete()


    def test_cent_totals_do_not_fail_due_to_sqlite_binary_rounding(self):
        product = Product.objects.create(name='Small game', description='Game', price='1', quantity=0, gender='UNISEX', seller=self.receipt.recorded_by)
        policy = PricingPolicy.objects.create(product=product, revision=1, target_profit='0.09', tax_rule=self.rule, effective_from=self.now-timedelta(days=1))
        batch = StockBatch.objects.create(product=product, receipt=self.receipt, unit_cost='0.01', quantity_received=1, quantity_on_hand=1)
        assignment = prepare_batch_price(batch, policy=policy, tax_version=self.tax, tax_applied=True, at=self.now)
        price = assignment.price_version
        price.refresh_from_db()
        self.assertEqual(price.gross_price, Decimal('0.12'))


    def test_lower_cost_retains_price_and_records_extra_margin_without_extra_tax(self):
        cheaper = StockBatch.objects.create(product=self.product, receipt=self.receipt, unit_cost='700', quantity_received=5, quantity_on_hand=5)
        assignment = prepare_batch_price(cheaper, policy=self.policy, tax_version=self.tax, tax_applied=True, at=self.now)
        price = assignment.price_version
        self.assertEqual(price.pk, self.price.pk)
        self.assertEqual(assignment.expected_unit_profit, Decimal('300'))
        self.assertEqual(assignment.extra_profit_per_unit, Decimal('100'))
        self.assertEqual(price.tax_amount, Decimal('160'))

    def test_prepared_price_must_follow_its_cost_and_tax_rule(self):
        self.assignment.candidate_gross_price = Decimal('1000')
        with self.assertRaises(ValidationError):
            self.assignment.full_clean()
        self.assignment.candidate_gross_price = Decimal('1160')
        self.price.tax_amount = Decimal('150')
        self.price.net_price = Decimal('1010')
        with self.assertRaises(ValidationError):
            self.price.full_clean()

    def another_batch(self, cost='800', product=None):
        return StockBatch.objects.create(
            product=product or self.product, receipt=self.receipt, unit_cost=cost,
            quantity_received=3, quantity_on_hand=3,
        )

    def prepare(self, batch, **kwargs):
        options = dict(policy=self.policy, tax_version=self.tax, tax_applied=True, at=self.now)
        options.update(kwargs)
        return prepare_batch_price(batch, **options)

    def test_equal_cost_batches_share_the_exact_price_version(self):
        later = self.another_batch()
        assignment = self.prepare(later)
        self.assertNotEqual(assignment.pk, self.assignment.pk)
        self.assertEqual(assignment.price_version_id, self.price.pk)
        self.assertEqual(ProductPriceVersion.objects.count(), 1)
        self.assertEqual(BatchPriceAssignment.objects.count(), 2)
        self.assertEqual(assignment.expected_unit_profit, Decimal('200'))

    def test_sold_out_previous_batch_still_supplies_the_price(self):
        self.batch.quantity_on_hand = 0
        self.batch.save()
        assignment = self.prepare(self.another_batch())
        self.assertEqual(assignment.price_version_id, self.price.pk)

    def test_preparing_the_same_batch_twice_is_idempotent(self):
        again = self.prepare(self.batch)
        self.assertEqual(again.pk, self.assignment.pk)
        self.assertEqual(ProductPriceVersion.objects.count(), 1)
        self.assertEqual(BatchPriceAssignment.objects.count(), 1)

    def test_higher_cost_prepares_a_separate_tier_without_closing_old_price(self):
        assignment = self.prepare(self.another_batch('900'))
        self.assertNotEqual(assignment.price_version_id, self.price.pk)
        self.assertEqual(assignment.price_version.gross_price, Decimal('1276'))
        self.price.refresh_from_db()
        self.assertIsNone(self.price.effective_until)
        self.assertEqual(self.batch.quantity_on_hand, 10)

    def test_equal_cost_does_not_inherit_an_expired_price(self):
        self.assignment.effective_until = self.now + timedelta(hours=1)
        self.assignment.save()
        self.price.effective_until = self.assignment.effective_until
        self.price.save()
        assignment = self.prepare(self.another_batch(), at=self.now + timedelta(hours=2))
        self.assertNotEqual(assignment.price_version_id, self.price.pk)

    def test_equal_cost_does_not_inherit_a_previous_tax_version(self):
        boundary = self.now + timedelta(days=1)
        self.assignment.effective_until = boundary
        self.assignment.save()
        self.price.effective_until = boundary
        self.price.save()
        self.tax.effective_until = boundary
        self.tax.save()
        new_tax = TaxRuleVersion.objects.create(
            tax_rule=self.rule, revision=2, treatment='TAXABLE', rate_percent='18',
            effective_from=boundary,
        )
        assignment = self.prepare(self.another_batch(), tax_version=new_tax, at=boundary)
        self.assertNotEqual(assignment.price_version_id, self.price.pk)
        self.assertEqual(assignment.price_version.gross_price, Decimal('1180'))

    def test_equal_cost_does_not_inherit_a_previous_policy(self):
        boundary = self.now + timedelta(days=1)
        self.assignment.effective_until = boundary
        self.assignment.save()
        self.price.effective_until = boundary
        self.price.save()
        self.policy.effective_until = boundary
        self.policy.save()
        new_policy = PricingPolicy.objects.create(
            product=self.product, revision=2, target_profit='250',
            tax_rule=self.rule, effective_from=boundary,
        )
        assignment = self.prepare(self.another_batch(), policy=new_policy, at=boundary)
        self.assertNotEqual(assignment.price_version_id, self.price.pk)
        self.assertEqual(assignment.price_version.gross_price, Decimal('1218'))

    def test_no_floor_allows_a_lower_selling_price(self):
        # Test fixture changes the instruction before it is used for this new batch.
        PricingPolicy.objects.filter(pk=self.policy.pk).update(keep_price_floor=False)
        self.policy.refresh_from_db()
        assignment = self.prepare(self.another_batch('700'))
        self.assertNotEqual(assignment.price_version_id, self.price.pk)
        self.assertIsNone(assignment.floor_gross_price)
        self.assertEqual(assignment.price_version.gross_price, Decimal('1044'))

    def test_batch_assignment_rejects_a_different_product(self):
        product = Product.objects.create(name='Other', description='Other', price='900', quantity=0, gender='UNISEX', seller=self.receipt.recorded_by)
        assignment = BatchPriceAssignment(
            batch=self.another_batch(product=product), price_version=self.price,
            candidate_gross_price='1160', effective_from=self.now,
        )
        with self.assertRaises(ValidationError):
            assignment.save()

    def test_assignment_periods_cannot_overlap_and_history_cannot_be_overwritten(self):
        duplicate = BatchPriceAssignment(
            batch=self.batch, price_version=self.price, candidate_gross_price='1160',
            effective_from=self.now + timedelta(seconds=1),
        )
        with self.assertRaises(ValidationError):
            duplicate.save()
        self.assignment.floor_gross_price = Decimal('1000')
        with self.assertRaises(ValidationError):
            self.assignment.save()

    def test_shared_price_can_be_reserved_from_either_assigned_batch(self):
        later = self.another_batch()
        assignment = self.prepare(later)
        reservation = StockReservation.objects.create(
            checkout_reference=uuid.uuid4(), batch=later, price_assignment=assignment,
            quantity=1, expires_at=self.now + timedelta(minutes=15),
        )
        self.assertEqual(reservation.price_assignment.price_version_id, self.price.pk)

    def test_expired_policy_cannot_be_used_even_when_cost_is_equal(self):
        self.policy.effective_until = self.now + timedelta(hours=1)
        self.policy.save()
        with self.assertRaises(ValidationError):
            self.prepare(self.another_batch(), at=self.now + timedelta(hours=2))
