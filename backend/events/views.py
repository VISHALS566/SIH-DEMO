from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Event, EventRegistration

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def event_list(request):
    """
    Get list of events
    """
    events = Event.objects.all().order_by('-start_date')
    data = []
    for event in events:
        data.append({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'event_type': event.event_type,
            'location': event.location,
            'start_date': event.start_date,
            'end_date': event.end_date,
            'max_attendees': event.max_attendees,
            'current_attendees': event.registrations.count(),
            'organizer': {
                'id': event.organizer.id,
                'name': event.organizer.get_full_name(),
                'user_type': event.organizer.user_type
            },
            'is_registered': event.registrations.filter(user=request.user).exists(),
            'created_at': event.created_at
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_event(request):
    """
    Create a new event
    """
    event = Event.objects.create(
        title=request.data.get('title', ''),
        description=request.data.get('description', ''),
        event_type=request.data.get('event_type', 'general'),
        location=request.data.get('location', ''),
        start_date=request.data.get('start_date'),
        end_date=request.data.get('end_date'),
        max_attendees=request.data.get('max_attendees', 100),
        organizer=request.user
    )
    
    return Response({
        'id': event.id,
        'title': event.title,
        'description': event.description,
        'event_type': event.event_type,
        'location': event.location,
        'start_date': event.start_date,
        'end_date': event.end_date,
        'max_attendees': event.max_attendees,
        'organizer': {
            'id': event.organizer.id,
            'name': event.organizer.get_full_name(),
            'user_type': event.organizer.user_type
        },
        'created_at': event.created_at
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def register_event(request, event_id):
    """
    Register for an event
    """
    try:
        event = Event.objects.get(id=event_id)
        
        # Check if already registered
        if event.registrations.filter(user=request.user).exists():
            return Response({'error': 'Already registered for this event'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if event is full
        if event.max_attendees and event.registrations.count() >= event.max_attendees:
            return Response({'error': 'Event is full'}, status=status.HTTP_400_BAD_REQUEST)
        
        registration = EventRegistration.objects.create(
            event=event,
            user=request.user
        )
        
        return Response({
            'message': 'Successfully registered for the event',
            'registration_id': registration.id,
            'current_attendees': event.registrations.count()
        }, status=status.HTTP_201_CREATED)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unregister_event(request, event_id):
    """
    Unregister from an event
    """
    try:
        event = Event.objects.get(id=event_id)
        registration = event.registrations.filter(user=request.user).first()
        
        if not registration:
            return Response({'error': 'Not registered for this event'}, status=status.HTTP_400_BAD_REQUEST)
        
        registration.delete()
        
        return Response({
            'message': 'Successfully unregistered from the event',
            'current_attendees': event.registrations.count()
        })
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
