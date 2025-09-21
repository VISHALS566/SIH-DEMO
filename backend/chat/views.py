from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMessage, MeetingRequest, UserStreak, ActivityLog
from .serializers import ChatRoomSerializer, ChatMessageSerializer, MeetingRequestSerializer, UserStreakSerializer, ActivityLogSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def chat_room_list(request):
    """
    Get list of user's chat rooms
    """
    rooms = ChatRoom.objects.filter(participants=request.user).order_by('-updated_at')
    serializer = ChatRoomSerializer(rooms, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def message_list(request, room_id):
    """
    Get messages for a specific chat room
    """
    try:
        room = ChatRoom.objects.get(id=room_id, participants=request.user)
        messages = ChatMessage.objects.filter(room=room).order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Chat room not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_message(request, room_id):
    """
    Create a new message in a chat room
    """
    try:
        room = ChatRoom.objects.get(id=room_id, participants=request.user)
        
        serializer = ChatMessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            message = serializer.save(room=room, sender=request.user)
            return Response(ChatMessageSerializer(message, context={'request': request}).data, 
                          status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Chat room not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def meeting_request_list(request):
    """
    Get meeting requests for the user
    """
    requests = MeetingRequest.objects.filter(
        models.Q(requester=request.user) | models.Q(recipient=request.user)
    ).order_by('-created_at')
    
    serializer = MeetingRequestSerializer(requests, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_meeting_request(request, request_id):
    """
    Approve a meeting request
    """
    try:
        meeting_request = MeetingRequest.objects.get(
            id=request_id, 
            recipient=request.user,
            status='pending'
        )
        
        meeting_request.status = 'approved'
        meeting_request.save()
        
        # Update the associated message
        meeting_request.message.meeting_status = 'approved'
        meeting_request.message.save()
        
        serializer = MeetingRequestSerializer(meeting_request, context={'request': request})
        return Response(serializer.data)
    
    except MeetingRequest.DoesNotExist:
        return Response({'error': 'Meeting request not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_meeting_request(request, request_id):
    """
    Reject a meeting request
    """
    try:
        meeting_request = MeetingRequest.objects.get(
            id=request_id, 
            recipient=request.user,
            status='pending'
        )
        
        meeting_request.status = 'rejected'
        meeting_request.save()
        
        # Update the associated message
        meeting_request.message.meeting_status = 'rejected'
        meeting_request.message.save()
        
        serializer = MeetingRequestSerializer(meeting_request, context={'request': request})
        return Response(serializer.data)
    
    except MeetingRequest.DoesNotExist:
        return Response({'error': 'Meeting request not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_streak(request):
    """
    Get user's streak information
    """
    streak, created = UserStreak.objects.get_or_create(user=request.user)
    serializer = UserStreakSerializer(streak, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def activity_log(request):
    """
    Get user's activity log
    """
    activities = ActivityLog.objects.filter(user=request.user).order_by('-created_at')[:50]
    serializer = ActivityLogSerializer(activities, many=True, context={'request': request})
    return Response(serializer.data)
