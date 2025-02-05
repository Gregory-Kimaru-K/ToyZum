from rest_framework_simplejwt.views import TokenRefreshView
from .jwt_serializers import CustomTokenObtainPairView
from django.urls import path
from .views import custom_user_create, custom_user_update, product_view_create, ProductView, CategoryView, read_category, get_products, get_product, get_orders, create_order, OrderView

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/create/', custom_user_create, name='custom_user_create'),
    path('user/update/<str:eml>/', custom_user_update, name='custom_user_update'),
    path('product/', get_products, name="get_products"),
    path('product/<int:pk>/', get_product, name='get_product'),
    path('product/create/', product_view_create, name='product_view_create'),
    path('product/<int:pk>/', ProductView.as_view(), name='product_view_update'),
    path('category/', read_category, name='category_get'),
    path('category/<int:pk>/', CategoryView.as_view(), name='category_view_update_delete'),
    path('category/new_category/', CategoryView.as_view(), name='category_create'),
    path('orders/', get_orders, name='get_orders'),
    path('orders/<int:product_id>', create_order, name='create_order'),
    path('orders/<int:order_id>', OrderView.as_view(), name='individual_orders')
]