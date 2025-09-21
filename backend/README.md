# Alumni Backend - Django REST API

A comprehensive Django backend for the Alumni Management Platform that provides REST APIs for user authentication, profile management, posts, events, mentorship, and crowdfunding features.

## Features

- **User Authentication**: JWT-based authentication with custom user model
- **User Types**: Support for Students, Alumni, Faculty, Admin, and Recruiters
- **Profile Management**: Extended profiles for each user type
- **Posts & Social**: Create posts, comments, likes, and follow users
- **Events**: Event management and registration system
- **Mentorship**: Mentorship programs and session management
- **Crowdfunding**: Campaign creation and donation system
- **Alumni Spotlight**: Feature alumni achievements
- **Clubs**: Alumni club management

## Tech Stack

- Django 4.2.7
- Django REST Framework 3.14.0
- JWT Authentication
- PostgreSQL (production) / SQLite (development)
- Celery for background tasks
- Redis for caching

## Installation

### Prerequisites

- Python 3.8+
- pip
- virtualenv (recommended)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alumni-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   ```bash
   cp env.example .env
   # Edit .env file with your settings
   ```

5. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Load initial data (optional)**
   ```bash
   python manage.py loaddata initial_data.json
   ```

8. **Run development server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/token/refresh/` - Refresh JWT token

### User Management
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password
- `GET /api/auth/profile/{user_type}/` - Get specific profile
- `PUT /api/auth/profile/{user_type}/update/` - Update specific profile

### Posts
- `GET /api/posts/` - List posts
- `POST /api/posts/` - Create post
- `GET /api/posts/{id}/` - Get post details
- `PUT /api/posts/{id}/` - Update post
- `DELETE /api/posts/{id}/` - Delete post
- `POST /api/posts/{id}/like/` - Like/unlike post
- `GET /api/posts/{id}/comments/` - Get post comments
- `POST /api/posts/{id}/comments/` - Add comment

### Events
- `GET /api/events/` - List events
- `POST /api/events/` - Create event
- `GET /api/events/{id}/` - Get event details
- `POST /api/events/{id}/register/` - Register for event
- `POST /api/events/{id}/unregister/` - Unregister from event

### Mentorship
- `GET /api/mentorship/programs/` - List mentorship programs
- `POST /api/mentorship/programs/` - Create mentorship program
- `GET /api/mentorship/requests/` - List mentorship requests
- `POST /api/mentorship/requests/` - Create mentorship request

### Crowdfunding
- `GET /api/crowdfunding/campaigns/` - List campaigns
- `POST /api/crowdfunding/campaigns/` - Create campaign
- `GET /api/crowdfunding/campaigns/{id}/` - Get campaign details
- `POST /api/crowdfunding/campaigns/{id}/donate/` - Make donation

### Alumni Features
- `GET /api/alumni/spotlights/` - List alumni spotlights
- `GET /api/alumni/clubs/` - List clubs
- `POST /api/alumni/clubs/{id}/join/` - Join club

## User Types

### Student
- Expected graduation year
- Department and major
- GPA and academic year
- Job/internship search status
- Resume and portfolio links

### Alumni
- Graduation year and degree
- Current position and company
- Industry and location
- Mentorship capabilities
- Professional links

### Faculty
- Department and designation
- Research interests
- Office information
- Academic links

### Recruiter
- Company information
- Industry and company size
- Verification status
- Professional links

### Admin
- Department and designation
- Permission management
- User approval capabilities

## Database Models

### Core Models
- `User` - Custom user model with extended fields
- `Interest` - User interests/tags
- `UserInterest` - Many-to-many relationship

### Profile Models
- `AlumniProfile` - Extended alumni information
- `StudentProfile` - Extended student information
- `FacultyProfile` - Extended faculty information
- `RecruiterProfile` - Extended recruiter information
- `AdminProfile` - Extended admin information

### Feature Models
- `Post` - User posts and content
- `Comment` - Post comments
- `Like` - Post and comment likes
- `Follow` - User following relationships
- `Event` - Events and activities
- `EventRegistration` - Event registrations
- `MentorshipProgram` - Mentorship programs
- `MentorshipSession` - Individual sessions
- `CrowdfundingCampaign` - Fundraising campaigns
- `Donation` - Campaign donations

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Registration**: Users register with email, password, and profile information
2. **Login**: Users login with email/password to receive access and refresh tokens
3. **Authorization**: Include the access token in the Authorization header: `Bearer <token>`
4. **Token Refresh**: Use the refresh token to get new access tokens

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:3000` (React development)
- `http://localhost:5173` (Vite development)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

## Development

### Running Tests
```bash
python manage.py test
```

### Code Quality
```bash
# Install development dependencies
pip install black flake8 isort

# Format code
black .

# Check code style
flake8 .

# Sort imports
isort .
```

### Database Migrations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create migration for specific app
python manage.py makemigrations accounts
```

## Production Deployment

### Environment Variables
Set the following environment variables in production:

```bash
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@localhost:5432/alumni_db
EMAIL_HOST=smtp.your-provider.com
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-password
```

### Database
For production, use PostgreSQL:

```bash
pip install psycopg2-binary
```

Update `settings.py` to use PostgreSQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'alumni_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Static Files
```bash
python manage.py collectstatic
```

### Celery (Background Tasks)
```bash
# Start Celery worker
celery -A alumni_backend worker -l info

# Start Celery beat (for scheduled tasks)
celery -A alumni_backend beat -l info
```

## API Documentation

Once the server is running, you can access:
- **Django Admin**: `http://localhost:8000/admin/`
- **API Root**: `http://localhost:8000/api/`
- **Browsable API**: `http://localhost:8000/api/auth/` (when logged in)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
