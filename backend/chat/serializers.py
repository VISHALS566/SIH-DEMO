from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMessage, MeetingRequest, UserStreak, ActivityLog

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Simple user serializer for chat
    """
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'user_type']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class ChatRoomSerializer(serializers.ModelSerializer):
    """
    Serializer for chat rooms
    """
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'room_type', 'participants', 'last_message', 'unread_count', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        """
        Get the last message in the room
        """
        last_message = obj.messages.last()
        if last_message:
            return {
                'id': last_message.id,
                'content': last_message.content,
                'sender': last_message.sender.get_full_name(),
                'message_type': last_message.message_type,
                'created_at': last_message.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        """
        Get unread message count for the current user
        """
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.exclude(
                read_status__user=request.user
            ).count()
        return 0


class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for chat messages
    """
    sender = UserSerializer(read_only=True)
    room = ChatRoomSerializer(read_only=True)
    attachments = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'room', 'sender', 'content', 'message_type', 
            'reply_to', 'created_at', 'updated_at', 'attachments',
            'is_read', 'meeting_datetime', 'meeting_topic', 'meeting_status'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_attachments(self, obj):
        """
        Get message attachments
        """
        return [
            {
                'id': attachment.id,
                'file_name': attachment.file_name,
                'file_url': attachment.file.url,
                'file_type': attachment.file_type,
                'file_size': attachment.file_size
            }
            for attachment in obj.attachments.all()
        ]
    
    def get_is_read(self, obj):
        """
        Check if message is read by current user
        """
        request = self.context.get('request')
        if request and request.user:
            return obj.read_status.filter(user=request.user).exists()
        return False


class MeetingRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for meeting requests
    """
    requester = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    room = ChatRoomSerializer(read_only=True)
    
    class Meta:
        model = MeetingRequest
        fields = [
            'id', 'requester', 'recipient', 'room', 'message',
            'datetime', 'topic', 'description', 'status',
            'google_meet_link', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserStreakSerializer(serializers.ModelSerializer):
    """
    Serializer for user streaks
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserStreak
        fields = [
            'id', 'user', 'current_streak', 'longest_streak',
            'last_activity_date', 'streak_start_date', 'is_premium',
            'premium_expires_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Serializer for activity logs
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'activity_type', 'description',
            'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
