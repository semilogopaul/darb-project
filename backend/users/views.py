from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer, WithdrawSerializer
)
from .permissions import IsAccountApproved
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class UserRegistrationView(APIView):
    def post(self, request):
        print("Received data:", request.data)  # Log incoming data
        
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)
        
        print("Errors:", serializer.errors)  # Log errors if validation fails
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated, IsAccountApproved]

    def get(self, request):
        return Response({'message': 'Welcome! Your account is approved.'})

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class WithdrawView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WithdrawSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            amount = serializer.validated_data['amount']
            user = request.user

            if user.balance < amount:
                return Response({'error': 'Insufficient balance.'}, status=status.HTTP_400_BAD_REQUEST)

            # Perform withdrawal within a transaction
            with transaction.atomic():
                user.balance -= amount
                user.save()

            return Response({'message': 'Withdrawal successful.', 'new_balance': user.balance}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)