import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
import json

from chat.consumers import ChatConsumer
from chat.models import ChatRoom, ChatMessage, MeetingRequest
from accounts.models import User

User = get_user_model()


class ChatConsumerTests(TestCase):
    """Test cases for WebSocket chat consumer"""
    
    async def test_websocket_connection_without_token(self):
        """Test WebSocket connection without token"""
        communicator = WebsocketCommunicator(ChatConsumer.as_asgi(), "/ws/chat/")
        connected, subprotocol = await communicator.connect()
        
        # Should reject connection without token
        self.assertFalse(connected)
    
    async def test_websocket_connection_with_invalid_token(self):
        """Test WebSocket connection with invalid token"""
        communicator = WebsocketCommunicator(ChatConsumer.as_asgi(), "/ws/chat/?token=invalid_token")
        connected, subprotocol = await communicator.connect()
        
        # Should reject connection with invalid token
        self.assertFalse(connected)
    
    async def test_websocket_connection_with_valid_token(self):
        """Test WebSocket connection with valid token"""
        # Create user and get token
        user = await database_sync_to_async(User.objects.create_user)(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            user_type='student'
        )
        
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        communicator = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token}")
        connected, subprotocol = await communicator.connect()
        
        # Should accept connection with valid token
        self.assertTrue(connected)
        
        await communicator.disconnect()
    
    async def test_send_message(self):
        """Test sending a message through WebSocket"""
        # Create users
        user1 = await database_sync_to_async(User.objects.create_user)(
            email='user1@example.com',
            password='user1pass123',
            first_name='User',
            last_name='One',
            user_type='student'
        )
        
        user2 = await database_sync_to_async(User.objects.create_user)(
            email='user2@example.com',
            password='user2pass123',
            first_name='User',
            last_name='Two',
            user_type='alumni'
        )
        
        # Get token for user1
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user1)
        access_token = str(refresh.access_token)
        
        communicator = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token}")
        connected, subprotocol = await communicator.connect()
        
        self.assertTrue(connected)
        
        # Send message
        message_data = {
            'type': 'message',
            'to_user': user2.id,
            'content': 'Hello, this is a test message'
        }
        
        await communicator.send_json_to(message_data)
        
        # Receive response
        response = await communicator.receive_json_from()
        
        self.assertEqual(response['type'], 'message')
        self.assertEqual(response['data']['content'], 'Hello, this is a test message')
        
        await communicator.disconnect()
    
    async def test_meeting_request(self):
        """Test sending a meeting request through WebSocket"""
        # Create users
        user1 = await database_sync_to_async(User.objects.create_user)(
            email='requester@example.com',
            password='requesterpass123',
            first_name='Requester',
            last_name='User',
            user_type='student'
        )
        
        user2 = await database_sync_to_async(User.objects.create_user)(
            email='recipient@example.com',
            password='recipientpass123',
            first_name='Recipient',
            last_name='User',
            user_type='alumni'
        )
        
        # Get token for user1
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user1)
        access_token = str(refresh.access_token)
        
        communicator = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token}")
        connected, subprotocol = await communicator.connect()
        
        self.assertTrue(connected)
        
        # Send meeting request
        meeting_data = {
            'type': 'meeting_request',
            'to_user': user2.id,
            'datetime': '2024-12-25T14:00:00Z',
            'topic': 'Career Discussion'
        }
        
        await communicator.send_json_to(meeting_data)
        
        # Receive response
        response = await communicator.receive_json_from()
        
        self.assertEqual(response['type'], 'meeting_request')
        self.assertEqual(response['data']['meeting_request']['topic'], 'Career Discussion')
        
        await communicator.disconnect()
    
    async def test_typing_indicator(self):
        """Test typing indicator functionality"""
        # Create users
        user1 = await database_sync_to_async(User.objects.create_user)(
            email='typer@example.com',
            password='typerpass123',
            first_name='Typer',
            last_name='User',
            user_type='student'
        )
        
        user2 = await database_sync_to_async(User.objects.create_user)(
            email='observer@example.com',
            password='observerpass123',
            first_name='Observer',
            last_name='User',
            user_type='alumni'
        )
        
        # Get token for user1
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user1)
        access_token = str(refresh.access_token)
        
        communicator = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token}")
        connected, subprotocol = await communicator.connect()
        
        self.assertTrue(connected)
        
        # Send typing indicator
        typing_data = {
            'type': 'typing',
            'to_user': user2.id,
            'is_typing': True
        }
        
        await communicator.send_json_to(typing_data)
        
        # Send stop typing indicator
        stop_typing_data = {
            'type': 'typing',
            'to_user': user2.id,
            'is_typing': False
        }
        
        await communicator.send_json_to(stop_typing_data)
        
        await communicator.disconnect()


class ChatModelTests(TestCase):
    """Test cases for chat models"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='user1pass123',
            first_name='User',
            last_name='One',
            user_type='student'
        )
        
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='user2pass123',
            first_name='User',
            last_name='Two',
            user_type='alumni'
        )
    
    def test_chat_room_creation(self):
        """Test chat room creation"""
        room = ChatRoom.objects.create(
            room_type='direct',
            created_by=self.user1
        )
        room.participants.add(self.user1, self.user2)
        
        self.assertEqual(room.room_type, 'direct')
        self.assertEqual(room.participants.count(), 2)
        self.assertIn(self.user1, room.participants.all())
        self.assertIn(self.user2, room.participants.all())
    
    def test_chat_message_creation(self):
        """Test chat message creation"""
        room = ChatRoom.objects.create(
            room_type='direct',
            created_by=self.user1
        )
        room.participants.add(self.user1, self.user2)
        
        message = ChatMessage.objects.create(
            room=room,
            sender=self.user1,
            content='Hello, this is a test message',
            message_type='message'
        )
        
        self.assertEqual(message.content, 'Hello, this is a test message')
        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.room, room)
        self.assertEqual(message.message_type, 'message')
    
    def test_meeting_request_creation(self):
        """Test meeting request creation"""
        room = ChatRoom.objects.create(
            room_type='direct',
            created_by=self.user1
        )
        room.participants.add(self.user1, self.user2)
        
        message = ChatMessage.objects.create(
            room=room,
            sender=self.user1,
            content='Meeting request: Career Discussion',
            message_type='meeting_request',
            meeting_datetime='2024-12-25T14:00:00Z',
            meeting_topic='Career Discussion',
            meeting_status='pending'
        )
        
        meeting_request = MeetingRequest.objects.create(
            requester=self.user1,
            recipient=self.user2,
            room=room,
            message=message,
            datetime='2024-12-25T14:00:00Z',
            topic='Career Discussion',
            status='pending'
        )
        
        self.assertEqual(meeting_request.requester, self.user1)
        self.assertEqual(meeting_request.recipient, self.user2)
        self.assertEqual(meeting_request.topic, 'Career Discussion')
        self.assertEqual(meeting_request.status, 'pending')
    
    def test_meeting_request_approval(self):
        """Test meeting request approval"""
        room = ChatRoom.objects.create(
            room_type='direct',
            created_by=self.user1
        )
        room.participants.add(self.user1, self.user2)
        
        message = ChatMessage.objects.create(
            room=room,
            sender=self.user1,
            content='Meeting request: Career Discussion',
            message_type='meeting_request',
            meeting_datetime='2024-12-25T14:00:00Z',
            meeting_topic='Career Discussion',
            meeting_status='pending'
        )
        
        meeting_request = MeetingRequest.objects.create(
            requester=self.user1,
            recipient=self.user2,
            room=room,
            message=message,
            datetime='2024-12-25T14:00:00Z',
            topic='Career Discussion',
            status='pending'
        )
        
        # Approve meeting request
        meeting_request.status = 'approved'
        meeting_request.save()
        
        message.meeting_status = 'approved'
        message.save()
        
        self.assertEqual(meeting_request.status, 'approved')
        self.assertEqual(message.meeting_status, 'approved')


class WebSocketIntegrationTests(TestCase):
    """Integration tests for WebSocket functionality"""
    
    async def test_multiple_users_chat(self):
        """Test chat between multiple users"""
        # Create users
        user1 = await database_sync_to_async(User.objects.create_user)(
            email='user1@example.com',
            password='user1pass123',
            first_name='User',
            last_name='One',
            user_type='student'
        )
        
        user2 = await database_sync_to_async(User.objects.create_user)(
            email='user2@example.com',
            password='user2pass123',
            first_name='User',
            last_name='Two',
            user_type='alumni'
        )
        
        # Get tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh1 = RefreshToken.for_user(user1)
        refresh2 = RefreshToken.for_user(user2)
        
        access_token1 = str(refresh1.access_token)
        access_token2 = str(refresh2.access_token)
        
        # Connect both users
        communicator1 = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token1}")
        communicator2 = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token2}")
        
        connected1, _ = await communicator1.connect()
        connected2, _ = await communicator2.connect()
        
        self.assertTrue(connected1)
        self.assertTrue(connected2)
        
        # User1 sends message to User2
        message_data = {
            'type': 'message',
            'to_user': user2.id,
            'content': 'Hello from User1!'
        }
        
        await communicator1.send_json_to(message_data)
        
        # User2 should receive the message
        response = await communicator2.receive_json_from()
        self.assertEqual(response['type'], 'message')
        self.assertEqual(response['data']['content'], 'Hello from User1!')
        
        # User1 should also receive their own message
        response = await communicator1.receive_json_from()
        self.assertEqual(response['type'], 'message')
        self.assertEqual(response['data']['content'], 'Hello from User1!')
        
        await communicator1.disconnect()
        await communicator2.disconnect()
    
    async def test_meeting_request_workflow(self):
        """Test complete meeting request workflow"""
        # Create users
        requester = await database_sync_to_async(User.objects.create_user)(
            email='requester@example.com',
            password='requesterpass123',
            first_name='Requester',
            last_name='User',
            user_type='student'
        )
        
        recipient = await database_sync_to_async(User.objects.create_user)(
            email='recipient@example.com',
            password='recipientpass123',
            first_name='Recipient',
            last_name='User',
            user_type='alumni'
        )
        
        # Get tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh_req = RefreshToken.for_user(requester)
        refresh_rec = RefreshToken.for_user(recipient)
        
        access_token_req = str(refresh_req.access_token)
        access_token_rec = str(refresh_rec.access_token)
        
        # Connect both users
        communicator_req = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token_req}")
        communicator_rec = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token_rec}")
        
        connected_req, _ = await communicator_req.connect()
        connected_rec, _ = await communicator_rec.connect()
        
        self.assertTrue(connected_req)
        self.assertTrue(connected_rec)
        
        # Requester sends meeting request
        meeting_data = {
            'type': 'meeting_request',
            'to_user': recipient.id,
            'datetime': '2024-12-25T14:00:00Z',
            'topic': 'Career Discussion'
        }
        
        await communicator_req.send_json_to(meeting_data)
        
        # Recipient should receive meeting request
        response = await communicator_rec.receive_json_from()
        self.assertEqual(response['type'], 'meeting_request')
        self.assertEqual(response['data']['meeting_request']['topic'], 'Career Discussion')
        
        # Requester should also receive confirmation
        response = await communicator_req.receive_json_from()
        self.assertEqual(response['type'], 'meeting_request')
        
        await communicator_req.disconnect()
        await communicator_rec.disconnect()


# Performance Tests for WebSocket
class WebSocketPerformanceTests(TestCase):
    """Performance tests for WebSocket operations"""
    
    async def test_concurrent_connections(self):
        """Test handling multiple concurrent WebSocket connections"""
        import asyncio
        
        # Create users
        users = []
        for i in range(10):
            user = await database_sync_to_async(User.objects.create_user)(
                email=f'perfuser{i}@example.com',
                password=f'perfuser{i}pass123',
                first_name=f'PerfUser{i}',
                last_name='Test',
                user_type='student'
            )
            users.append(user)
        
        # Get tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        tokens = []
        for user in users:
            refresh = RefreshToken.for_user(user)
            tokens.append(str(refresh.access_token))
        
        # Connect all users concurrently
        communicators = []
        for i, token in enumerate(tokens):
            communicator = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={token}")
            communicators.append(communicator)
        
        # Connect all at once
        tasks = [comm.connect() for comm in communicators]
        results = await asyncio.gather(*tasks)
        
        # All connections should succeed
        for connected, _ in results:
            self.assertTrue(connected)
        
        # Disconnect all
        disconnect_tasks = [comm.disconnect() for comm in communicators]
        await asyncio.gather(*disconnect_tasks)
    
    async def test_message_throughput(self):
        """Test message throughput performance"""
        import time
        
        # Create users
        user1 = await database_sync_to_async(User.objects.create_user)(
            email='sender@example.com',
            password='senderpass123',
            first_name='Sender',
            last_name='User',
            user_type='student'
        )
        
        user2 = await database_sync_to_async(User.objects.create_user)(
            email='receiver@example.com',
            password='receiverpass123',
            first_name='Receiver',
            last_name='User',
            user_type='alumni'
        )
        
        # Get tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh1 = RefreshToken.for_user(user1)
        refresh2 = RefreshToken.for_user(user2)
        
        access_token1 = str(refresh1.access_token)
        access_token2 = str(refresh2.access_token)
        
        # Connect users
        communicator1 = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token1}")
        communicator2 = WebsocketCommunicator(ChatConsumer.as_asgi(), f"/ws/chat/?token={access_token2}")
        
        connected1, _ = await communicator1.connect()
        connected2, _ = await communicator2.connect()
        
        self.assertTrue(connected1)
        self.assertTrue(connected2)
        
        # Send multiple messages quickly
        start_time = time.time()
        
        for i in range(50):
            message_data = {
                'type': 'message',
                'to_user': user2.id,
                'content': f'Message {i}'
            }
            await communicator1.send_json_to(message_data)
        
        # Receive all messages
        for i in range(50):
            response = await communicator2.receive_json_from()
            self.assertEqual(response['type'], 'message')
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Should handle 50 messages in less than 5 seconds
        self.assertLess(duration, 5.0)
        
        await communicator1.disconnect()
        await communicator2.disconnect()
