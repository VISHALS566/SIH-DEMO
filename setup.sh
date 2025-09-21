#!/bin/bash

# Alumni Platform - Complete Setup Script for Linux/macOS

set -e  # Exit on any error

echo "🚀 Setting up Alumni Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on supported OS
if [[ "$OSTYPE" != "linux-gnu"* ]] && [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for Linux and macOS only"
    exit 1
fi

# Check if Python 3.8+ is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3.8+ is required but not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
if [[ $(echo "$PYTHON_VERSION < 3.8" | bc -l) -eq 1 ]]; then
    print_error "Python 3.8+ is required, but found $PYTHON_VERSION"
    exit 1
fi

print_success "Python $PYTHON_VERSION found"

# Check if Node.js 18+ is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js 18+ is required but not installed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 18 ]]; then
    print_error "Node.js 18+ is required, but found v$NODE_VERSION"
    exit 1
fi

print_success "Node.js $(node -v) found"

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    print_success "Docker found - you can use docker-compose for deployment"
else
    print_warning "Docker not found - you'll need to install it for containerized deployment"
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    print_warning "Redis not found - installing Redis..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y redis-server
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install redis
        else
            print_error "Homebrew not found. Please install Redis manually"
            exit 1
        fi
    fi
fi

print_success "Redis found"

# Setup Backend
print_status "Setting up Django backend..."

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install requirements
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Copy environment file
if [ ! -f ".env" ]; then
    print_status "Creating environment configuration..."
    cp env.example .env
    print_warning "Please edit .env file with your configuration"
else
    print_success "Environment file already exists"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs media staticfiles

# Run migrations
print_status "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
print_status "Creating superuser..."
echo "You can skip this step by pressing Ctrl+C"
python manage.py createsuperuser || print_warning "Superuser creation skipped"

# Collect static files
print_status "Collecting static files..."
python manage.py collectstatic --noinput

print_success "Backend setup completed!"

# Setup Frontend
print_status "Setting up React frontend..."

cd ../

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Copy environment file
if [ ! -f ".env" ]; then
    print_status "Creating frontend environment configuration..."
    cp env.example .env
    print_warning "Please edit .env file with your API configuration"
else
    print_success "Frontend environment file already exists"
fi

# Run linting
print_status "Running frontend linting..."
npm run lint || print_warning "Linting issues found - please fix them"

# Build frontend
print_status "Building frontend..."
npm run build

print_success "Frontend setup completed!"

# Create startup scripts
print_status "Creating startup scripts..."

# Backend startup script
cat > start_backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
EOF

chmod +x start_backend.sh

# Frontend startup script
cat > start_frontend.sh << 'EOF'
#!/bin/bash
npm start
EOF

chmod +x start_frontend.sh

# Full development startup script
cat > start_dev.sh << 'EOF'
#!/bin/bash
echo "Starting Alumni Platform in development mode..."

# Start Redis
redis-server --daemonize yes

# Start backend in background
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Start frontend
cd ..
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; redis-cli shutdown; exit" INT
wait
EOF

chmod +x start_dev.sh

# Create test script
cat > run_tests.sh << 'EOF'
#!/bin/bash
echo "Running Alumni Platform tests..."

# Backend tests
echo "Running backend tests..."
cd backend
source venv/bin/activate
python manage.py test --verbosity=2

# Frontend tests
echo "Running frontend tests..."
cd ..
npm test -- --coverage --watchAll=false

echo "All tests completed!"
EOF

chmod +x run_tests.sh

print_success "Startup scripts created!"

# Create Docker setup script
cat > setup_docker.sh << 'EOF'
#!/bin/bash
echo "Setting up Alumni Platform with Docker..."

# Build and start services
docker-compose up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
echo "Creating superuser..."
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

echo "Docker setup completed!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Admin: http://localhost:8000/admin"
EOF

chmod +x setup_docker.sh

print_success "Docker setup script created!"

# Final instructions
echo ""
print_success "🎉 Alumni Platform setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env files with your configuration"
echo "2. Start Redis: redis-server"
echo "3. Start the application:"
echo "   - Backend: ./start_backend.sh"
echo "   - Frontend: ./start_frontend.sh"
echo "   - Or both: ./start_dev.sh"
echo ""
echo "🐳 Or use Docker:"
echo "   - ./setup_docker.sh"
echo ""
echo "🧪 Run tests:"
echo "   - ./run_tests.sh"
echo ""
echo "🌐 Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000/api/"
echo "   - Admin Panel: http://localhost:8000/admin/"
echo ""
echo "📚 Documentation:"
echo "   - API Examples: API_EXAMPLES.md"
echo "   - Deployment: DEPLOYMENT.md"
echo "   - Postman Collection: postman_collection.json"
echo ""
print_success "Happy coding! 🚀"
