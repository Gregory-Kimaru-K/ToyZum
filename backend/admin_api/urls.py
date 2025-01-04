from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views_jwt import CustomObtainPairView
from .views import createUserView

urlpatterns = [
    path('token/', CustomObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/<int:pk>/', createUserView.as_view(), name='user_view'),
    path('user/', createUserView.as_view(), name='user_view')
]