from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import MentorshipProgram, MentorshipRequest

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def programs_list(request):
    """
    Get list of mentorship programs
    """
    programs = MentorshipProgram.objects.all().order_by('-created_at')
    data = []
    for program in programs:
        data.append({
            'id': program.id,
            'title': program.title,
            'description': program.description,
            'program_type': program.program_type,
            'duration_weeks': program.duration_weeks,
            'max_mentees': program.max_mentees,
            'current_mentees': program.requests.filter(status='accepted').count(),
            'mentor': {
                'id': program.mentor.id,
                'name': program.mentor.get_full_name(),
                'user_type': program.mentor.user_type
            },
            'is_available': program.is_active and program.requests.filter(status='accepted').count() < program.max_mentees,
            'created_at': program.created_at
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_program(request):
    """
    Create a new mentorship program
    """
    program = MentorshipProgram.objects.create(
        title=request.data.get('title', ''),
        description=request.data.get('description', ''),
        program_type=request.data.get('program_type', 'general'),
        duration_weeks=request.data.get('duration_weeks', 4),
        max_mentees=request.data.get('max_mentees', 5),
        mentor=request.user
    )
    
    return Response({
        'id': program.id,
        'title': program.title,
        'description': program.description,
        'program_type': program.program_type,
        'duration_weeks': program.duration_weeks,
        'max_mentees': program.max_mentees,
        'mentor': {
            'id': program.mentor.id,
            'name': program.mentor.get_full_name(),
            'user_type': program.mentor.user_type
        },
        'created_at': program.created_at
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_request(request):
    """
    Create a mentorship request
    """
    mentor_id = request.data.get('mentor')
    program_type = request.data.get('program_type', 'general')
    message = request.data.get('message', '')
    
    try:
        mentor = User.objects.get(id=mentor_id)
        
        # Check if mentor is available for mentorship
        if mentor.user_type not in ['alumni', 'faculty']:
            return Response({'error': 'User is not available for mentorship'}, status=status.HTTP_400_BAD_REQUEST)
        
        mentorship_request = MentorshipRequest.objects.create(
            requester=request.user,
            recipient=mentor,
            program_type=program_type,
            message=message
        )
        
        return Response({
            'id': mentorship_request.id,
            'requester': {
                'id': mentorship_request.requester.id,
                'name': mentorship_request.requester.get_full_name(),
                'user_type': mentorship_request.requester.user_type
            },
            'recipient': {
                'id': mentorship_request.recipient.id,
                'name': mentorship_request.recipient.get_full_name(),
                'user_type': mentorship_request.recipient.user_type
            },
            'program_type': mentorship_request.program_type,
            'message': mentorship_request.message,
            'status': mentorship_request.status,
            'created_at': mentorship_request.created_at
        }, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response({'error': 'Mentor not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_request(request, request_id):
    """
    Accept a mentorship request
    """
    try:
        mentorship_request = MentorshipRequest.objects.get(
            id=request_id,
            recipient=request.user,
            status='pending'
        )
        
        mentorship_request.status = 'accepted'
        mentorship_request.save()
        
        return Response({
            'message': 'Mentorship request accepted',
            'status': mentorship_request.status
        })
    except MentorshipRequest.DoesNotExist:
        return Response({'error': 'Mentorship request not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_request(request, request_id):
    """
    Reject a mentorship request
    """
    try:
        mentorship_request = MentorshipRequest.objects.get(
            id=request_id,
            recipient=request.user,
            status='pending'
        )
        
        mentorship_request.status = 'rejected'
        mentorship_request.save()
        
        return Response({
            'message': 'Mentorship request rejected',
            'status': mentorship_request.status
        })
    except MentorshipRequest.DoesNotExist:
        return Response({'error': 'Mentorship request not found'}, status=status.HTTP_404_NOT_FOUND)
