from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AlumniSpotlight(models.Model):
    """
    Model for alumni spotlight features
    """
    SPOTLIGHT_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    alumni = models.ForeignKey(User, on_delete=models.CASCADE, related_name='spotlights')
    image = models.ImageField(upload_to='spotlight/images/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=SPOTLIGHT_STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'alumni_spotlights'
        ordering = ['-published_at']
        verbose_name = 'Alumni Spotlight'
        verbose_name_plural = 'Alumni Spotlights'
    
    def __str__(self):
        return f"{self.title} - {self.alumni.get_full_name()}"


class Club(models.Model):
    """
    Model for alumni clubs
    """
    CLUB_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending Approval'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True, null=True)
    president = models.ForeignKey(User, on_delete=models.CASCADE, related_name='presided_clubs')
    members = models.ManyToManyField(User, related_name='club_memberships', blank=True)
    status = models.CharField(max_length=20, choices=CLUB_STATUS_CHOICES, default='pending')
    logo = models.ImageField(upload_to='clubs/logos/', blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    social_media_links = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'clubs'
        ordering = ['name']
        verbose_name = 'Club'
        verbose_name_plural = 'Clubs'
    
    def __str__(self):
        return f"{self.name}"


class ClubEvent(models.Model):
    """
    Model for club events
    """
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True, null=True)
    virtual_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'club_events'
        ordering = ['-event_date']
        verbose_name = 'Club Event'
        verbose_name_plural = 'Club Events'
    
    def __str__(self):
        return f"{self.title} - {self.club.name}"
