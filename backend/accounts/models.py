from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('alumni', 'Alumni'),
        ('faculty', 'Faculty'),
        ('admin', 'Admin'),
        ('recruiter', 'Recruiter'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('suspended', 'Suspended'),
        ('under_review', 'Under Review'),
    ]
    
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    linkedin_profile = models.URLField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")],
        blank=True,
        null=True
    )
    date_of_birth = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_users')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Override username field to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def is_approved(self):
        return self.status == 'active'


class Interest(models.Model):
    """
    Model for storing user interests
    """
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interests'
        verbose_name = 'Interest'
        verbose_name_plural = 'Interests'
    
    def __str__(self):
        return self.name


class UserInterest(models.Model):
    """
    Many-to-many relationship between User and Interest
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_interests')
    interest = models.ForeignKey(Interest, on_delete=models.CASCADE, related_name='user_interests')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_interests'
        unique_together = ['user', 'interest']
        verbose_name = 'User Interest'
        verbose_name_plural = 'User Interests'
    
    def __str__(self):
        return f"{self.user.email} - {self.interest.name}"


class AlumniProfile(models.Model):
    """
    Extended profile for Alumni users
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='alumni_profile')
    graduation_year = models.IntegerField()
    department = models.CharField(max_length=100)
    degree_type = models.CharField(max_length=50, blank=True, null=True)  # Bachelor's, Master's, PhD, etc.
    current_position = models.CharField(max_length=200, blank=True, null=True)
    company = models.CharField(max_length=200, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    is_mentor = models.BooleanField(default=False)
    mentor_rating = models.FloatField(default=0.0)
    total_mentorship_sessions = models.IntegerField(default=0)
    linkedin_url = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'alumni_profiles'
        verbose_name = 'Alumni Profile'
        verbose_name_plural = 'Alumni Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Alumni Profile"


class StudentProfile(models.Model):
    """
    Extended profile for Student users
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    expected_graduation_year = models.IntegerField()
    department = models.CharField(max_length=100)
    major = models.CharField(max_length=100, blank=True, null=True)
    minor = models.CharField(max_length=100, blank=True, null=True)
    gpa = models.FloatField(blank=True, null=True)
    current_year = models.CharField(max_length=20, blank=True, null=True)  # Freshman, Sophomore, etc.
    is_looking_for_internship = models.BooleanField(default=False)
    is_looking_for_job = models.BooleanField(default=False)
    resume_url = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_profiles'
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Student Profile"


class FacultyProfile(models.Model):
    """
    Extended profile for Faculty users
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100, blank=True, null=True)  # Professor, Associate Professor, etc.
    specialization = models.CharField(max_length=200, blank=True, null=True)
    research_interests = models.TextField(blank=True, null=True)
    office_location = models.CharField(max_length=100, blank=True, null=True)
    office_hours = models.CharField(max_length=200, blank=True, null=True)
    phone_extension = models.CharField(max_length=10, blank=True, null=True)
    website_url = models.URLField(blank=True, null=True)
    google_scholar_url = models.URLField(blank=True, null=True)
    research_gate_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'faculty_profiles'
        verbose_name = 'Faculty Profile'
        verbose_name_plural = 'Faculty Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Faculty Profile"


class RecruiterProfile(models.Model):
    """
    Extended profile for Recruiter users
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    company_size = models.CharField(max_length=50, blank=True, null=True)  # Startup, Mid-size, Enterprise
    location = models.CharField(max_length=200, blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verification_documents = models.FileField(upload_to='recruiter_verification/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'recruiter_profiles'
        verbose_name = 'Recruiter Profile'
        verbose_name_plural = 'Recruiter Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Recruiter Profile"


class AdminProfile(models.Model):
    """
    Extended profile for Admin users
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    department = models.CharField(max_length=100, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    permissions = models.JSONField(default=list, blank=True)  # List of permissions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'admin_profiles'
        verbose_name = 'Admin Profile'
        verbose_name_plural = 'Admin Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Admin Profile"
