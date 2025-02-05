from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from .serializers import CustomUserSerializer, ProductSerializer, CategorySerializer, OrderSerializer
from .models import CustomUser, Product, Category,Order
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
    
    data = request.data
    data['seller'] = request.user.id
    serializer = ProductSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    
    except Product.DoesNotExist:
        return Response({"error": "Product does not exist"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProductSerializer(product)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_products(request):
    category_id = request.GET.get('category', None)

    if not category_id:
        return Response({"error": "Category id required"}, status=status.HTTP_400_BAD_REQUEST)

    product = Product.objects.filter(category=category_id)

    if not product.exists():
        return Response({'error': "No product of this category found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProductSerializer(product, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)




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
        
@api_view(['GET'])
def read_category(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

class CategoryView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        name = request.data.get("name")
        image = request.data.get("image")
        
        category = Category.objects.create(name=name, image=image)
        return Response({"message": "Category created successfully", "category_id": category.id}, status=status.HTTP_201_CREATED)
            
    
    def put(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)

        except Category.DoesNotExist:
            return Response({'error': "Category does not exist"}, status=status.HTTP_204_NO_CONTENT)
        
        serializer = CategorySerializer(category, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
            category.delete()
            return Response({'message': 'Deleted successfully'}, status=status.HTTP_200_OK)
        
        except Category.DoesNotExist:
            return Response({"error": "Category does not exist"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    order = Order.objects.create(product=product, client=request.user)

    serializer = OrderSerializer(order)

    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_orders(request):
    if request.user.role == ["SUPERUSER", "SELLER"]:
        ordered_products = Order.objects.filter(product__seller = request.user)

        if not ordered_products.exists():
            return Response({"message": "No products found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(ordered_products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    ordered_products = Order.objects.filter(client=request.user)
    if not ordered_products.exists():
        return Response({"message": "No products found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderSerializer(ordered_products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)

        serilizer = OrderSerializer(order)
        return Response(serilizer.data, status=status.HTTP_200_OK)

    def put(self, request, order_id):
        order = get_object_or_404(Order, id = order_id)

        valid_statuses = ["CONFIRMED", "SHIPPING", "SHIPPED", "DELIVERED", "CANCELLED"]

        if request.user.role not in ['SUPERUSER', "SELLER"]:
            valid_statuses = ["CANCELLED"]

        new_status = request.data.get("status")

        if new_status not in valid_statuses:
            return Response({"error": "Invalid status update"}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status

        order.save()

        return Response({"message": f"Order status updated successfully to {new_status}"}, status=status.HTTP_200_OK)