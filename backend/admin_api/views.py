from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializers
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.
class createUserView(APIView):
    def post(self, request):
        serializer = UserSerializers(data = request.data)
        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            return Response({"message": "User created successfully!",
                             "access_token": access_token,
                             "refresh_token": refresh_token},
                              status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @permission_classes([IsAuthenticated])
    def put(self, request, *args, **kwargs):
        try:
            user = User.objects.get(pk=kwargs.get('pk'))
        except User.DoesNotExist:
            return Response({"message": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        if not (request.user.is_superuser or request.user.id == user.id):
            return Response({"message": "You do not have permission to update this user."},
                            status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializers(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User Updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)