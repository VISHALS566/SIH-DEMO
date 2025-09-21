from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class MentorshipProgram(models.Model):
    """
    Model for mentorship programs
    """
    PROGRAM_TYPE_CHOICES = [
        ('career', 'Career Mentorship'),
        ('academic', 'Academic Mentorship'),
        ('entrepreneurship', 'Entrepreneurship Mentorship'),
        ('technical', 'Technical Mentorship'),
        ('leadership', 'Leadership Mentorship'),
    ]
    
    PROGRAM_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('completed', 'Completed'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    program_type = models.CharField(max_length=20, choices=PROGRAM_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=PROGRAM_STATUS_CHOICES, default='active')
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorship_programs')
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorship_enrollments')
    start_date = models.DateField()
    end_date = models.DateField()
    goals = models.TextField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentorship_programs'
        ordering = ['-created_at']
        verbose_name = 'Mentorship Program'
        verbose_name_plural = 'Mentorship Programs'
    
    def __str__(self):
        return f"{self.title} - {self.mentor.get_full_name()} & {self.mentee.get_full_name()}"


class MentorshipSession(models.Model):
    """
    Model for individual mentorship sessions
    """
    SESSION_STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    ]
    
    program = models.ForeignKey(MentorshipProgram, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    scheduled_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=20, choices=SESSION_STATUS_CHOICES, default='scheduled')
    meeting_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentorship_sessions'
        ordering = ['scheduled_date']
        verbose_name = 'Mentorship Session'
        verbose_name_plural = 'Mentorship Sessions'
    
    def __str__(self):
        return f"{self.title} - {self.scheduled_date.strftime('%Y-%m-%d %H:%M')}"


class MentorshipFeedback(models.Model):
    """
    Model for mentorship feedback
    """
    FEEDBACK_TYPE_CHOICES = [
        ('mentor_to_mentee', 'Mentor to Mentee'),
        ('mentee_to_mentor', 'Mentee to Mentor'),
    ]
    
    program = models.ForeignKey(MentorshipProgram, on_delete=models.CASCADE, related_name='feedback')
    session = models.ForeignKey(MentorshipSession, on_delete=models.CASCADE, related_name='feedback', null=True, blank=True)
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPE_CHOICES)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorship_feedback_given')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorship_feedback_received')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'mentorship_feedback'
        verbose_name = 'Mentorship Feedback'
        verbose_name_plural = 'Mentorship Feedback'
    
    def __str__(self):
        return f"Feedback for {self.program.title} by {self.reviewer.get_full_name()}"


class MentorshipRequest(models.Model):
    """
    Model for mentorship requests
    """
    REQUEST_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentorship_requests')
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_mentorship_requests')
    program_type = models.CharField(max_length=20, choices=MentorshipProgram.PROGRAM_TYPE_CHOICES)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=REQUEST_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mentorship_requests'
        ordering = ['-created_at']
        verbose_name = 'Mentorship Request'
        verbose_name_plural = 'Mentorship Requests'
    
    def __str__(self):
        return f"Mentorship request from {self.mentee.get_full_name()} to {self.mentor.get_full_name()}"
