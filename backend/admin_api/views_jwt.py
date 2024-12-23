from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer