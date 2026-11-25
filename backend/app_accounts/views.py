from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status, response
from app_accounts.models import CustomUser
from app_accounts.serializers import CustomUserSerializer
from app_accounts.jwt_serializers import MyTokenObtainPairSerializer

# Create your views here.
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def custom_user_create(request):
    serializer = CustomUserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = MyTokenObtainPairSerializer.get_token(user)
        return response.Response({"refresh": str(refresh), "access": str(refresh.access_token)}, status=status.HTTP_201_CREATED)
    
    return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def custom_user_update(request, eml):
    if request.user.email != eml and not request.user.is_superuser:
        return response.Response({'detail': 'You cannot edit this account.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = CustomUser.objects.get(email=eml)
    
    except CustomUser.DoesNotExist:
        return response.Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CustomUserSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return response.Response(serializer.data, status=status.HTTP_200_OK)
    
    return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)