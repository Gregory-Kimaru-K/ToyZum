from rest_framework_simplejwt.views import TokenRefreshView
from app_accounts.jwt_serializers import CustomTokenObtainPairView
from django.urls import path
from app_accounts import views

url = [
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain"),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/create/', views.custom_user_create, name='custom_user_create'),
    path('user/update/<str:eml>/', views.custom_user_update, name='custom_user_update'),
]