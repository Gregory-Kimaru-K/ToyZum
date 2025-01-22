from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from .serializers import CustomUserSerializer, ProductSerializer
from .models import CustomUser, Product
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, IsAdminUser

# Create your views here.
@api_view(['POST'])
def custom_user_create(request):
    serializer = CustomUserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({"refresh": str(refresh), "access": str(refresh.access_token)}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def custom_user_update(request, eml):
    try:
        user = CustomUser.objects.get(email=eml)
    
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CustomUserSerializer(user, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Product views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def product_view_create(request):
    if request.user.role not in ['SUPERUSER', 'SELLER']:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    
    data = request.data.copy()
    images = request.FILES.getlist('images')
    data['seller'] = request.user.id
    data['images'] = images
    serializer = ProductSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, pk, request):
        try:
            product = product.objects.get(pk=pk)
            if (request.user.role == 'SELLER' and request.user == product.seller) or request.user.role !='SUPERUSER':
                serializer = ProductSerializer(product, data=request.data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            else:
                return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, pk, request):
        try:
            product = product.objects.get(pk=pk)

            if (request.user.role == 'SELLER' and request.user == product.seller) or request.user.role !='SUPERUSER':
                product.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
            
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        

class CategoryView(APIView):
    permission_classes = [IsAdminUser]

    def post(request):
        pass