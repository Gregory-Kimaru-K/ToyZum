import graphene
from graphene_django.filter import DjangoFilterConnectionField
from graphene_django.types import DjangoObjectType
from .models import Product, Industry, Category, Order

class IndustryType(DjangoObjectType):
    class Meta:
        model = Industry
        fields = ("id", "name", "image", "slug")

class CategoryType(DjangoObjectType):
    class Meta:
        model = Category
        fields = ("id", "name", "image", "industry", "slug")

class ProductType(DjangoObjectType):
    images = graphene.List(graphene.String)
    class Meta:
        model = Product
        fields = ("id", "name", "description", "price", "discounted_price",
                  "images", "quantity", "category", "gender", "seller",
                  "featured", "flash_sale", "verified", "slug")
        
        filter_fields = {
            "category__slug": ["exact", "in"],
            "category__industry__slug": ["exact"],
            "featured": ["exact"],
            "flash_sale": ["exact"],
            "gender": ["exact"],
            "verified": ["exact"],
            "price": ["lt", "gt", "exact"],
            "seller__email": ["exact"]
        }
        interfaces = (graphene.relay.Node,)
    def resolve_images(self, info):
        return self.images or []
    
class OrderType(DjangoObjectType):
    class Meta:
        model = Order
        fields = ("id", "slug", "product", "client", "quantity")

        filter_fields = {
            "client__email": ["exact"],
            "product__seller__email": ["exact"]
        }
        interfaces = (graphene.relay.Node,)

class Query(graphene.ObjectType):
    all_products = DjangoFilterConnectionField(ProductType)
    all_categories = graphene.List(CategoryType)
    all_industries = graphene.List(IndustryType)
    all_orders = DjangoFilterConnectionField(OrderType)

    def resolve_all_categories(self, info):
        return Category.objects.all()
    def resolve_all_industries(self, info):
        return Industry.objects.all()

schema = graphene.Schema(query=Query)