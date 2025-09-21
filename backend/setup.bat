@echo off
REM Alumni Backend Setup Script for Windows

echo 🚀 Setting up Alumni Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not installed. Please install pip first.
    pause
    exit /b 1
)

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo 📚 Installing requirements...
pip install -r requirements.txt

REM Copy environment file
echo ⚙️ Setting up environment...
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file from template
) else (
    echo ℹ️ .env file already exists
)

REM Create logs directory
echo 📁 Creating logs directory...
if not exist logs mkdir logs

REM Run migrations
echo 🗄️ Running database migrations...
python manage.py makemigrations
python manage.py migrate

REM Create superuser (optional)
echo 👤 Creating superuser...
echo You can skip this step by pressing Ctrl+C
python manage.py createsuperuser

echo ✅ Setup complete!
echo.
echo To start the development server:
echo 1. Activate virtual environment: venv\Scripts\activate.bat
echo 2. Run server: python manage.py runserver
echo.
echo The API will be available at: http://localhost:8000/api/
echo Admin panel: http://localhost:8000/admin/
pause
