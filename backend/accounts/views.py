from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.db import transaction
from .models import User, Interest, AlumniProfile, StudentProfile, FacultyProfile, RecruiterProfile, AdminProfile
from .serializers import (
    UserSerializer, UserRegistrationSerializer, CustomTokenObtainPairSerializer,
    AlumniProfileSerializer, StudentProfileSerializer, FacultyProfileSerializer,
    RecruiterProfileSerializer, AdminProfileSerializer, ChangePasswordSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """
    Register a new user
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        with transaction.atomic():
            user = serializer.save()
            
            # Create appropriate profile based on user type
            if user.user_type == 'alumni':
                AlumniProfile.objects.create(user=user)
            elif user.user_type == 'student':
                StudentProfile.objects.create(user=user)
            elif user.user_type == 'faculty':
                FacultyProfile.objects.create(user=user)
            elif user.user_type == 'recruiter':
                RecruiterProfile.objects.create(user=user)
            elif user.user_type == 'admin':
                AdminProfile.objects.create(user=user)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Get or update user profile
    """
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request, user_type):
    """
    Get specific profile based on user type
    """
    user = request.user
    
    if user_type == 'alumni' and hasattr(user, 'alumni_profile'):
        serializer = AlumniProfileSerializer(user.alumni_profile)
    elif user_type == 'student' and hasattr(user, 'student_profile'):
        serializer = StudentProfileSerializer(user.student_profile)
    elif user_type == 'faculty' and hasattr(user, 'faculty_profile'):
        serializer = FacultyProfileSerializer(user.faculty_profile)
    elif user_type == 'recruiter' and hasattr(user, 'recruiter_profile'):
        serializer = RecruiterProfileSerializer(user.recruiter_profile)
    elif user_type == 'admin' and hasattr(user, 'admin_profile'):
        serializer = AdminProfileSerializer(user.admin_profile)
    else:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_user_profile(request, user_type):
    """
    Update specific profile based on user type
    """
    user = request.user
    
    try:
        if user_type == 'alumni' and hasattr(user, 'alumni_profile'):
            profile = user.alumni_profile
            serializer = AlumniProfileSerializer(profile, data=request.data, partial=True)
        elif user_type == 'student' and hasattr(user, 'student_profile'):
            profile = user.student_profile
            serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        elif user_type == 'faculty' and hasattr(user, 'faculty_profile'):
            profile = user.faculty_profile
            serializer = FacultyProfileSerializer(profile, data=request.data, partial=True)
        elif user_type == 'recruiter' and hasattr(user, 'recruiter_profile'):
            profile = user.recruiter_profile
            serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        elif user_type == 'admin' and hasattr(user, 'admin_profile'):
            profile = user.admin_profile
            serializer = AdminProfileSerializer(profile, data=request.data, partial=True)
        else:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_interests(request):
    """
    Get all available interests
    """
    interests = Interest.objects.all()
    serializer = InterestSerializer(interests, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_users_by_type(request, user_type):
    """
    Get users by type (for admin or specific user types)
    """
    if user_type not in ['student', 'alumni', 'faculty', 'admin', 'recruiter']:
        return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)
    
    users = User.objects.filter(user_type=user_type, status='active')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_user(request, user_id):
    """
    Approve a user (admin only)
    """
    if request.user.user_type != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        user.status = 'active'
        user.approved_by = request.user
        user.save()
        
        return Response({'message': 'User approved successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    """
    Logout user (blacklist refresh token)
    """
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
