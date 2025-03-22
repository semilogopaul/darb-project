from django.urls import path
from .views import (
    UserRegistrationView, 
    CustomTokenObtainPairView, 
    CurrentUserView, 
    ProtectedView, WithdrawView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-registration'),
    path('login/', CustomTokenObtainPairView.as_view(), name='custom-token-obtain-pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('protected/', ProtectedView.as_view(), name='protected-view'),
    path('withdraw/', WithdrawView.as_view(), name='withdraw'),
]
