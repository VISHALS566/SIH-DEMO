# Alumni Platform

A comprehensive alumni management platform built with React frontend and Django backend, featuring real-time chat, mentorship programs, crowdfunding campaigns, and premium features.

## 🌟 Features

### Core Features
- **Multi-User Support**: Students, Alumni, Faculty, Admin, and Recruiters
- **JWT Authentication**: Secure login/logout with refresh tokens
- **Real-time Chat**: WebSocket-based messaging with typing indicators
- **Meeting Requests**: Integrated meeting scheduling with approval workflow
- **Streak System**: Gamified activity tracking with premium animations
- **Crowdfunding**: Campaign creation and donation management
- **Event Management**: Event creation, registration, and feedback
- **Mentorship Programs**: Mentor-mentee matching and session management
- **Alumni Spotlight**: Feature alumni achievements and stories
- **Clubs & Organizations**: Alumni club management

### Premium Features
- **Animated Streak Celebrations**: Duolingo-style streak animations
- **Advanced Analytics**: Detailed user activity insights
- **Priority Support**: Enhanced customer support
- **Exclusive Content**: Premium-only features and content

### Technical Features
- **Real-time WebSocket**: Django Channels for live communication
- **File Uploads**: S3-compatible storage with local fallback
- **Payment Integration**: Stripe integration for donations
- **Admin Panel**: Comprehensive admin interface
- **API Documentation**: Complete REST API with examples
- **Testing Suite**: Comprehensive unit and integration tests
- **Docker Support**: Containerized deployment
- **CI/CD Pipeline**: GitHub Actions workflow

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Redis
- PostgreSQL (optional, SQLite for development)

### Automated Setup

#### Linux/macOS
```bash
chmod +x setup.sh
./setup.sh
```

#### Windows
```cmd
setup.bat
```

### Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend Setup
```bash
npm install
cp env.example .env
npm start
```

### Docker Setup
```bash
docker-compose up -d --build
```

## 📁 Project Structure

```
alumni-platform/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication & profiles
│   ├── posts/              # Social posts & interactions
│   ├── events/             # Event management
│   ├── mentorship/         # Mentorship programs
│   ├── crowdfunding/       # Fundraising campaigns
│   ├── chat/               # Real-time chat & WebSocket
│   ├── alumni/             # Alumni-specific features
│   └── tests/              # Backend tests
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/           # API & WebSocket services
│   └── styles/             # CSS styles
├── docker-compose.yml      # Docker configuration
├── postman_collection.json # API collection
└── setup.sh/setup.bat     # Setup scripts
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=your-aws-key
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_ENABLE_PREMIUM_FEATURES=true
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Token refresh
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update profile

### Core Features
- `GET /api/posts/` - List posts
- `POST /api/posts/` - Create post
- `GET /api/events/` - List events
- `POST /api/events/{id}/register/` - Register for event
- `GET /api/mentorship/programs/` - List mentorship programs
- `POST /api/crowdfunding/campaigns/` - Create campaign
- `POST /api/crowdfunding/{id}/donate/` - Make donation

### Real-time Chat
- `WS /ws/chat/?token=<access>` - WebSocket connection
- Message types: `message`, `meeting_request`, `typing`

## 🧪 Testing

### Run All Tests
```bash
./run_tests.sh  # Linux/macOS
run_tests.bat   # Windows
```

### Backend Tests
```bash
cd backend
source venv/bin/activate
python manage.py test
```

### Frontend Tests
```bash
npm test
```

### API Testing
- Import `postman_collection.json` into Postman
- Use cURL examples from `API_EXAMPLES.md`

## 🚀 Deployment

### Production Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Providers
- **DigitalOcean**: App Platform configuration included
- **AWS**: ECS task definitions provided
- **Google Cloud**: Cloud Run configuration included
- **Heroku**: Procfile and buildpacks configured

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- CORS configuration for cross-origin requests
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload handling
- HTTPS enforcement in production
- Security headers configuration

## 📊 Monitoring & Analytics

- Application performance monitoring
- User activity tracking
- Streak analytics
- Campaign performance metrics
- Real-time WebSocket monitoring
- Error logging and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/TypeScript
- Write comprehensive tests
- Document new features
- Update API documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Examples](API_EXAMPLES.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Postman Collection](postman_collection.json)

### Getting Help
- Check the documentation first
- Search existing issues
- Create a new issue with detailed information
- Contact the development team

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered mentor matching
- [ ] Video calling integration
- [ ] Advanced notification system
- [ ] Multi-language support
- [ ] Advanced search functionality
- [ ] Integration with LinkedIn API

### Known Limitations
- WebSocket reconnection needs improvement
- File upload size limits
- Limited mobile responsiveness in some areas
- Stripe webhook handling needs enhancement

## 🙏 Acknowledgments

- Django REST Framework for API development
- React and TypeScript for frontend
- Django Channels for WebSocket support
- Stripe for payment processing
- Redis for caching and real-time features
- PostgreSQL for production database
- Docker for containerization

---

**Built with ❤️ for alumni communities worldwide**

For questions or support, please open an issue or contact the development team.