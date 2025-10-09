from rest_framework_simplejwt.views import TokenRefreshView
from .jwt_serializers import CustomTokenObtainPairView
from django.urls import path
from .views import custom_user_create, custom_user_update, product_view_create, get_product, ProductView, create_category, CategoryView, get_orders, get_myorders, create_order, OrderView, get_adverts, create_advert, AdvertView
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/create/', custom_user_create, name='custom_user_create'),
    path('user/update/<str:eml>/', custom_user_update, name='custom_user_update'),
    path('product/create/', product_view_create, name='product_view_create'),
    path('product/<str:slug>/', ProductView.as_view(), name='product_view_update'),
    path("product/view/<str:slug>/", get_product, name="get_product"),
    path("category/new/", create_category, name="create_category"),
    path('category/<str:slug>/', CategoryView.as_view(), name='category_view_update_delete'),
    path('orders/', get_orders, name='get_orders'),
    path("my_orders/", get_myorders, name="get_myorders"),
    path('orders/create/<int:product_id>/', create_order, name='create_order'),
    path('orders/<str:order_slug>/', OrderView.as_view(), name='individual_orders'),
    path("toyzum/graphql/",csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path("advert/new/", create_advert, name="create_advert"),
    path("advert/", get_adverts, name="get_adverts"),
    path("adverts/<str:slug>", AdvertView.as_view(), name="advert_endpoints"),
]