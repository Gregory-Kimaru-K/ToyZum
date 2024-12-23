from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views_jwt import CustomObtainPairView

urlpatterns = [
    path('token/', CustomObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]