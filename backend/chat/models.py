from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator

User = get_user_model()


class ChatRoom(models.Model):
    """
    Model for chat rooms (1:1 conversations)
    """
    ROOM_TYPE_CHOICES = [
        ('direct', 'Direct Message'),
        ('group', 'Group Chat'),
    ]
    
    name = models.CharField(max_length=200, blank=True, null=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='direct')
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chat_rooms'
        ordering = ['-updated_at']
        verbose_name = 'Chat Room'
        verbose_name_plural = 'Chat Rooms'
    
    def __str__(self):
        if self.room_type == 'direct':
            participants = list(self.participants.all())
            if len(participants) == 2:
                return f"DM: {participants[0].get_full_name()} & {participants[1].get_full_name()}"
        return self.name or f"Room {self.id}"


class ChatMessage(models.Model):
    """
    Model for chat messages
    """
    MESSAGE_TYPE_CHOICES = [
        ('message', 'Regular Message'),
        ('meeting_request', 'Meeting Request'),
        ('meeting_approved', 'Meeting Approved'),
        ('meeting_rejected', 'Meeting Rejected'),
        ('system', 'System Message'),
    ]
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='message')
    reply_to = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Meeting-specific fields
    meeting_datetime = models.DateTimeField(null=True, blank=True)
    meeting_topic = models.CharField(max_length=200, blank=True, null=True)
    meeting_status = models.CharField(max_length=20, default='pending', blank=True)
    
    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
    
    def __str__(self):
        return f"Message from {self.sender.get_full_name()} in {self.room}"


class MessageAttachment(models.Model):
    """
    Model for message attachments
    """
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(
        upload_to='chat/attachments/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'txt'])]
    )
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    file_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'message_attachments'
        verbose_name = 'Message Attachment'
        verbose_name_plural = 'Message Attachments'
    
    def __str__(self):
        return f"Attachment: {self.file_name}"


class MessageReadStatus(models.Model):
    """
    Model for tracking message read status
    """
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='read_status')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_reads')
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'message_read_status'
        unique_together = ['message', 'user']
        verbose_name = 'Message Read Status'
        verbose_name_plural = 'Message Read Status'
    
    def __str__(self):
        return f"{self.user.get_full_name()} read message {self.message.id}"


class TypingIndicator(models.Model):
    """
    Model for typing indicators
    """
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='typing_indicators')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='typing_indicators')
    is_typing = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'typing_indicators'
        unique_together = ['room', 'user']
        verbose_name = 'Typing Indicator'
        verbose_name_plural = 'Typing Indicators'
    
    def __str__(self):
        return f"{self.user.get_full_name()} typing in {self.room}"


class MeetingRequest(models.Model):
    """
    Model for meeting requests
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meeting_requests_sent')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meeting_requests_received')
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='meeting_requests')
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='meeting_request')
    datetime = models.DateTimeField()
    topic = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    google_meet_link = models.URLField(blank=True, null=True)
    ics_file = models.FileField(upload_to='meetings/ics/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'meeting_requests'
        ordering = ['-created_at']
        verbose_name = 'Meeting Request'
        verbose_name_plural = 'Meeting Requests'
    
    def __str__(self):
        return f"Meeting request from {self.requester.get_full_name()} to {self.recipient.get_full_name()}"


class UserStreak(models.Model):
    """
    Model for tracking user activity streaks
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='streaks')
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    streak_start_date = models.DateField(null=True, blank=True)
    is_premium = models.BooleanField(default=False)
    premium_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_streaks'
        verbose_name = 'User Streak'
        verbose_name_plural = 'User Streaks'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.current_streak} day streak"
    
    def update_streak(self, activity_date=None):
        """
        Update user streak based on activity
        """
        from django.utils import timezone
        from datetime import timedelta
        
        if activity_date is None:
            activity_date = timezone.now().date()
        
        if self.last_activity_date is None:
            # First activity
            self.current_streak = 1
            self.streak_start_date = activity_date
        elif activity_date == self.last_activity_date:
            # Same day activity, no change
            return
        elif activity_date == self.last_activity_date + timedelta(days=1):
            # Consecutive day activity
            self.current_streak += 1
        else:
            # Streak broken
            self.current_streak = 1
            self.streak_start_date = activity_date
        
        self.last_activity_date = activity_date
        
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        self.save()


class ActivityLog(models.Model):
    """
    Model for tracking user activities for streak calculation
    """
    ACTIVITY_TYPE_CHOICES = [
        ('login', 'Login'),
        ('post_created', 'Post Created'),
        ('post_liked', 'Post Liked'),
        ('comment_created', 'Comment Created'),
        ('event_registered', 'Event Registered'),
        ('mentorship_request', 'Mentorship Request'),
        ('donation_made', 'Donation Made'),
        ('profile_updated', 'Profile Updated'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPE_CHOICES)
    description = models.CharField(max_length=200)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.activity_type}"
