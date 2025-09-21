import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch, MagicMock
import json

from accounts.models import User, Interest, UserInterest, AlumniProfile, StudentProfile
from posts.models import Post, Comment, Like
from events.models import Event, EventRegistration
from mentorship.models import MentorshipProgram, MentorshipRequest
from crowdfunding.models import CrowdfundingCampaign, Donation
from chat.models import ChatRoom, ChatMessage, MeetingRequest, UserStreak, ActivityLog

User = get_user_model()


class UserModelTests(TestCase):
    """Test cases for User model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            user_type='student'
        )
    
    def test_user_creation(self):
        """Test user creation"""
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.user_type, 'student')
        self.assertTrue(self.user.check_password('testpass123'))
    
    def test_user_str_representation(self):
        """Test user string representation"""
        expected = f"{self.user.first_name} {self.user.last_name} ({self.user.email})"
        self.assertEqual(str(self.user), expected)
    
    def test_user_full_name(self):
        """Test user full name method"""
        expected = f"{self.user.first_name} {self.user.last_name}"
        self.assertEqual(self.user.get_full_name(), expected)
    
    def test_user_is_approved(self):
        """Test user approval status"""
        self.assertFalse(self.user.is_approved())
        self.user.status = 'active'
        self.assertTrue(self.user.is_approved())


class AuthenticationAPITests(APITestCase):
    """Test cases for authentication API endpoints"""
    
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('user_profile')
        
    def test_user_registration(self):
        """Test user registration"""
        data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'user_type': 'student',
            'interests_data': ['Technology', 'Programming']
        }
        
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)
        
        # Verify user was created
        user = User.objects.get(email='newuser@example.com')
        self.assertEqual(user.user_type, 'student')
        self.assertEqual(user.user_interests.count(), 2)
    
    def test_user_login(self):
        """Test user login"""
        user = User.objects.create_user(
            email='login@example.com',
            password='loginpass123',
            first_name='Login',
            last_name='User',
            user_type='alumni'
        )
        
        data = {
            'email': 'login@example.com',
            'password': 'loginpass123'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
    
    def test_profile_access_authenticated(self):
        """Test profile access with authentication"""
        user = User.objects.create_user(
            email='profile@example.com',
            password='profilepass123',
            first_name='Profile',
            last_name='User',
            user_type='faculty'
        )
        
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@example.com')
    
    def test_profile_access_unauthenticated(self):
        """Test profile access without authentication"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostsAPITests(APITestCase):
    """Test cases for posts API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='postuser@example.com',
            password='postpass123',
            first_name='Post',
            last_name='User',
            user_type='alumni'
        )
        
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        self.post = Post.objects.create(
            author=self.user,
            title='Test Post',
            content='This is a test post',
            post_type='general'
        )
    
    def test_create_post(self):
        """Test creating a new post"""
        data = {
            'title': 'New Post',
            'content': 'This is a new post',
            'post_type': 'general'
        }
        
        response = self.client.post('/api/posts/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Post')
        self.assertEqual(response.data['author']['id'], self.user.id)
    
    def test_get_posts(self):
        """Test retrieving posts"""
        response = self.client.get('/api/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_like_post(self):
        """Test liking a post"""
        response = self.client.post(f'/api/posts/{self.post.id}/like/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify like was created
        like = Like.objects.filter(
            user=self.user,
            content_type='post',
            object_id=self.post.id
        ).first()
        self.assertIsNotNone(like)


class EventsAPITests(APITestCase):
    """Test cases for events API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='eventuser@example.com',
            password='eventpass123',
            first_name='Event',
            last_name='User',
            user_type='student'
        )
        
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        self.event = Event.objects.create(
            title='Test Event',
            description='This is a test event',
            event_type='workshop',
            organizer=self.user,
            start_date='2024-12-25T10:00:00Z',
            end_date='2024-12-25T12:00:00Z'
        )
    
    def test_create_event(self):
        """Test creating a new event"""
        data = {
            'title': 'New Event',
            'description': 'This is a new event',
            'event_type': 'seminar',
            'start_date': '2024-12-26T10:00:00Z',
            'end_date': '2024-12-26T12:00:00Z'
        }
        
        response = self.client.post('/api/events/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Event')
    
    def test_register_for_event(self):
        """Test registering for an event"""
        response = self.client.post(f'/api/events/{self.event.id}/register/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify registration was created
        registration = EventRegistration.objects.filter(
            event=self.event,
            user=self.user
        ).first()
        self.assertIsNotNone(registration)


class MentorshipAPITests(APITestCase):
    """Test cases for mentorship API endpoints"""
    
    def setUp(self):
        self.mentor = User.objects.create_user(
            email='mentor@example.com',
            password='mentorpass123',
            first_name='Mentor',
            last_name='User',
            user_type='alumni'
        )
        
        self.mentee = User.objects.create_user(
            email='mentee@example.com',
            password='menteepass123',
            first_name='Mentee',
            last_name='User',
            user_type='student'
        )
        
        refresh = RefreshToken.for_user(self.mentee)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def test_create_mentorship_request(self):
        """Test creating a mentorship request"""
        data = {
            'mentor': self.mentor.id,
            'program_type': 'career',
            'message': 'I would like to request mentorship'
        }
        
        response = self.client.post('/api/mentorship/requests/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['requester'], self.mentee.id)
        self.assertEqual(response.data['recipient'], self.mentor.id)


class CrowdfundingAPITests(APITestCase):
    """Test cases for crowdfunding API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='creator@example.com',
            password='creatorpass123',
            first_name='Creator',
            last_name='User',
            user_type='alumni'
        )
        
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        self.campaign = CrowdfundingCampaign.objects.create(
            title='Test Campaign',
            description='This is a test campaign',
            category='education',
            creator=self.user,
            target_amount=10000.00,
            start_date='2024-12-01T00:00:00Z',
            end_date='2024-12-31T23:59:59Z'
        )
    
    def test_create_campaign(self):
        """Test creating a crowdfunding campaign"""
        data = {
            'title': 'New Campaign',
            'description': 'This is a new campaign',
            'category': 'technology',
            'target_amount': 5000.00,
            'start_date': '2024-12-01T00:00:00Z',
            'end_date': '2024-12-31T23:59:59Z'
        }
        
        response = self.client.post('/api/crowdfunding/campaigns/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Campaign')
    
    @patch('stripe.PaymentIntent.create')
    def test_make_donation(self, mock_stripe):
        """Test making a donation"""
        mock_stripe.return_value = MagicMock(id='pi_test123')
        
        data = {
            'amount': 100.00,
            'message': 'Great cause!'
        }
        
        response = self.client.post(f'/api/crowdfunding/campaigns/{self.campaign.id}/donate/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify donation was created
        donation = Donation.objects.filter(
            campaign=self.campaign,
            donor=self.user
        ).first()
        self.assertIsNotNone(donation)
        self.assertEqual(donation.amount, 100.00)


class ChatAPITests(APITestCase):
    """Test cases for chat API endpoints"""
    
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
        
        refresh = RefreshToken.for_user(self.user1)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        self.room = ChatRoom.objects.create(
            room_type='direct',
            created_by=self.user1
        )
        self.room.participants.add(self.user1, self.user2)
    
    def test_get_chat_rooms(self):
        """Test getting chat rooms"""
        response = self.client.get('/api/chat/rooms/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_create_message(self):
        """Test creating a chat message"""
        data = {
            'content': 'Hello, this is a test message'
        }
        
        response = self.client.post(f'/api/chat/rooms/{self.room.id}/messages/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Hello, this is a test message')
    
    def test_create_meeting_request(self):
        """Test creating a meeting request"""
        data = {
            'recipient': self.user2.id,
            'datetime': '2024-12-25T14:00:00Z',
            'topic': 'Career Discussion'
        }
        
        response = self.client.post('/api/chat/meeting-requests/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['topic'], 'Career Discussion')


class UserStreakTests(TestCase):
    """Test cases for user streak functionality"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='streak@example.com',
            password='streakpass123',
            first_name='Streak',
            last_name='User',
            user_type='student'
        )
    
    def test_streak_creation(self):
        """Test streak creation"""
        streak = UserStreak.objects.create(user=self.user)
        self.assertEqual(streak.current_streak, 0)
        self.assertEqual(streak.longest_streak, 0)
    
    def test_streak_update_consecutive(self):
        """Test streak update for consecutive days"""
        streak = UserStreak.objects.create(user=self.user)
        
        from datetime import date, timedelta
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        # First activity
        streak.update_streak(yesterday)
        self.assertEqual(streak.current_streak, 1)
        
        # Consecutive activity
        streak.update_streak(today)
        self.assertEqual(streak.current_streak, 2)
        self.assertEqual(streak.longest_streak, 2)
    
    def test_streak_reset(self):
        """Test streak reset when broken"""
        streak = UserStreak.objects.create(user=self.user)
        
        from datetime import date, timedelta
        today = date.today()
        three_days_ago = today - timedelta(days=3)
        
        # First activity
        streak.update_streak(three_days_ago)
        self.assertEqual(streak.current_streak, 1)
        
        # Activity after gap (streak broken)
        streak.update_streak(today)
        self.assertEqual(streak.current_streak, 1)
        self.assertEqual(streak.longest_streak, 1)


class ActivityLogTests(TestCase):
    """Test cases for activity logging"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='activity@example.com',
            password='activitypass123',
            first_name='Activity',
            last_name='User',
            user_type='student'
        )
    
    def test_activity_log_creation(self):
        """Test activity log creation"""
        activity = ActivityLog.objects.create(
            user=self.user,
            activity_type='login',
            description='User logged in'
        )
        
        self.assertEqual(activity.user, self.user)
        self.assertEqual(activity.activity_type, 'login')
        self.assertEqual(activity.description, 'User logged in')


# Integration Tests
class IntegrationTests(APITestCase):
    """Integration tests for complete workflows"""
    
    def setUp(self):
        self.student = User.objects.create_user(
            email='student@example.com',
            password='studentpass123',
            first_name='Student',
            last_name='User',
            user_type='student'
        )
        
        self.alumni = User.objects.create_user(
            email='alumni@example.com',
            password='alumnipass123',
            first_name='Alumni',
            last_name='User',
            user_type='alumni'
        )
    
    def test_complete_mentorship_workflow(self):
        """Test complete mentorship workflow"""
        # Student requests mentorship
        refresh = RefreshToken.for_user(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        request_data = {
            'mentor': self.alumni.id,
            'program_type': 'career',
            'message': 'I need career guidance'
        }
        
        response = self.client.post('/api/mentorship/requests/', request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Alumni approves request
        refresh = RefreshToken.for_user(self.alumni)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        request_id = response.data['id']
        approval_response = self.client.post(f'/api/mentorship/requests/{request_id}/accept/')
        self.assertEqual(approval_response.status_code, status.HTTP_200_OK)
    
    def test_complete_crowdfunding_workflow(self):
        """Test complete crowdfunding workflow"""
        # Alumni creates campaign
        refresh = RefreshToken.for_user(self.alumni)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        campaign_data = {
            'title': 'Scholarship Fund',
            'description': 'Supporting students in need',
            'category': 'education',
            'target_amount': 10000.00,
            'start_date': '2024-12-01T00:00:00Z',
            'end_date': '2024-12-31T23:59:59Z'
        }
        
        response = self.client.post('/api/crowdfunding/campaigns/', campaign_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Student makes donation
        refresh = RefreshToken.for_user(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        campaign_id = response.data['id']
        donation_data = {
            'amount': 50.00,
            'message': 'Great cause!'
        }
        
        with patch('stripe.PaymentIntent.create') as mock_stripe:
            mock_stripe.return_value = MagicMock(id='pi_test123')
            
            donation_response = self.client.post(
                f'/api/crowdfunding/campaigns/{campaign_id}/donate/', 
                donation_data, 
                format='json'
            )
            self.assertEqual(donation_response.status_code, status.HTTP_201_CREATED)


# Performance Tests
class PerformanceTests(TestCase):
    """Performance tests for critical operations"""
    
    def setUp(self):
        self.users = []
        for i in range(100):
            user = User.objects.create_user(
                email=f'user{i}@example.com',
                password=f'user{i}pass123',
                first_name=f'User{i}',
                last_name='Test',
                user_type='student'
            )
            self.users.append(user)
    
    def test_bulk_user_creation_performance(self):
        """Test performance of bulk user creation"""
        import time
        
        start_time = time.time()
        
        users = []
        for i in range(100, 200):
            user = User.objects.create_user(
                email=f'perfuser{i}@example.com',
                password=f'perfuser{i}pass123',
                first_name=f'PerfUser{i}',
                last_name='Test',
                user_type='student'
            )
            users.append(user)
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Should create 100 users in less than 5 seconds
        self.assertLess(duration, 5.0)
        self.assertEqual(len(users), 100)
    
    def test_streak_calculation_performance(self):
        """Test performance of streak calculations"""
        import time
        
        # Create streaks for all users
        streaks = []
        for user in self.users[:50]:  # Test with 50 users
            streak = UserStreak.objects.create(user=user)
            streaks.append(streak)
        
        start_time = time.time()
        
        # Update streaks for all users
        for streak in streaks:
            streak.update_streak()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Should update 50 streaks in less than 1 second
        self.assertLess(duration, 1.0)
