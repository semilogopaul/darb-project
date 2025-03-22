from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    identity_document = serializers.FileField(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'email', 'password',
            'bank_name', 'account_number', 'user_type', 'bvn', 
            'identity_document', 'balance', 'is_approved'
        ]
        read_only_fields = ['balance', 'is_approved']

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            bank_name=validated_data['bank_name'],
            account_number=validated_data['account_number'],
            user_type=validated_data['user_type'],
            bvn=validated_data.get('bvn'),
            identity_document=validated_data.get('identity_document'),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Block unapproved Founders from logging in
        if user.user_type == "founder" and not user.is_approved:
            raise serializers.ValidationError("Your account is not approved yet. Please wait for approval.")

        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'user_type', 'is_approved', 'balance']
        
class WithdrawSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_amount(self, value):
        user = self.context['request'].user
        if value <= 0:
            raise serializers.ValidationError("Withdrawal amount must be greater than zero.")
        if value > user.balance:
            raise serializers.ValidationError("Insufficient balance for withdrawal.")
        return value
