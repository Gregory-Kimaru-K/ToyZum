from rest_framework_simplejwt.views import TokenRefreshView
from .jwt_serializers import CustomTokenObtainPairView
from django.urls import path
from .views import custom_user_create, custom_user_update, product_view_create, ProductView

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/create/', custom_user_create, name='custom_user_create'),
    path('user/update/<str:eml>/', custom_user_update, name='custom_user_update'),
    path('product/create/', product_view_create, name='product_view_create'),
    path('product/<int:pk>/', ProductView.as_view(), name='product_view_update'),
]