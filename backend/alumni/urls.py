from django.urls import path
from . import views

urlpatterns = [
    path('spotlights/', views.spotlight_list, name='spotlight_list'),
    path('spotlights/<int:pk>/', views.spotlight_detail, name='spotlight_detail'),
    path('clubs/', views.clubs_list, name='clubs_list'),
    path('clubs/<int:pk>/', views.club_detail, name='club_detail'),
    path('clubs/<int:pk>/join/', views.join_club, name='join_club'),
    path('clubs/<int:pk>/leave/', views.leave_club, name='leave_club'),
]
