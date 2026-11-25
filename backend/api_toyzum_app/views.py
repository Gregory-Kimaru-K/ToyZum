from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from .serializers import CustomUserSerializer, ProductSerializer, CategorySerializer, IndustrySerializer, OrderSerializer, AdvertSerializer
from .models import CustomUser, Product, Category,Order, Adverts
from rest_framework.response import Response
from rest_framework import status
from .jwt_serializers import MyTokenObtainPairSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser

# Create your views here.
@api_view(['POST'])
@permission_classes([AllowAny])
def custom_user_create(request):
    serializer = CustomUserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = MyTokenObtainPairSerializer.get_token(user)
        return Response({"refresh": str(refresh), "access": str(refresh.access_token)}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def custom_user_update(request, eml):
    if request.user.email != eml and not request.user.is_superuser:
        return Response({'detail': 'You cannot edit this account.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = CustomUser.objects.get(email=eml)
    
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CustomUserSerializer(user, data=request.data, partial=True)

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
    data['seller'] = request.user.id
    serializer = ProductSerializer(data=data, context={'request': request})

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def get_product(request, slug):
    try:
        product = Product.objects.get(slug=slug)

    except Product.DoesNotExist:
        return Response({"error": "Product does not exist"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProductSerializer(product)

    return Response(serializer.data, status=status.HTTP_200_OK)

class ProductView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, slug):
        try:
            product = Product.objects.get(slug=slug)
        
        except Product.DoesNotExist:
            return Response({"error": "Product does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProductSerializer(product)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, slug, request):
        try:
            product = product.objects.get(slug=slug)
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

    def delete(self, slug, request):
        try:
            product = product.objects.get(slug=slug)

            if (request.user.role == 'SELLER' and request.user == product.seller) or request.user.role !='SUPERUSER':
                product.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)

            else:
                return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
            
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_industry(request):
    serializer = IndustrySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_category(request):
    data = request.data
    serializer = CategorySerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, slug):
        try:
            category = Category.objects.get(slug=slug)

        except Category.DoesNotExist:
            return Response({'error': "Category does not exist"}, status=status.HTTP_204_NO_CONTENT)
        
        serializer = CategorySerializer(category, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, slug):
        try:
            category = Category.objects.get(slug=slug)
            category.delete()
            return Response({'message': 'Deleted successfully'}, status=status.HTTP_200_OK)
        
        except Category.DoesNotExist:
            return Response({"error": "Category does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
#ORDER VIEWS

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if product.seller == request.user:
        return Response({"detail": "You cannot create an order for your own product."}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data.copy()
    data["product"] = product.id
    data["client"] = request.user.id

    serializer = OrderSerializer(data=data)
    if serializer.is_valid():
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_orders(request):   
    ordered_products = Order.objects.filter(client=request.user)
    if not ordered_products.exists():
        return Response({"message": "No products found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderSerializer(ordered_products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_myorders(request):
    if request.user.role in ["SUPERUSER", "SELLER"]:
        ordered_products = Order.objects.filter(product__seller = request.user)

        if not ordered_products.exists():
            return Response({"detail": "No products found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(ordered_products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({"detail": "Endpoint not authorized"}, status=status.HTTP_401_UNAUTHORIZED)

class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_slug):
        order = get_object_or_404(Order, slug=order_slug)
        if request.user != order.client and request.user != order.product.seller:
            return Response({"detail": "Unauthorized Endpoint"}, status=status.HTTP_400_BAD_REQUEST)
        serilizer = OrderSerializer(order)
        return Response(serilizer.data, status=status.HTTP_200_OK)

    def put(self, request, order_slug):
        order = get_object_or_404(Order, slug=order_slug)

        valid_statuses = ["CONFIRMED", "SHIPPING", "SHIPPED", "DELIVERED", "CANCELLED"]

        if request.user.role not in ['SUPERUSER', "SELLER"]:
            valid_statuses = ["CANCELLED"]

        new_status = request.data.get("status")

        if new_status not in valid_statuses:
            return Response({"error": "Invalid status update"}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status

        order.save()

        return Response({"message": f"Order status updated successfully to {new_status}"}, status=status.HTTP_200_OK)
    

#Adverts endpoints
@api_view(["POST"])
def create_advert(request):
    serializer = AdvertSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def get_adverts(request):
    adverts = Adverts.objects.all()
    serializer = AdvertSerializer(adverts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

class AdvertView(APIView):
    def put(self, request, slug):
        advert = get_object_or_404(slug=slug)
        serializer = AdvertSerializer(advert, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        advert = get_object_or_404(slug=slug)
        advert.delete()
        return Response({"detail": "Deleted successfully"}, status=status.HTTP_200_OK)