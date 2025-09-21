# Alumni Platform API - cURL Examples

## Authentication

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "user_type": "student",
    "linkedin_profile": "https://linkedin.com/in/testuser",
    "phone_number": "+1234567890",
    "bio": "I am a test user",
    "interests_data": ["Technology", "Programming", "Data Science"]
  }'
```

### Login User
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "your_refresh_token_here"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Update Profile
```bash
curl -X PUT http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio",
    "phone_number": "+1987654321"
  }'
```

### Change Password
```bash
curl -X POST http://localhost:8000/api/auth/change-password/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "TestPass123!",
    "new_password": "NewPass123!",
    "new_password_confirm": "NewPass123!"
  }'
```

### Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "your_refresh_token_here"
  }'
```

## Posts

### Get Posts
```bash
curl -X GET http://localhost:8000/api/posts/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Create Post
```bash
curl -X POST http://localhost:8000/api/posts/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is my first post on the alumni platform!",
    "post_type": "general",
    "tags": ["announcement", "general"]
  }'
```

### Get Post Details
```bash
curl -X GET http://localhost:8000/api/posts/1/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Like Post
```bash
curl -X POST http://localhost:8000/api/posts/1/like/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Get Post Comments
```bash
curl -X GET http://localhost:8000/api/posts/1/comments/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Add Comment
```bash
curl -X POST http://localhost:8000/api/posts/1/comments/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great post! Thanks for sharing."
  }'
```

## Events

### Get Events
```bash
curl -X GET http://localhost:8000/api/events/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Create Event
```bash
curl -X POST http://localhost:8000/api/events/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Alumni Networking Event",
    "description": "Join us for a networking event with fellow alumni",
    "event_type": "networking",
    "location": "Main Campus Auditorium",
    "start_date": "2024-12-25T18:00:00Z",
    "end_date": "2024-12-25T21:00:00Z",
    "max_attendees": 100
  }'
```

### Register for Event
```bash
curl -X POST http://localhost:8000/api/events/1/register/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Unregister from Event
```bash
curl -X POST http://localhost:8000/api/events/1/unregister/ \
  -H "Authorization: Bearer your_access_token_here"
```

## Mentorship

### Get Mentorship Programs
```bash
curl -X GET http://localhost:8000/api/mentorship/programs/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Create Mentorship Request
```bash
curl -X POST http://localhost:8000/api/mentorship/requests/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "mentor": 2,
    "program_type": "career",
    "message": "I would like to request mentorship for career guidance"
  }'
```

### Accept Mentorship Request
```bash
curl -X POST http://localhost:8000/api/mentorship/requests/1/accept/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Reject Mentorship Request
```bash
curl -X POST http://localhost:8000/api/mentorship/requests/1/reject/ \
  -H "Authorization: Bearer your_access_token_here"
```

## Crowdfunding

### Get Campaigns
```bash
curl -X GET http://localhost:8000/api/crowdfunding/campaigns/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Create Campaign
```bash
curl -X POST http://localhost:8000/api/crowdfunding/campaigns/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Student Scholarship Fund",
    "description": "Help fund scholarships for deserving students",
    "category": "education",
    "target_amount": 50000.00,
    "start_date": "2024-12-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z"
  }'
```

### Make Donation
```bash
curl -X POST http://localhost:8000/api/crowdfunding/campaigns/1/donate/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "message": "Great cause! Happy to support.",
    "is_anonymous": false
  }'
```

### Get Campaign Updates
```bash
curl -X GET http://localhost:8000/api/crowdfunding/campaigns/1/updates/ \
  -H "Authorization: Bearer your_access_token_here"
```

## Chat

### Get Chat Rooms
```bash
curl -X GET http://localhost:8000/api/chat/rooms/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Get Messages
```bash
curl -X GET http://localhost:8000/api/chat/rooms/1/messages/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Send Message
```bash
curl -X POST http://localhost:8000/api/chat/rooms/1/messages/ \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello! How are you doing?"
  }'
```

### Get Meeting Requests
```bash
curl -X GET http://localhost:8000/api/chat/meeting-requests/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Approve Meeting Request
```bash
curl -X POST http://localhost:8000/api/chat/meeting-requests/1/approve/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Reject Meeting Request
```bash
curl -X POST http://localhost:8000/api/chat/meeting-requests/1/reject/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Get User Streak
```bash
curl -X GET http://localhost:8000/api/chat/streaks/ \
  -H "Authorization: Bearer your_access_token_here"
```

## Alumni Features

### Get Spotlights
```bash
curl -X GET http://localhost:8000/api/alumni/spotlights/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Get Clubs
```bash
curl -X GET http://localhost:8000/api/alumni/clubs/ \
  -H "Authorization: Bearer your_access_token_here"
```

### Join Club
```bash
curl -X POST http://localhost:8000/api/alumni/clubs/1/join/ \
  -H "Authorization: Bearer your_access_token_here"
```

## WebSocket Examples

### Connect to Chat WebSocket
```javascript
// JavaScript example for WebSocket connection
const token = 'your_access_token_here';
const ws = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);

ws.onopen = function(event) {
    console.log('Connected to chat WebSocket');
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Received message:', data);
};

// Send a message
ws.send(JSON.stringify({
    type: 'message',
    to_user: 2,
    content: 'Hello from WebSocket!'
}));

// Send a meeting request
ws.send(JSON.stringify({
    type: 'meeting_request',
    to_user: 2,
    datetime: '2024-12-25T14:00:00Z',
    topic: 'Career Discussion'
}));

// Send typing indicator
ws.send(JSON.stringify({
    type: 'typing',
    to_user: 2,
    is_typing: true
}));
```

## Testing Script

### Complete Workflow Test
```bash
#!/bin/bash

BASE_URL="http://localhost:8000/api"

echo "Testing Alumni Platform API..."

# Register user
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "user_type": "student",
    "interests_data": ["Technology", "Programming"]
  }')

echo "Register response: $REGISTER_RESPONSE"

# Extract tokens
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.tokens.access')
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.tokens.refresh')

echo "Access token: $ACCESS_TOKEN"

# Test profile access
echo "2. Testing profile access..."
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/auth/profile/ \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Profile response: $PROFILE_RESPONSE"

# Create a post
echo "3. Creating a post..."
POST_RESPONSE=$(curl -s -X POST $BASE_URL/posts/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "This is a test post",
    "post_type": "general"
  }')

echo "Post response: $POST_RESPONSE"

# Create an event
echo "4. Creating an event..."
EVENT_RESPONSE=$(curl -s -X POST $BASE_URL/events/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "This is a test event",
    "event_type": "workshop",
    "start_date": "2024-12-25T10:00:00Z",
    "end_date": "2024-12-25T12:00:00Z"
  }')

echo "Event response: $EVENT_RESPONSE"

echo "API testing completed!"
```

## Error Handling Examples

### Handle Authentication Errors
```bash
# Test with invalid token
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer invalid_token"

# Expected response:
# {"detail":"Given token not valid for any token type"}
```

### Handle Validation Errors
```bash
# Test with invalid registration data
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }'

# Expected response:
# {"email":["Enter a valid email address."],"password":["This password is too short."]}
```

## Rate Limiting Examples

### Test Rate Limiting
```bash
# Make multiple requests quickly to test rate limiting
for i in {1..20}; do
  curl -X GET http://localhost:8000/api/posts/ \
    -H "Authorization: Bearer your_access_token_here"
  echo "Request $i completed"
done
```

## File Upload Examples

### Upload Profile Picture
```bash
curl -X PUT http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer your_access_token_here" \
  -F "profile_picture=@/path/to/image.jpg"
```

### Upload Post Image
```bash
curl -X POST http://localhost:8000/api/posts/ \
  -H "Authorization: Bearer your_access_token_here" \
  -F "title=Post with Image" \
  -F "content=This post has an image" \
  -F "post_type=general" \
  -F "image=@/path/to/image.jpg"
```

---

**Note:** Replace `your_access_token_here` with actual JWT tokens obtained from login/register endpoints. The examples assume the API is running on `localhost:8000` - adjust the URL as needed for your deployment.
