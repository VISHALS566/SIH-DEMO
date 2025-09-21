from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Interest, UserInterest, AlumniProfile, StudentProfile, FacultyProfile, RecruiterProfile, AdminProfile


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name', 'category']


class UserInterestSerializer(serializers.ModelSerializer):
    interest = InterestSerializer(read_only=True)
    
    class Meta:
        model = UserInterest
        fields = ['interest']


class UserSerializer(serializers.ModelSerializer):
    interests = UserInterestSerializer(source='user_interests', many=True, read_only=True)
    interests_data = serializers.ListField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'user_type', 'status',
            'linkedin_profile', 'profile_picture', 'bio', 'phone_number',
            'date_of_birth', 'interests', 'interests_data', 'approved_by',
            'approved_at', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'status', 'approved_by', 'approved_at', 'date_joined', 'last_login']
    
    def create(self, validated_data):
        interests_data = validated_data.pop('interests_data', [])
        user = User.objects.create_user(**validated_data)
        
        # Add interests
        for interest_name in interests_data:
            interest, created = Interest.objects.get_or_create(name=interest_name)
            UserInterest.objects.create(user=user, interest=interest)
        
        return user
    
    def update(self, instance, validated_data):
        interests_data = validated_data.pop('interests_data', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update interests if provided
        if interests_data is not None:
            instance.user_interests.all().delete()
            for interest_name in interests_data:
                interest, created = Interest.objects.get_or_create(name=interest_name)
                UserInterest.objects.create(user=instance, interest=interest)
        
        return instance


class AlumniProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AlumniProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class FacultyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = FacultyProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = RecruiterProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class AdminProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    interests_data = serializers.ListField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'user_type', 'password',
            'password_confirm', 'linkedin_profile', 'phone_number',
            'date_of_birth', 'bio', 'interests_data'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        interests_data = validated_data.pop('interests_data')
        
        user = User.objects.create_user(**validated_data)
        
        # Add interests
        for interest_name in interests_data:
            interest, created = Interest.objects.get_or_create(name=interest_name)
            UserInterest.objects.create(user=user, interest=interest)
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user information to the response
        data['user'] = UserSerializer(self.user).data
        
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
