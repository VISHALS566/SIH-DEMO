@echo off
REM Alumni Platform - Complete Setup Script for Windows

echo 🚀 Setting up Alumni Platform...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3.8+ is required but not installed
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 18+ is required but not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Check if Redis is available
redis-server --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Redis not found - you'll need to install it
    echo Download from: https://github.com/microsoftarchive/redis/releases
    echo Or use Docker: docker run -d -p 6379:6379 redis:alpine
)

REM Setup Backend
echo 📦 Setting up Django backend...
cd backend

REM Create virtual environment
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing Python dependencies...
pip install -r requirements.txt

REM Copy environment file
if not exist .env (
    echo Creating environment configuration...
    copy env.example .env
    echo ⚠️ Please edit .env file with your configuration
) else (
    echo ✅ Environment file already exists
)

REM Create necessary directories
echo Creating necessary directories...
if not exist logs mkdir logs
if not exist media mkdir media
if not exist staticfiles mkdir staticfiles

REM Run migrations
echo Running database migrations...
python manage.py makemigrations
python manage.py migrate

REM Create superuser (optional)
echo Creating superuser...
echo You can skip this step by pressing Ctrl+C
python manage.py createsuperuser
if errorlevel 1 (
    echo ⚠️ Superuser creation skipped
)

REM Collect static files
echo Collecting static files...
python manage.py collectstatic --noinput

echo ✅ Backend setup completed!

REM Setup Frontend
echo 📦 Setting up React frontend...
cd ..

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

REM Copy environment file
if not exist .env (
    echo Creating frontend environment configuration...
    copy env.example .env
    echo ⚠️ Please edit .env file with your API configuration
) else (
    echo ✅ Frontend environment file already exists
)

REM Run linting
echo Running frontend linting...
npm run lint
if errorlevel 1 (
    echo ⚠️ Linting issues found - please fix them
)

REM Build frontend
echo Building frontend...
npm run build

echo ✅ Frontend setup completed!

REM Create startup scripts
echo 📝 Creating startup scripts...

REM Backend startup script
echo @echo off > start_backend.bat
echo cd backend >> start_backend.bat
echo call venv\Scripts\activate.bat >> start_backend.bat
echo python manage.py runserver 0.0.0.0:8000 >> start_backend.bat

REM Frontend startup script
echo @echo off > start_frontend.bat
echo npm start >> start_frontend.bat

REM Full development startup script
echo @echo off > start_dev.bat
echo echo Starting Alumni Platform in development mode... >> start_dev.bat
echo. >> start_dev.bat
echo REM Start backend in background >> start_dev.bat
echo start "Backend" cmd /k "cd backend ^&^& call venv\Scripts\activate.bat ^&^& python manage.py runserver 0.0.0.0:8000" >> start_dev.bat
echo timeout /t 5 /nobreak ^>nul >> start_dev.bat
echo. >> start_dev.bat
echo REM Start frontend >> start_dev.bat
echo start "Frontend" cmd /k "npm start" >> start_dev.bat
echo. >> start_dev.bat
echo echo Backend and Frontend started! >> start_dev.bat
echo echo Press any key to stop... >> start_dev.bat
echo pause >> start_dev.bat

REM Test script
echo @echo off > run_tests.bat
echo echo Running Alumni Platform tests... >> run_tests.bat
echo. >> run_tests.bat
echo REM Backend tests >> run_tests.bat
echo echo Running backend tests... >> run_tests.bat
echo cd backend >> run_tests.bat
echo call venv\Scripts\activate.bat >> run_tests.bat
echo python manage.py test --verbosity=2 >> run_tests.bat
echo. >> run_tests.bat
echo REM Frontend tests >> run_tests.bat
echo echo Running frontend tests... >> run_tests.bat
echo cd .. >> run_tests.bat
echo npm test -- --coverage --watchAll=false >> run_tests.bat
echo. >> run_tests.bat
echo echo All tests completed! >> run_tests.bat
echo pause >> run_tests.bat

REM Docker setup script
echo @echo off > setup_docker.bat
echo echo Setting up Alumni Platform with Docker... >> setup_docker.bat
echo. >> setup_docker.bat
echo REM Build and start services >> setup_docker.bat
echo docker-compose up -d --build >> setup_docker.bat
echo. >> setup_docker.bat
echo REM Wait for services to be ready >> setup_docker.bat
echo echo Waiting for services to start... >> setup_docker.bat
echo timeout /t 30 /nobreak ^>nul >> setup_docker.bat
echo. >> setup_docker.bat
echo REM Run migrations >> setup_docker.bat
echo docker-compose exec backend python manage.py migrate >> setup_docker.bat
echo. >> setup_docker.bat
echo REM Create superuser >> setup_docker.bat
echo echo Creating superuser... >> setup_docker.bat
echo docker-compose exec backend python manage.py createsuperuser >> setup_docker.bat
echo. >> setup_docker.bat
echo REM Collect static files >> setup_docker.bat
echo docker-compose exec backend python manage.py collectstatic --noinput >> setup_docker.bat
echo. >> setup_docker.bat
echo echo Docker setup completed! >> setup_docker.bat
echo echo Backend: http://localhost:8000 >> setup_docker.bat
echo echo Frontend: http://localhost:3000 >> setup_docker.bat
echo echo Admin: http://localhost:8000/admin >> setup_docker.bat
echo pause >> setup_docker.bat

echo ✅ Startup scripts created!

REM Final instructions
echo.
echo 🎉 Alumni Platform setup completed!
echo.
echo 📋 Next steps:
echo 1. Edit .env files with your configuration
echo 2. Start Redis (if not using Docker)
echo 3. Start the application:
echo    - Backend: start_backend.bat
echo    - Frontend: start_frontend.bat
echo    - Or both: start_dev.bat
echo.
echo 🐳 Or use Docker:
echo    - setup_docker.bat
echo.
echo 🧪 Run tests:
echo    - run_tests.bat
echo.
echo 🌐 Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:8000/api/
echo    - Admin Panel: http://localhost:8000/admin/
echo.
echo 📚 Documentation:
echo    - API Examples: API_EXAMPLES.md
echo    - Deployment: DEPLOYMENT.md
echo    - Postman Collection: postman_collection.json
echo.
echo ✅ Happy coding! 🚀
pause
