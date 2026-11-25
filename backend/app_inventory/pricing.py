'''Prepare batch pricing without changing stock, publishing a tier or touching caches.'''
from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Max, Q
from django.utils import timezone

from app_products.models import Product
from .models import BatchPriceAssignment, ProductPriceVersion, StockBatch


def _valid_at(queryset, at):
    return queryset.filter(effective_from__lte=at).filter(
        Q(effective_until__isnull=True) | Q(effective_until__gt=at)
    )


@transaction.atomic
def prepare_batch_price(batch, *, policy, tax_version, tax_applied=False, at=None):
    '''Return the batch's assignment, reusing a compatible previous selling price.

    Call after receiving a batch, supplying the deliberately selected policy and tax
    status. Equal costs inherit the same price row when policy/tax/currency still match.
    Lower costs also reuse that row when keep_price_floor retains the previous price.
    Different tax or policy inputs always have distinct price versions, even when the
    gross amount coincides. No stock counters, storefront summaries or caches change.
    Concurrent callers must use this entry point to honour the product-row lock.
    '''
    if batch.pk is None:
        raise ValidationError('Save the stock batch before preparing its price.')
    at = at or timezone.now()
    Product.objects.select_for_update().get(pk=batch.product_id)
    batch = StockBatch.objects.select_for_update().get(pk=batch.pk)
    if policy.product_id != batch.product_id or policy.tax_rule_id != tax_version.tax_rule_id:
        raise ValidationError('Choose the product policy and its matching tax classification.')
    for source in (policy, tax_version):
        if at < source.effective_from or (source.effective_until and at >= source.effective_until):
            raise ValidationError('The policy and tax version must be valid at the preparation time.')
    existing = _valid_at(batch.price_assignments.select_related('price_version'), at).first()
    if existing:
        price = existing.price_version
        if price.policy_id == policy.pk and price.tax_version_id == tax_version.pk and price.tax_applied == tax_applied:
            if price.effective_from <= at and (price.effective_until is None or at < price.effective_until):
                return existing
        raise ValidationError('Close the current batch assignment before preparing replacement pricing.')

    # The immediately preceding batch is the comparison, even if already sold out.
    previous_batch = StockBatch.objects.filter(product_id=batch.product_id).filter(
        Q(received_at__lt=batch.received_at)
        | Q(received_at=batch.received_at, pk__lt=batch.pk)
    ).order_by('-received_at', '-pk').first()
    previous_assignment = None
    if previous_batch:
        previous_assignment = previous_batch.price_assignments.filter(
            effective_from__lte=at
        ).select_related('price_version').order_by('-effective_from', '-pk').first()

    cent = Decimal('0.01')
    def rounded(value):
        return value.quantize(cent, rounding=ROUND_HALF_UP)

    net_candidate = rounded(batch.unit_cost + policy.remaining_target_profit)
    rate = tax_version.rate_percent if tax_applied else Decimal('0')
    candidate = net_candidate + rounded(net_candidate * rate / 100)
    floor = None
    if policy.keep_price_floor and previous_assignment:
        previous_price = previous_assignment.price_version
        if previous_price.currency == batch.currency:
            floor = previous_price.gross_price
    gross = max(candidate, floor or Decimal('0'))
    tax = rounded(gross * rate / (100 + rate))
    net = gross - tax
    deadlines = [source.effective_until for source in (policy, tax_version) if source.effective_until]
    until = min(deadlines) if deadlines else None

    eligible = _valid_at(ProductPriceVersion.objects.filter(
        product_id=batch.product_id, currency=batch.currency,
        policy=policy, tax_version=tax_version, tax_applied=tax_applied,
        gross_price=gross, net_price=net, tax_amount=tax,
    ), at)
    price = None
    if previous_assignment:
        # Prefer the exact previous price ID when costs/inputs produce the same price.
        price = eligible.filter(pk=previous_assignment.price_version_id).first()
    if price is None:
        price = eligible.order_by('-revision').first()
    if price is None:
        revision = (ProductPriceVersion.objects.filter(product_id=batch.product_id).aggregate(
            last=Max('revision')
        )['last'] or 0) + 1
        price = ProductPriceVersion.objects.create(
            product_id=batch.product_id, policy=policy, tax_version=tax_version,
            revision=revision, currency=batch.currency, gross_price=gross,
            net_price=net, tax_amount=tax, tax_applied=tax_applied,
            effective_from=at, effective_until=until,
        )
    if price.effective_until and (until is None or price.effective_until < until):
        until = price.effective_until
    return BatchPriceAssignment.objects.create(
        batch=batch, price_version=price, candidate_gross_price=candidate,
        floor_gross_price=floor, effective_from=at, effective_until=until,
    )
