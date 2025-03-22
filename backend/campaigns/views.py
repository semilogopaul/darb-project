from rest_framework import generics, permissions
from .models import Campaign, Loan, Repayment
from .serializers import CampaignSerializer, LoanSerializer, RepaymentSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter
from django.conf import settings
import requests
import uuid
from users.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404

class CampaignCreateView(generics.ListCreateAPIView):
    queryset = Campaign.objects.filter(is_approved=True)  # Ensure only approved campaigns are listed
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  # Allow file uploads (image)

    def perform_create(self, serializer):
        serializer.save(founder=self.request.user)


class CampaignSearchView(generics.ListAPIView):
    serializer_class = CampaignSerializer
    filter_backends = [SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        # Get only approved campaigns
        qs = Campaign.objects.filter(is_approved=True)
        # Update the status for each campaign
        for campaign in qs:
            campaign.update_status()
        # Re-query to return only campaigns still approved after update
        return Campaign.objects.filter(is_approved=True)

class LoanCreateView(generics.CreateAPIView):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]


class InitializeRepaymentView(APIView):
    def post(self, request, *args, **kwargs):
        campaign_id = request.data.get("campaign_id")
        amount = request.data.get("amount")
        email = request.user.email  # Ensure user is authenticated

        # Retrieve campaign using get_object_or_404 for consistency
        campaign = get_object_or_404(Campaign, id=campaign_id, is_approved=True)

        # Check if the repayment amount exceeds the remaining repayment for the campaign
        remaining = campaign.remaining_repayment()
        if float(amount) > float(remaining):
            return Response(
                {"error": f"Amount exceeds remaining repayment: {remaining}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate a unique reference for the transaction
        reference = str(uuid.uuid4())

        # Prepare the Paystack API payload
        payload = {
            "email": email,
            "amount": int(float(amount) * 100),  # Convert Naira to kobo
            "reference": reference,
            # "callback_url": f"{settings.FRONTEND_URL}/repayment-success",  # Uncomment if needed
        }
        url = "https://api.paystack.co/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            res_data = response.json()
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not res_data.get("status"):
            return Response(
                {"error": "Repayment initialization failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Return response in the same format as payment initialization
        data = {
            "authorization_url": res_data["data"]["authorization_url"],
            "reference": reference
        }
        return Response(
            {"data": data, "message": "Repayment initialized successfully"},
            status=status.HTTP_200_OK
        )


class VerifyRepaymentView(APIView):
    def get(self, request, reference, *args, **kwargs):
        # Verify repayment via Paystack
        url = f"https://api.paystack.co/transaction/verify/{reference}"
        headers = {"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"}
        try:
            response = requests.get(url, headers=headers)
            res_data = response.json()
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not res_data.get("status") or res_data["data"]["status"] != "success":
            return Response(
                {"error": "Repayment verification failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Convert amount from kobo (integer) to Naira (Decimal)
        amount_paid = Decimal(res_data["data"]["amount"]) / 100

        # Retrieve the campaign using a query parameter
        campaign_id = request.query_params.get("campaign_id")
        campaign = get_object_or_404(Campaign, id=campaign_id)

        # Create or retrieve the repayment record
        repayment, created = Repayment.objects.get_or_create(
            campaign=campaign,
            reference=reference,
            defaults={"amount": amount_paid, "is_verified": True}
        )

        if not created:
            return Response(
                {"message": "Repayment already verified"},
                status=status.HTTP_200_OK
            )

        # After a new repayment, update the campaign's status
        campaign.update_status()

        # If the campaign has been fully repaid, disburse funds to lenders.
        if campaign.remaining_repayment() <= 0:
            self.disburse_to_lenders(campaign)

        return Response(
            {"message": "Repayment verified successfully"},
            status=status.HTTP_200_OK
        )

    def disburse_to_lenders(self, campaign):
        """
        Disburse the fully repaid amount to lenders.
        """
        # Get lenders and their respective loan amounts
        lenders = campaign.loans.values_list("lender_id", "amount")
        lender_map = {}

        total_donated = sum(amount for _, amount in lenders)
        if total_donated == 0:
            return  # Avoid division by zero

        total_repayment = campaign.calculate_total_repayment()

        # Calculate repayment share for each lender
        for lender_id, amount in lenders:
            repayment_share = (amount / total_donated) * total_repayment
            lender_map[lender_id] = lender_map.get(lender_id, Decimal(0)) + repayment_share

        # Retrieve lender objects and update their balances in a transaction
        lender_ids = lender_map.keys()
        lender_objects = {lender.id: lender for lender in User.objects.filter(id__in=lender_ids)}

        with transaction.atomic():
            for lender_id, amount in lender_map.items():
                lender = lender_objects[lender_id]
                lender.balance += amount
                lender.save()

class CampaignProgressView(generics.RetrieveAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
