from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers
from django.conf import settings
from .models import Campaign, Loan, Repayment

class CampaignSerializer(serializers.ModelSerializer):
    total_repayment = serializers.SerializerMethodField()
    remaining_repayment = serializers.SerializerMethodField()
    repayment_progress = serializers.SerializerMethodField()
    funding_progress = serializers.SerializerMethodField()
    monthly_due_info = serializers.SerializerMethodField()
    has_funded = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'description', 'goal_amount', 'current_amount', 
            'interest_rate', 'repayment_period', 'is_approved', 'funded_at', 'created_at', 'founder',
            'total_repayment', 'remaining_repayment', 'repayment_progress',  
            'funding_progress', 'is_fully_repaid', 'image', 'cac_d_img', 'monthly_due_info',
            'has_funded'
        ]
        read_only_fields = ['current_amount', 'is_approved', 'founder']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            rep['image'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
        else:
            rep['image'] = None
        if instance.cac_d_img:
            rep['cac_d_img'] = request.build_absolute_uri(instance.cac_d_img.url) if request else instance.cac_d_img.url
        else:
            rep['cac_d_img'] = None
        return rep

    def get_total_repayment(self, obj):
        return obj.calculate_total_repayment()

    def get_remaining_repayment(self, obj):
        return obj.remaining_repayment()

    def get_repayment_progress(self, obj):
        return obj.repayment_progress()

    def get_funding_progress(self, obj):
        if obj.goal_amount == 0:
            return 0
        return (Decimal(obj.current_amount) / Decimal(obj.goal_amount)) * 100

    def get_monthly_due_info(self, obj):
        return obj.get_monthly_due_info()

    def get_has_funded(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.loans.filter(lender=request.user).exists()
        return False

    def create(self, validated_data):
        validated_data['founder'] = self.context['request'].user
        return super().create(validated_data)


class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = ['id', 'campaign', 'lender', 'amount', 'created_at']
        read_only_fields = ['lender']

    def create(self, validated_data):
        validated_data['lender'] = self.context['request'].user
        campaign = validated_data['campaign']

        # Update campaign's current amount
        campaign.current_amount += validated_data['amount']
        campaign.save()

        # Check if the campaign is fully funded and hasn't been funded already.
        if campaign.current_amount >= campaign.goal_amount and campaign.funded_at is None:
            campaign.funded_at = timezone.now()  # Set funded date
            campaign.save()

            # Transfer funds to the founder
            founder = campaign.founder
            if hasattr(founder, 'balance'):
                founder.balance += campaign.goal_amount
                founder.save()

        return super().create(validated_data)
    

class RepaymentSerializer(serializers.ModelSerializer):
    campaign_id = serializers.IntegerField(write_only=True)  # Accept campaign ID from the request
    campaign = serializers.StringRelatedField(read_only=True)  # Read-only campaign data

    class Meta:
        model = Repayment
        fields = ['id', 'campaign_id', 'campaign', 'amount', 'created_at']

    def validate_campaign_id(self, value):
        try:
            campaign = Campaign.objects.get(id=value, is_approved=True)
            return campaign
        except Campaign.DoesNotExist:
            raise serializers.ValidationError("Campaign does not exist or is not approved.")

    def validate_amount(self, value):
        campaign = self.context.get('campaign')
        if not campaign:
            raise serializers.ValidationError("Campaign is required.")
        remaining = campaign.remaining_repayment()
        if value > remaining:
            raise serializers.ValidationError(f"Amount exceeds the remaining repayment of {remaining}.")
        return value

    def create(self, validated_data):
        campaign = validated_data.pop('campaign_id')

        # Add the repayment
        repayment = Repayment.objects.create(campaign=campaign, **validated_data)

        # Check if the campaign is fully repaid
        if campaign.remaining_repayment() <= 0:
            campaign.is_fully_repaid = True
            campaign.save()

        return repayment
