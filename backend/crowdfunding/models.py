from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class CrowdfundingCampaign(models.Model):
    """
    Model for crowdfunding campaigns
    """
    CAMPAIGN_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    CAMPAIGN_CATEGORY_CHOICES = [
        ('education', 'Education'),
        ('healthcare', 'Healthcare'),
        ('technology', 'Technology'),
        ('social', 'Social Impact'),
        ('environment', 'Environment'),
        ('arts', 'Arts & Culture'),
        ('sports', 'Sports'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CAMPAIGN_CATEGORY_CHOICES)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='crowdfunding_campaigns')
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=CAMPAIGN_STATUS_CHOICES, default='draft')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    image = models.ImageField(upload_to='crowdfunding/images/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'crowdfunding_campaigns'
        ordering = ['-created_at']
        verbose_name = 'Crowdfunding Campaign'
        verbose_name_plural = 'Crowdfunding Campaigns'
    
    def __str__(self):
        return f"{self.title} by {self.creator.get_full_name()}"
    
    @property
    def progress_percentage(self):
        if self.target_amount > 0:
            return (self.current_amount / self.target_amount) * 100
        return 0
    
    @property
    def days_remaining(self):
        from django.utils import timezone
        if self.end_date > timezone.now():
            return (self.end_date - timezone.now()).days
        return 0


class Donation(models.Model):
    """
    Model for donations to crowdfunding campaigns
    """
    DONATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    campaign = models.ForeignKey(CrowdfundingCampaign, on_delete=models.CASCADE, related_name='donations')
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=DONATION_STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, null=True)
    is_anonymous = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'donations'
        ordering = ['-created_at']
        verbose_name = 'Donation'
        verbose_name_plural = 'Donations'
    
    def __str__(self):
        return f"${self.amount} donation to {self.campaign.title} by {self.donor.get_full_name()}"


class CampaignUpdate(models.Model):
    """
    Model for campaign updates
    """
    campaign = models.ForeignKey(CrowdfundingCampaign, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='crowdfunding/updates/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'campaign_updates'
        ordering = ['-created_at']
        verbose_name = 'Campaign Update'
        verbose_name_plural = 'Campaign Updates'
    
    def __str__(self):
        return f"Update for {self.campaign.title}: {self.title}"


class CampaignComment(models.Model):
    """
    Model for comments on crowdfunding campaigns
    """
    campaign = models.ForeignKey(CrowdfundingCampaign, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaign_comments')
    content = models.TextField()
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'campaign_comments'
        ordering = ['created_at']
        verbose_name = 'Campaign Comment'
        verbose_name_plural = 'Campaign Comments'
    
    def __str__(self):
        return f"Comment by {self.user.get_full_name()} on {self.campaign.title}"
