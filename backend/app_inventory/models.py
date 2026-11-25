import uuid
from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db import models
from django.db.models import F, Q
from django.db.models.functions import Round
from django.utils import timezone


class StockReceipt(models.Model):
    '''One delivery of goods actually received, possibly containing several products.

    reference: optional supplier invoice or delivery-note number.
    received_at: when the goods arrived; created_at: when this record was entered.
    recorded_by: account that recorded the delivery; retained as null if deleted.
    request_id: unique submission identifier; reuse it when retrying the same request.
    Saving a receipt alone does not create batches or increase stock.
    '''
    reference = models.CharField(max_length=200, blank=True)
    received_at = models.DateTimeField(default=timezone.now)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    request_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    def save(self, *args, **kwargs):
        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            if any(getattr(old, field) != getattr(self, field) for field in ('reference', 'received_at', 'recorded_by_id', 'request_id')):
                raise ValidationError('Receipt details are historical. Record a correction instead.')
        self.full_clean()
        return super().save(*args, **kwargs)


class StockBatch(models.Model):
    '''One product received at one buying cost; physical counts belong here.

    product: catalogue item; receipt: delivery containing this batch.
    batch_code: unique internal batch identifier.
    unit_cost: recorded acquisition cost of ONE unit, not its selling price.
    currency: currency of that cost (currently KES only).
    quantity_received: original number accepted into this batch.
    quantity_on_hand: units physically held, including reserved units.
    quantity_reserved: held units unavailable to other checkouts.
    quantity_available: on-hand minus reserved, calculated rather than stored.
    received_at: copied from the receipt; created_at: database entry time.
    FIFO sorts by received_at then id. Change counters through atomic services.
    Price assignments link this batch to reusable product selling prices.
    '''
    product = models.ForeignKey('app_products.Product', on_delete=models.PROTECT, related_name='stock_batches')
    receipt = models.ForeignKey(StockReceipt, on_delete=models.PROTECT, related_name='batches')
    batch_code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=[('KES', 'Kenyan shilling')], default='KES')
    quantity_received = models.PositiveIntegerField()
    quantity_on_hand = models.PositiveIntegerField()
    quantity_reserved = models.PositiveIntegerField(default=0)
    received_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ['received_at', 'id']
        indexes = [models.Index(fields=['product', 'received_at', 'id'], name='batch_product_fifo_idx')]
        constraints = [
            models.CheckConstraint(condition=Q(unit_cost__gte=0), name='batch_cost_nonnegative'),
            models.CheckConstraint(condition=Q(quantity_received__gt=0), name='batch_received_positive'),
            models.CheckConstraint(condition=Q(quantity_reserved__gte=0, quantity_on_hand__gte=0) & Q(quantity_reserved__lte=F('quantity_on_hand')) & Q(quantity_on_hand__lte=F('quantity_received')), name='batch_quantities_valid'),
        ]

    @property
    def quantity_available(self):
        return self.quantity_on_hand - self.quantity_reserved

    def save(self, *args, **kwargs):
        if not self.pk and self.receipt_id:
            self.received_at = self.receipt.received_at
        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            fields = ('product_id', 'receipt_id', 'unit_cost', 'currency', 'quantity_received', 'received_at', 'batch_code')
            if any(getattr(old, field) != getattr(self, field) for field in fields):
                raise ValidationError('Batch identity and receipt costs are historical. Record a correction instead.')
        self.full_clean()
        return super().save(*args, **kwargs)


class ProductPriceVersion(models.Model):
    '''Reusable selling price for one product; several batches can share this row.

    product: catalogue item; policy: profit/discount instructions used for this price.
    tax_version: exact dated classification/rate; tax_applied: whether sales tax applies.
    revision: price identifier within the product, not a batch number.
    currency: money denomination, currently KES only.
    gross_price: final customer price INCLUDING any applicable sales tax.
    tax_amount: sales tax contained in gross_price; net_price: gross minus that tax.
    effective_from: earliest time this price is eligible for use (inclusive).
    effective_until: eligibility deadline (exclusive), null if open-ended.
    created_at: record entry time. Different stock price tiers may overlap in time.
    Eligibility dates do not mean the price is currently displayed: available FIFO
    stock determines the offered tier. Buying costs and margins belong to assignments.
    '''
    product = models.ForeignKey('app_products.Product', on_delete=models.PROTECT, related_name='price_versions')
    policy = models.ForeignKey('app_products.PricingPolicy', on_delete=models.PROTECT)
    tax_version = models.ForeignKey('app_products.TaxRuleVersion', on_delete=models.PROTECT)
    revision = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, choices=[('KES', 'Kenyan shilling')], default='KES')
    net_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    gross_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_applied = models.BooleanField(default=False)
    effective_from = models.DateTimeField()
    effective_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ['product_id', '-revision']
        indexes = [models.Index(fields=['product', 'effective_from'], name='product_price_time_idx')]
        constraints = [
            models.UniqueConstraint(fields=['product', 'revision'], name='product_price_revision_unique'),
            models.CheckConstraint(condition=Q(revision__gte=1), name='product_price_revision_positive'),
            models.CheckConstraint(condition=Q(net_price__gt=0, tax_amount__gte=0) & Q(gross_price=Round(F('net_price') + F('tax_amount'), precision=2)), name='product_price_amounts_valid'),
            models.CheckConstraint(condition=Q(tax_applied=True) | Q(tax_amount=0), name='product_unapplied_tax_zero'),
            models.CheckConstraint(condition=Q(effective_until__isnull=True) | Q(effective_until__gt=F('effective_from')), name='product_price_dates_valid'),
        ]

    def clean(self):
        super().clean()
        if not all((self.product_id, self.policy_id, self.tax_version_id)):
            return
        try:
            policy, tax = self.policy, self.tax_version
        except ObjectDoesNotExist:
            return
        if policy.product_id != self.product_id:
            raise ValidationError({'policy': 'The policy must belong to this product.'})
        if policy.tax_rule_id != tax.tax_rule_id:
            raise ValidationError({'tax_version': 'The tax version must match the policy classification.'})
        if self.tax_applied and tax.treatment in ('EXEMPT', 'NON_VAT'):
            raise ValidationError('Tax cannot be applied to an exempt or non-VAT classification.')
        if all(isinstance(value, Decimal) for value in (self.net_price, self.tax_amount, self.gross_price)):
            rate = tax.rate_percent if self.tax_applied else Decimal('0')
            actual_tax = (self.gross_price * rate / (100 + rate)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            if self.tax_amount != actual_tax or self.net_price != self.gross_price - actual_tax:
                raise ValidationError('Split the final customer price into net price and tax using the selected rate.')
        if self.effective_from:
            for source in (policy, tax):
                if self.effective_from < source.effective_from or (source.effective_until and (not self.effective_until or self.effective_until > source.effective_until)):
                    raise ValidationError('Price eligibility must be within its policy and tax-version periods.')

    def save(self, *args, **kwargs):
        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            fields = ('product_id', 'policy_id', 'tax_version_id', 'revision', 'currency', 'net_price', 'tax_amount', 'gross_price', 'tax_applied', 'effective_from')
            if any(getattr(old, field) != getattr(self, field) for field in fields):
                raise ValidationError('Create a new price version instead of overwriting a selling price.')
        self.full_clean()
        return super().save(*args, **kwargs)


class BatchPriceAssignment(models.Model):
    '''Link a stock batch to a reusable selling price, preserving its own calculation.

    batch: units and historical buying cost; price_version: shared selling price.
    candidate_gross_price: cost plus remaining target profit, with applicable tax,
    before preserving a previous selling price. Different costs can share a final price.
    floor_gross_price: optional previous gross price retained as a minimum.
    effective_from/effective_until: inclusive start/exclusive end of this batch's
    assignment; null end means open. Assignments for the same batch cannot overlap.
    created_at: link creation time. An assignment is prepared pricing, not activation
    of a storefront price, and does not change stock counters.
    expected_unit_profit: shared net price minus THIS batch's unit cost.
    extra_profit_per_unit: that margin minus the policy's remaining target profit.
    These are unit margins before other expenses, not final business profit.
    Use prepare_batch_price to inherit compatible prices without duplicating them.
    '''
    batch = models.ForeignKey(StockBatch, on_delete=models.PROTECT, related_name='price_assignments')
    price_version = models.ForeignKey(ProductPriceVersion, on_delete=models.PROTECT, related_name='batch_assignments')
    candidate_gross_price = models.DecimalField(max_digits=12, decimal_places=2)
    floor_gross_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    effective_from = models.DateTimeField()
    effective_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ['batch_id', '-effective_from', '-id']
        indexes = [models.Index(fields=['batch', 'effective_from'], name='batch_assignment_time_idx')]
        constraints = [
            models.UniqueConstraint(fields=['batch', 'effective_from'], name='batch_assignment_start_unique'),
            models.CheckConstraint(condition=Q(candidate_gross_price__gt=0), name='assignment_candidate_positive'),
            models.CheckConstraint(condition=Q(floor_gross_price__isnull=True) | Q(floor_gross_price__gte=0), name='assignment_floor_nonnegative'),
            models.CheckConstraint(condition=Q(effective_until__isnull=True) | Q(effective_until__gt=F('effective_from')), name='batch_assignment_dates_valid'),
        ]

    @property
    def expected_unit_profit(self):
        return self.price_version.net_price - self.batch.unit_cost

    @property
    def extra_profit_per_unit(self):
        return self.expected_unit_profit - self.price_version.policy.remaining_target_profit

    def clean(self):
        super().clean()
        if not self.batch_id or not self.price_version_id:
            return
        try:
            batch, price = self.batch, self.price_version
        except ObjectDoesNotExist:
            return
        if batch.product_id != price.product_id or batch.currency != price.currency:
            raise ValidationError('The batch and selling price must have the same product and currency.')
        if isinstance(self.candidate_gross_price, Decimal):
            cent = Decimal('0.01')
            net = (batch.unit_cost + price.policy.remaining_target_profit).quantize(cent, rounding=ROUND_HALF_UP)
            rate = price.tax_version.rate_percent if price.tax_applied else Decimal('0')
            candidate = net + (net * rate / 100).quantize(cent, rounding=ROUND_HALF_UP)
            if self.candidate_gross_price != candidate:
                raise ValidationError({'candidate_gross_price': 'Candidate must follow this batch cost, policy and tax rate.'})
            floor = self.floor_gross_price if isinstance(self.floor_gross_price, Decimal) else Decimal('0')
            if price.gross_price != max(candidate, floor):
                raise ValidationError('The selling price must equal the candidate or the higher recorded floor.')
        if self.effective_from:
            if self.effective_from < price.effective_from or (price.effective_until and (not self.effective_until or self.effective_until > price.effective_until)):
                raise ValidationError('The assignment period must be within the selling-price eligibility period.')
            overlaps = type(self).objects.filter(batch_id=self.batch_id).exclude(pk=self.pk)
            if self.effective_until:
                overlaps = overlaps.filter(effective_from__lt=self.effective_until)
            if overlaps.filter(Q(effective_until__isnull=True) | Q(effective_until__gt=self.effective_from)).exists():
                raise ValidationError('Price assignments for the same batch cannot overlap.')

    def save(self, *args, **kwargs):
        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            fields = ('batch_id', 'price_version_id', 'candidate_gross_price', 'floor_gross_price', 'effective_from')
            if any(getattr(old, field) != getattr(self, field) for field in fields):
                raise ValidationError('Create a new assignment instead of overwriting batch pricing history.')
        self.full_clean()
        return super().save(*args, **kwargs)


class StockReservation(models.Model):
    '''Temporary hold on received stock for a checkout, not a physical sale.

    checkout_reference: identifier of the checkout requesting the hold.
    batch: physical stock being held; price_assignment: its agreed pricing link.
    quantity: number held; status: ACTIVE, CONSUMED, RELEASED or EXPIRED.
    created_at: start of the hold; expires_at: deadline for releasing it.
    request_id: unique retry identifier for the same reservation request.
    Saving does not increment counters, enforce transitions or expire holds;
    the reservation service must do those operations together in a transaction.
    '''
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        CONSUMED = 'CONSUMED', 'Consumed'
        RELEASED = 'RELEASED', 'Released'
        EXPIRED = 'EXPIRED', 'Expired'

    checkout_reference = models.UUIDField(db_index=True)
    batch = models.ForeignKey(StockBatch, on_delete=models.PROTECT, related_name='reservations')
    price_assignment = models.ForeignKey(BatchPriceAssignment, on_delete=models.PROTECT, related_name='reservations')
    quantity = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    expires_at = models.DateTimeField()
    request_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    class Meta:
        indexes = [models.Index(fields=['status', 'expires_at'], name='reservation_expiry_idx')]
        constraints = [
            models.UniqueConstraint(fields=['checkout_reference', 'batch'], name='reservation_checkout_batch_unique'),
            models.CheckConstraint(condition=Q(quantity__gt=0), name='reservation_quantity_positive'),
            models.CheckConstraint(condition=Q(expires_at__gt=F('created_at')), name='reservation_expiry_valid'),
        ]

    def clean(self):
        super().clean()
        try:
            if self.price_assignment.batch_id != self.batch_id:
                raise ValidationError({'price_assignment': 'The price assignment must belong to the reserved batch.'})
        except ObjectDoesNotExist:
            pass

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


class StockMovement(models.Model):
    '''Audit entry explaining a physical stock increase or decrease.

    batch: affected stock; kind: RECEIPT, SALE, RETURN, DAMAGE or ADJUSTMENT.
    quantity_delta: signed change, e.g. +3 received or -1 dispatched.
    balance_after: physical units remaining immediately after this operation.
    operation_id: retry/group identifier; reuse it for the same stock operation.
    reference: optional order/document reference; recorded_by: responsible account.
    created_at: entry time; reverses: earlier movement corrected by an opposite entry.
    Normal instance saves/deletes preserve history; bulk operations bypass them.
    A service must update the batch and write this entry atomically. Saving this
    entry alone does not change stock or verify the previous running balance.
    '''
    class Kind(models.TextChoices):
        RECEIPT = 'RECEIPT', 'Receipt'
        SALE = 'SALE', 'Sale'
        RETURN = 'RETURN', 'Return'
        DAMAGE = 'DAMAGE', 'Damage'
        ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'

    batch = models.ForeignKey(StockBatch, on_delete=models.PROTECT, related_name='movements')
    kind = models.CharField(max_length=12, choices=Kind.choices)
    quantity_delta = models.IntegerField()
    balance_after = models.PositiveIntegerField()
    operation_id = models.UUIDField(default=uuid.uuid4)
    reference = models.CharField(max_length=200, blank=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    reverses = models.OneToOneField('self', on_delete=models.PROTECT, null=True, blank=True, related_name='reversal')

    class Meta:
        ordering = ['-created_at', '-id']
        constraints = [
            models.UniqueConstraint(fields=['operation_id', 'batch', 'kind'], name='movement_operation_batch_unique'),
            models.CheckConstraint(condition=~Q(quantity_delta=0), name='movement_delta_nonzero'),
            models.CheckConstraint(condition=Q(balance_after__gte=0), name='movement_balance_nonnegative'),
            models.CheckConstraint(condition=(Q(kind__in=['RECEIPT', 'RETURN'], quantity_delta__gt=0) | Q(kind__in=['SALE', 'DAMAGE'], quantity_delta__lt=0) | Q(kind='ADJUSTMENT')), name='movement_direction_valid'),
        ]

    def clean(self):
        super().clean()
        if self.reverses_id:
            try:
                original = self.reverses
            except ObjectDoesNotExist:
                return
            if original.batch_id != self.batch_id or self.quantity_delta != -original.quantity_delta or self.reverses_id == self.pk:
                raise ValidationError('A reversal must negate a movement from the same batch.')

    def save(self, *args, **kwargs):
        if self.pk and type(self).objects.filter(pk=self.pk).exists():
            raise ValidationError('Stock movements are append-only; record a reversal or correction.')
        self.full_clean()
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError('Stock movements are audit records and cannot be deleted.')


class InventorySummary(models.Model):
    '''Rebuildable product totals for fast reads, not independent stock truth.

    product: catalogue item summarised; total_on_hand: physical units across batches.
    total_reserved: held units; quantity_available: on-hand minus reserved.
    current_price_version: selling price currently offered by the stock allocator.
    quantity_at_current_price: available units across batches offered at that price.
    version: projection revision for cache invalidation; updated_at: refresh time.
    Dates alone do not switch price tiers. The stock service chooses the next
    available batch, aggregates matching prices and updates this summary.
    '''
    product = models.OneToOneField('app_products.Product', on_delete=models.PROTECT, related_name='inventory_summary')
    total_on_hand = models.PositiveIntegerField(default=0)
    total_reserved = models.PositiveIntegerField(default=0)
    current_price_version = models.ForeignKey(ProductPriceVersion, on_delete=models.PROTECT, null=True, blank=True)
    quantity_at_current_price = models.PositiveIntegerField(default=0)
    version = models.PositiveBigIntegerField(default=0)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(total_on_hand__gte=0, total_reserved__gte=0) & Q(total_reserved__lte=F('total_on_hand')), name='summary_quantities_valid'),
            models.CheckConstraint(condition=Q(quantity_at_current_price__lte=F('total_on_hand') - F('total_reserved')), name='summary_tier_quantity_valid'),
            models.CheckConstraint(condition=Q(current_price_version__isnull=False) | Q(quantity_at_current_price=0), name='summary_price_required'),
        ]

    @property
    def quantity_available(self):
        return self.total_on_hand - self.total_reserved

    def clean(self):
        super().clean()
        try:
            if self.current_price_version_id and self.current_price_version.product_id != self.product_id:
                raise ValidationError({'current_price_version': 'The summary price must belong to its product.'})
        except ObjectDoesNotExist:
            pass

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)
