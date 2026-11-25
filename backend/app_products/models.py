from django.db import models
from django.db.models import F, Q
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from django.conf import settings
import uuid
from django.utils.text import slugify

# Create your models here.
class Industry(models.Model):
    '''Top-level catalogue department.

    name: unique department name; image: optional department artwork.
    created_at: creation time; slug: unique URL label generated on first save.
    '''
    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.TextField(unique=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            c = 1

            while Industry.objects.filter(slug=slug).exists():
                unique_part = f"{uuid.uuid4().hex[:8]}{self.id}"
                slug = f'{base_slug}-{unique_part}'

                c += 1

                if c > 20:
                    raise ValueError("Cannot generate unique slug")
                
            self.slug = slug
        return super().save(*args, **kwargs)

class Category(models.Model):
    '''Catalogue grouping inside one department; products may use many categories.

    name: category label; image: optional artwork; industry: parent department.
    created_at: creation time; slug: unique URL label generated on first save.
    Deleting the department currently cascades to its categories.
    '''
    name = models.CharField(max_length=100)
    image = models.ImageField(null=True, blank=True)
    industry = models.ForeignKey(Industry, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.TextField(unique=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            c = 1

            while Category.objects.filter(slug=slug).exists():
                unique_part = f"{uuid.uuid4().hex[:8]}{self.id}"
                slug = f'{base_slug}-{unique_part}'

                c += 1

                if c > 20:
                    raise ValueError("Cannot generate unique slug")
                
            self.slug = slug
        return super().save(*args, **kwargs)

class Product(models.Model):
    '''Catalogue identity and merchandising information, shared by all stock batches.

    name/description: customer-facing item details; images: list of image references.
    categories: many-to-many catalogue groups; gender: existing suitability label.
    min_age/max_age: intended age range, with no upper limit when max_age is empty.
    seller: existing account link, intended to become the staff creator reference.
    featured/flash_sale: merchandising flags; created_at: creation time.
    slug: generated unique URL label.
    price/discounted_price/quantity: older compatibility fields, NOT automatically
    maintained by inventory. Batch assignments determine the new selling prices;
    stock batches determine physical availability. Do not edit both independently.
    '''
    GENDER_CHOICES = [
        ("BOY", "Boy"),
        ("GIRL", "Girl"),
        ("UNISEX", "Unisex")
    ]
    name = models.CharField(max_length=50)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    images = models.JSONField(default=list)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    categories = models.ManyToManyField(Category, related_name="products", blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    min_age = models.IntegerField(default=1)
    max_age = models.IntegerField(null=True, blank=True)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    featured = models.BooleanField(default=False)
    flash_sale = models.BooleanField(default=False)
    slug = models.TextField(unique=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            c = 1

            while Product.objects.filter(slug=slug).exists():
                unique_part = f"{uuid.uuid4().hex[:8]}{self.id}"
                slug = f'{base_slug}-{unique_part}'

                c += 1

                if c > 20:
                    raise ValueError("Cannot generate unique slug")
                
            self.slug = slug
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class TaxRule(models.Model):
    '''Stable tax classification whose dated rules are stored in TaxRuleVersion.

    code: unique machine-readable classification; name: readable label.
    is_active: availability flag; selection services must enforce it.
    A classification is not a rate and does not establish the store's VAT status.
    '''
    code = models.SlugField(max_length=40, unique=True)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class TaxRuleVersion(models.Model):
    '''Dated treatment and rate for a tax classification; preserve prior versions.

    tax_rule: parent classification; revision: explicit version number, starting at 1.
    treatment: TAXABLE, ZERO_RATED, EXEMPT or NON_VAT; these remain distinct.
    rate_percent: percentage, not a money amount; no rate is hardcoded.
    effective_from: inclusive start; effective_until: exclusive end, null if open.
    created_at: record creation time. These dates describe legal/configured validity,
    not batch arrival or exhaustion. Normal saves preserve historical inputs.
    Publication must lock the parent rule to prevent concurrent overlapping periods.
    '''
    class Treatment(models.TextChoices):
        TAXABLE = 'TAXABLE', 'Taxable'
        ZERO_RATED = 'ZERO_RATED', 'Zero rated'
        EXEMPT = 'EXEMPT', 'Exempt'
        NON_VAT = 'NON_VAT', 'Non-VAT'

    tax_rule = models.ForeignKey(TaxRule, on_delete=models.PROTECT, related_name='versions')
    revision = models.PositiveIntegerField()
    treatment = models.CharField(max_length=12, choices=Treatment.choices)
    rate_percent = models.DecimalField(max_digits=6, decimal_places=3)
    effective_from = models.DateTimeField()
    effective_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ['tax_rule_id', '-effective_from', '-id']
        constraints = [
            models.UniqueConstraint(fields=['tax_rule', 'revision'], name='tax_rule_revision_unique'),
            models.UniqueConstraint(fields=['tax_rule', 'effective_from'], name='tax_rule_start_unique'),
            models.CheckConstraint(condition=Q(revision__gte=1), name='tax_revision_positive'),
            models.CheckConstraint(condition=Q(rate_percent__gte=0, rate_percent__lte=100), name='tax_rate_valid'),
            models.CheckConstraint(condition=Q(treatment='TAXABLE') | Q(rate_percent=0), name='tax_nontaxable_rate_zero'),
            models.CheckConstraint(condition=Q(effective_until__isnull=True) | Q(effective_until__gt=F('effective_from')), name='tax_dates_valid'),
        ]

    def clean(self):
        super().clean()
        if self.tax_rule_id and self.effective_from:
            overlaps = type(self).objects.filter(tax_rule_id=self.tax_rule_id).exclude(pk=self.pk)
            if self.effective_until:
                overlaps = overlaps.filter(effective_from__lt=self.effective_until)
            overlaps = overlaps.filter(Q(effective_until__isnull=True) | Q(effective_until__gt=self.effective_from))
            if overlaps.exists():
                raise ValidationError('Tax rate periods for the same classification cannot overlap.')

    def save(self, *args, **kwargs):
        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            if any(getattr(old, field) != getattr(self, field) for field in ('tax_rule_id', 'revision', 'treatment', 'rate_percent', 'effective_from')):
                raise ValidationError('Create a new tax version instead of changing an existing rate.')
        self.full_clean()
        return super().save(*args, **kwargs)


class PricingPolicy(models.Model):
    '''Versioned per-unit pricing instructions for one product, not a selling price.

    product: catalogue item; revision: explicit version number, starting at 1.
    target_profit: desired margin over batch unit cost before sales tax/other fees.
    profit_discount: money surrendered from that target, not the final sale price.
    remaining_target_profit: target_profit minus profit_discount, calculated on access.
    keep_price_floor: retain the previous gross selling price if a new candidate is lower;
    disable it in a new policy when deliberately allowing a lower promotional price.
    tax_rule: classification used to select the dated tax version.
    effective_from: inclusive start; effective_until: exclusive end, null if open.
    created_at/created_by: creation time and account responsible.
    Publication must lock the product row; saving does not reprice batches automatically.
    '''
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='pricing_policies')
    revision = models.PositiveIntegerField()
    target_profit = models.DecimalField(max_digits=12, decimal_places=2)
    profit_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    keep_price_floor = models.BooleanField(default=True)
    tax_rule = models.ForeignKey(TaxRule, on_delete=models.PROTECT, related_name='pricing_policies')
    effective_from = models.DateTimeField()
    effective_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['product_id', '-effective_from', '-id']
        constraints = [
            models.UniqueConstraint(fields=['product', 'revision'], name='pricing_product_revision_unique'),
            models.UniqueConstraint(fields=['product', 'effective_from'], name='pricing_product_start_unique'),
            models.CheckConstraint(condition=Q(revision__gte=1), name='pricing_revision_positive'),
            models.CheckConstraint(condition=Q(target_profit__gte=0, profit_discount__gte=0) & Q(profit_discount__lte=F('target_profit')), name='pricing_profit_discount_valid'),
            models.CheckConstraint(condition=Q(effective_until__isnull=True) | Q(effective_until__gt=F('effective_from')), name='pricing_dates_valid'),
        ]

    @property
    def remaining_target_profit(self):
        return Decimal(str(self.target_profit)) - Decimal(str(self.profit_discount))

    def clean(self):
        super().clean()
        if self.product_id and self.effective_from:
            overlaps = type(self).objects.filter(product_id=self.product_id).exclude(pk=self.pk)
            if self.effective_until:
                overlaps = overlaps.filter(effective_from__lt=self.effective_until)
            overlaps = overlaps.filter(Q(effective_until__isnull=True) | Q(effective_until__gt=self.effective_from))
            if overlaps.exists():
                raise ValidationError('Pricing policy periods for the same product cannot overlap.')

    def save(self, *args, **kwargs):
        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            if any(getattr(old, field) != getattr(self, field) for field in ('product_id', 'revision', 'target_profit', 'profit_discount', 'keep_price_floor', 'tax_rule_id', 'effective_from')):
                raise ValidationError('Create a new policy revision instead of overwriting pricing history.')
        self.full_clean()
        return super().save(*args, **kwargs)
