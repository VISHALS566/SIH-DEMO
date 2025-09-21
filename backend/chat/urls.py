from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.chat_room_list, name='chat_room_list'),
    path('rooms/<int:room_id>/messages/', views.message_list, name='message_list'),
    path('rooms/<int:room_id>/messages/', views.create_message, name='create_message'),
    path('meeting-requests/', views.meeting_request_list, name='meeting_request_list'),
    path('meeting-requests/<int:request_id>/approve/', views.approve_meeting_request, name='approve_meeting_request'),
    path('meeting-requests/<int:request_id>/reject/', views.reject_meeting_request, name='reject_meeting_request'),
    path('streaks/', views.user_streak, name='user_streak'),
    path('activity/', views.activity_log, name='activity_log'),
]
