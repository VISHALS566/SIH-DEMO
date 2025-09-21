from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Interest, UserInterest, AlumniProfile, 
    StudentProfile, FacultyProfile, RecruiterProfile, AdminProfile
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'user_type', 'status', 'is_active', 'date_joined')
    list_filter = ('user_type', 'status', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'user_type', 'status', 'phone_number', 'date_of_birth', 'bio', 'profile_picture')}),
        ('Social Links', {'fields': ('linkedin_profile',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'approved_at')}),
        ('Approval', {'fields': ('approved_by',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'user_type', 'password1', 'password2'),
        }),
    )


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'category')


@admin.register(UserInterest)
class UserInterestAdmin(admin.ModelAdmin):
    list_display = ('user', 'interest', 'created_at')
    list_filter = ('interest', 'created_at')
    search_fields = ('user__email', 'interest__name')


@admin.register(AlumniProfile)
class AlumniProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'graduation_year', 'department', 'company', 'is_mentor')
    list_filter = ('graduation_year', 'department', 'industry', 'is_mentor')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'company')


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'expected_graduation_year', 'department', 'major', 'current_year')
    list_filter = ('expected_graduation_year', 'department', 'current_year')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'major')


@admin.register(FacultyProfile)
class FacultyProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'designation', 'specialization')
    list_filter = ('department', 'designation')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'specialization')


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'position', 'industry', 'is_verified')
    list_filter = ('industry', 'company_size', 'is_verified')
    search_fields = ('user__email', 'company', 'position')


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'designation')
    list_filter = ('department', 'designation')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
