from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import (
    CampaignCreateView, LoanCreateView, InitializeRepaymentView, VerifyRepaymentView,
    CampaignProgressView, CampaignSearchView
)

urlpatterns = [
    path('create/', CampaignCreateView.as_view(), name='campaign-create'), #for getting and creating campaigns
    path('repayment/initialize/', InitializeRepaymentView.as_view(), name='initialize-repayment'),
    path('repayment/verify/<str:reference>/', VerifyRepaymentView.as_view(), name='verify-repayment'),
    path('campaign/<int:pk>/progress/', CampaignProgressView.as_view(), name='campaign-progress'),
    path('campaign/search/', CampaignSearchView.as_view(), name='campaign-search'),  # ✅ Search campaigns
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)