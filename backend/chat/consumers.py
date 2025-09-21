import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import ChatRoom, ChatMessage, MessageAttachment, MessageReadStatus, TypingIndicator, MeetingRequest, UserStreak, ActivityLog

User = get_user_model()
logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat functionality
    """
    
    async def connect(self):
        """
        Connect to WebSocket and authenticate user
        """
        # Get token from query parameters
        token = self.scope['query_string'].decode().split('token=')[1] if 'token=' in self.scope['query_string'].decode() else None
        
        if not token:
            await self.close(code=4001)  # Unauthorized
            return
        
        # Authenticate user
        try:
            user = await self.authenticate_user(token)
            if not user:
                await self.close(code=4001)  # Unauthorized
                return
            
            self.user = user
            self.user_id = user.id
            
            # Join user's personal channel
            await self.channel_layer.group_add(f"user_{self.user_id}", self.channel_name)
            
            await self.accept()
            
            # Update user streak for login activity
            await self.update_user_streak()
            
            logger.info(f"User {self.user.get_full_name()} connected to chat")
            
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            await self.close(code=4001)
    
    async def disconnect(self, close_code):
        """
        Disconnect from WebSocket
        """
        if hasattr(self, 'user_id'):
            await self.channel_layer.group_discard(f"user_{self.user_id}", self.channel_name)
            logger.info(f"User {self.user_id} disconnected from chat")
    
    async def receive(self, text_data):
        """
        Receive message from WebSocket
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'message':
                await self.handle_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'meeting_request':
                await self.handle_meeting_request(data)
            elif message_type == 'meeting_approval':
                await self.handle_meeting_approval(data)
            elif message_type == 'read_receipt':
                await self.handle_read_receipt(data)
            else:
                await self.send_error("Unknown message type")
                
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON")
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await self.send_error("Internal server error")
    
    async def handle_message(self, data):
        """
        Handle regular chat message
        """
        to_user_id = data.get('to_user')
        content = data.get('content', '')
        attachments = data.get('attachments', [])
        
        if not to_user_id or not content:
            await self.send_error("Missing required fields")
            return
        
        # Get or create chat room
        room = await self.get_or_create_room(to_user_id)
        
        # Create message
        message = await self.create_message(room, content, attachments)
        
        # Send message to both users
        await self.channel_layer.group_send(
            f"user_{to_user_id}",
            {
                'type': 'chat_message',
                'message': await self.serialize_message(message)
            }
        )
        
        await self.channel_layer.group_send(
            f"user_{self.user_id}",
            {
                'type': 'chat_message',
                'message': await self.serialize_message(message)
            }
        )
        
        # Update user streak
        await self.update_user_streak()
    
    async def handle_typing(self, data):
        """
        Handle typing indicator
        """
        to_user_id = data.get('to_user')
        is_typing = data.get('is_typing', False)
        
        if not to_user_id:
            await self.send_error("Missing to_user field")
            return
        
        # Update typing indicator
        await self.update_typing_indicator(to_user_id, is_typing)
        
        # Send typing indicator to recipient
        await self.channel_layer.group_send(
            f"user_{to_user_id}",
            {
                'type': 'typing_indicator',
                'user_id': self.user_id,
                'user_name': self.user.get_full_name(),
                'is_typing': is_typing
            }
        )
    
    async def handle_meeting_request(self, data):
        """
        Handle meeting request
        """
        to_user_id = data.get('to_user')
        datetime_str = data.get('datetime')
        topic = data.get('topic', '')
        
        if not to_user_id or not datetime_str or not topic:
            await self.send_error("Missing required fields for meeting request")
            return
        
        # Get or create chat room
        room = await self.get_or_create_room(to_user_id)
        
        # Create meeting request message
        message = await self.create_meeting_request_message(room, datetime_str, topic)
        
        # Create meeting request record
        meeting_request = await self.create_meeting_request(room, message, datetime_str, topic)
        
        # Send meeting request to recipient
        await self.channel_layer.group_send(
            f"user_{to_user_id}",
            {
                'type': 'meeting_request',
                'message': await self.serialize_message(message),
                'meeting_request': await self.serialize_meeting_request(meeting_request)
            }
        )
        
        await self.channel_layer.group_send(
            f"user_{self.user_id}",
            {
                'type': 'meeting_request',
                'message': await self.serialize_message(message),
                'meeting_request': await self.serialize_meeting_request(meeting_request)
            }
        )
    
    async def handle_meeting_approval(self, data):
        """
        Handle meeting approval/rejection
        """
        meeting_id = data.get('meeting_id')
        status = data.get('status')  # 'approved' or 'rejected'
        
        if not meeting_id or status not in ['approved', 'rejected']:
            await self.send_error("Invalid meeting approval data")
            return
        
        # Update meeting request
        meeting_request = await self.update_meeting_request(meeting_id, status)
        
        if meeting_request:
            # Create approval/rejection message
            message = await self.create_meeting_response_message(meeting_request, status)
            
            # Send to both users
            await self.channel_layer.group_send(
                f"user_{meeting_request.requester.id}",
                {
                    'type': 'meeting_response',
                    'message': await self.serialize_message(message),
                    'meeting_request': await self.serialize_meeting_request(meeting_request)
                }
            )
            
            await self.channel_layer.group_send(
                f"user_{meeting_request.recipient.id}",
                {
                    'type': 'meeting_response',
                    'message': await self.serialize_message(message),
                    'meeting_request': await self.serialize_meeting_request(meeting_request)
                }
            )
    
    async def handle_read_receipt(self, data):
        """
        Handle read receipt
        """
        message_id = data.get('message_id')
        
        if not message_id:
            await self.send_error("Missing message_id")
            return
        
        # Mark message as read
        await self.mark_message_as_read(message_id)
    
    # WebSocket event handlers
    async def chat_message(self, event):
        """
        Send chat message to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'message',
            'data': event['message']
        }))
    
    async def typing_indicator(self, event):
        """
        Send typing indicator to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'data': {
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing']
            }
        }))
    
    async def meeting_request(self, event):
        """
        Send meeting request to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'meeting_request',
            'data': {
                'message': event['message'],
                'meeting_request': event['meeting_request']
            }
        }))
    
    async def meeting_response(self, event):
        """
        Send meeting response to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'meeting_response',
            'data': {
                'message': event['message'],
                'meeting_request': event['meeting_request']
            }
        }))
    
    async def send_error(self, message):
        """
        Send error message to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))
    
    # Database operations
    @database_sync_to_async
    def authenticate_user(self, token):
        """
        Authenticate user from JWT token
        """
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except (InvalidToken, TokenError, User.DoesNotExist):
            return None
    
    @database_sync_to_async
    def get_or_create_room(self, other_user_id):
        """
        Get or create chat room between two users
        """
        other_user = User.objects.get(id=other_user_id)
        
        # Check if room already exists
        existing_rooms = ChatRoom.objects.filter(
            participants=self.user
        ).filter(
            participants=other_user
        ).filter(room_type='direct')
        
        if existing_rooms.exists():
            return existing_rooms.first()
        
        # Create new room
        room = ChatRoom.objects.create(
            room_type='direct',
            created_by=self.user
        )
        room.participants.add(self.user, other_user)
        return room
    
    @database_sync_to_async
    def create_message(self, room, content, attachments=None):
        """
        Create chat message
        """
        message = ChatMessage.objects.create(
            room=room,
            sender=self.user,
            content=content,
            message_type='message'
        )
        
        # Handle attachments if provided
        if attachments:
            for attachment_data in attachments:
                # In a real implementation, you'd handle file uploads here
                pass
        
        return message
    
    @database_sync_to_async
    def create_meeting_request_message(self, room, datetime_str, topic):
        """
        Create meeting request message
        """
        from datetime import datetime
        
        message = ChatMessage.objects.create(
            room=room,
            sender=self.user,
            content=f"Meeting request: {topic}",
            message_type='meeting_request',
            meeting_datetime=datetime.fromisoformat(datetime_str.replace('Z', '+00:00')),
            meeting_topic=topic,
            meeting_status='pending'
        )
        
        return message
    
    @database_sync_to_async
    def create_meeting_request(self, room, message, datetime_str, topic):
        """
        Create meeting request record
        """
        from datetime import datetime
        
        recipient = room.participants.exclude(id=self.user_id).first()
        
        meeting_request = MeetingRequest.objects.create(
            requester=self.user,
            recipient=recipient,
            room=room,
            message=message,
            datetime=datetime.fromisoformat(datetime_str.replace('Z', '+00:00')),
            topic=topic,
            status='pending'
        )
        
        return meeting_request
    
    @database_sync_to_async
    def update_meeting_request(self, meeting_id, status):
        """
        Update meeting request status
        """
        try:
            meeting_request = MeetingRequest.objects.get(id=meeting_id)
            meeting_request.status = status
            meeting_request.save()
            
            # Update the associated message
            meeting_request.message.meeting_status = status
            meeting_request.message.save()
            
            return meeting_request
        except MeetingRequest.DoesNotExist:
            return None
    
    @database_sync_to_async
    def create_meeting_response_message(self, meeting_request, status):
        """
        Create meeting response message
        """
        status_text = "approved" if status == "approved" else "rejected"
        
        message = ChatMessage.objects.create(
            room=meeting_request.room,
            sender=self.user,
            content=f"Meeting {status_text}: {meeting_request.topic}",
            message_type=f'meeting_{status_text}',
            meeting_datetime=meeting_request.datetime,
            meeting_topic=meeting_request.topic,
            meeting_status=status
        )
        
        return message
    
    @database_sync_to_async
    def update_typing_indicator(self, to_user_id, is_typing):
        """
        Update typing indicator
        """
        room = self.get_or_create_room(to_user_id)
        
        typing_indicator, created = TypingIndicator.objects.get_or_create(
            room=room,
            user=self.user,
            defaults={'is_typing': is_typing}
        )
        
        if not created:
            typing_indicator.is_typing = is_typing
            typing_indicator.save()
    
    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        """
        Mark message as read
        """
        try:
            message = ChatMessage.objects.get(id=message_id)
            MessageReadStatus.objects.get_or_create(
                message=message,
                user=self.user
            )
        except ChatMessage.DoesNotExist:
            pass
    
    @database_sync_to_async
    def update_user_streak(self):
        """
        Update user streak for activity
        """
        streak, created = UserStreak.objects.get_or_create(user=self.user)
        streak.update_streak()
        
        # Log activity
        ActivityLog.objects.create(
            user=self.user,
            activity_type='login',
            description='User connected to chat'
        )
    
    @database_sync_to_async
    def serialize_message(self, message):
        """
        Serialize message for JSON response
        """
        return {
            'id': message.id,
            'sender': {
                'id': message.sender.id,
                'name': message.sender.get_full_name(),
                'email': message.sender.email
            },
            'content': message.content,
            'message_type': message.message_type,
            'created_at': message.created_at.isoformat(),
            'meeting_data': {
                'datetime': message.meeting_datetime.isoformat() if message.meeting_datetime else None,
                'topic': message.meeting_topic,
                'status': message.meeting_status
            } if message.message_type.startswith('meeting') else None
        }
    
    @database_sync_to_async
    def serialize_meeting_request(self, meeting_request):
        """
        Serialize meeting request for JSON response
        """
        return {
            'id': meeting_request.id,
            'requester': {
                'id': meeting_request.requester.id,
                'name': meeting_request.requester.get_full_name()
            },
            'recipient': {
                'id': meeting_request.recipient.id,
                'name': meeting_request.recipient.get_full_name()
            },
            'datetime': meeting_request.datetime.isoformat(),
            'topic': meeting_request.topic,
            'status': meeting_request.status,
            'created_at': meeting_request.created_at.isoformat()
        }
