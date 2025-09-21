from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication URLs
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_user, name='register'),
    path('logout/', views.logout_user, name='logout'),
    
    # User Profile URLs
    path('profile/', views.user_profile, name='user_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('profile/<str:user_type>/', views.get_user_profile, name='get_user_profile'),
    path('profile/<str:user_type>/update/', views.update_user_profile, name='update_user_profile'),
    
    # Utility URLs
    path('interests/', views.get_interests, name='get_interests'),
    path('users/<str:user_type>/', views.get_users_by_type, name='get_users_by_type'),
    path('approve/<int:user_id>/', views.approve_user, name='approve_user'),
]
