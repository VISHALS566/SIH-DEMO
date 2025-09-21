from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Event(models.Model):
    """
    Model for events in the alumni network
    """
    EVENT_TYPE_CHOICES = [
        ('networking', 'Networking'),
        ('workshop', 'Workshop'),
        ('seminar', 'Seminar'),
        ('conference', 'Conference'),
        ('social', 'Social'),
        ('career', 'Career Fair'),
        ('reunion', 'Reunion'),
        ('fundraising', 'Fundraising'),
    ]
    
    EVENT_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=EVENT_STATUS_CHOICES, default='draft')
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    location = models.CharField(max_length=200, blank=True, null=True)
    virtual_link = models.URLField(blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField(blank=True, null=True)
    max_attendees = models.PositiveIntegerField(blank=True, null=True)
    current_attendees = models.PositiveIntegerField(default=0)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.ImageField(upload_to='events/images/', blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'events'
        ordering = ['-start_date']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
    
    def __str__(self):
        return f"{self.title} - {self.start_date.strftime('%Y-%m-%d')}"


class EventRegistration(models.Model):
    """
    Model for event registrations
    """
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_registrations')
    registration_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='registered')
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'event_registrations'
        unique_together = ['event', 'user']
        verbose_name = 'Event Registration'
        verbose_name_plural = 'Event Registrations'
    
    def __str__(self):
        return f"{self.user.get_full_name()} registered for {self.event.title}"


class EventFeedback(models.Model):
    """
    Model for event feedback
    """
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_feedback')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_feedback'
        unique_together = ['event', 'user']
        verbose_name = 'Event Feedback'
        verbose_name_plural = 'Event Feedback'
    
    def __str__(self):
        return f"Feedback for {self.event.title} by {self.user.get_full_name()}"
