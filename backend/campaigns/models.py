from django.db import models
from users.models import User
from decimal import Decimal
from django.utils import timezone
from dateutil.relativedelta import relativedelta

class Campaign(models.Model):
    founder = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='campaigns')
    title = models.CharField(max_length=255)
    description = models.TextField()
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage interest rate")
    repayment_period = models.PositiveIntegerField(help_text="Repayment period in months")
    is_approved = models.BooleanField(default=False)
    funded_at = models.DateTimeField(null=True, blank=True)  # Set when fully funded
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='campaigns/', null=True, blank=True)  # Banner image
    cac_d_img = models.ImageField(upload_to='cac_documents/', null=True, blank=True)  # CAC document image

    def __str__(self):
        return self.title

    def is_goal_reached(self):
        return self.current_amount >= self.goal_amount

    def calculate_total_repayment(self):
        interest = (self.goal_amount * self.interest_rate) / 100
        return Decimal(self.goal_amount) + Decimal(interest)

    def monthly_repayment_amount(self):
        total = self.calculate_total_repayment()
        if self.repayment_period:
            return total / Decimal(self.repayment_period)
        return None

    def remaining_repayment(self):
        total_repayment = self.calculate_total_repayment()
        repaid_amount = sum(repayment.amount for repayment in self.repayments.all())
        return total_repayment - Decimal(repaid_amount)

    def repayment_progress(self):
        total_repayment = self.calculate_total_repayment()
        repaid_amount = sum(repayment.amount for repayment in self.repayments.all())
        if total_repayment == 0:
            return 0
        return (Decimal(repaid_amount) / total_repayment) * 100

    def is_fully_repaid(self):
        return self.remaining_repayment() <= 0

    def update_status(self):
        """
        Check if the campaign is overdue or fully repaid.
        (Existing logic remains; see previous implementation.)
        """
        now = timezone.now() + timezone.timedelta(hours=1)
        repayment_deadline = self.created_at + timezone.timedelta(days=self.repayment_period * 30)
        updated = False
        if now > repayment_deadline and self.remaining_repayment() > 0:
            self.founder.has_defaulted = True
            self.founder.is_approved = False
            self.founder.save()
            if self.is_approved:
                self.is_approved = False
                self.save()
            updated = True
        elif self.remaining_repayment() <= 0:
            if self.is_approved:
                self.is_approved = False
                self.save()
            updated = True
        return updated

    def get_monthly_due_info(self):
        """
        Returns a dictionary with monthly repayment info:
          - monthly_repayment: calculated monthly installment amount.
          - installments_due: number of installments that should have been paid since funded.
          - installments_paid: count of verified repayments.
          - next_due_date: ISO formatted date when the next installment is due.
          - due_this_month: True if an installment is due for the current month.
          - amount_due: the monthly installment amount if due (or 0 otherwise).
        """
        if not self.funded_at:
            # Not yet fully funded, so no due info.
            return {}
        now = timezone.now() + timezone.timedelta(hours=1)
        # Calculate months passed since funded_at (using year and month differences)
        rd = relativedelta(now, self.funded_at)
        installments_due = rd.years * 12 + rd.months  # How many months passed
        installments_paid = self.repayments.filter(is_verified=True).count()
        monthly_amount = self.monthly_repayment_amount() or Decimal('0.00')
        next_due_date = self.funded_at + relativedelta(months=installments_paid + 1)
        due_this_month = installments_due > installments_paid
        amount_due = monthly_amount if due_this_month else Decimal('0.00')
        return {
            "monthly_repayment": str(monthly_amount),
            "installments_due": installments_due,
            "installments_paid": installments_paid,
            "next_due_date": next_due_date.isoformat(),
            "due_this_month": due_this_month,
            "amount_due": str(amount_due),
        }

class Loan(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='loans')
    lender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lender.first_name} loaned {self.amount} to {self.campaign.title}"

class Repayment(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='repayments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=255, unique=True, default="default-ref")
  # Paystack transaction reference
    is_verified = models.BooleanField(default=False)  # Ensure payments are confirmed
    is_fully_repaid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Repayment of {self.amount} for {self.campaign.title}"
    
    def save(self, *args, **kwargs):
        """Mark the campaign as fully repaid if repayment is complete."""
        super().save(*args, **kwargs)
        if self.campaign.remaining_repayment() <= 0:
            self.campaign.is_fully_repaid = True
            self.campaign.save()
