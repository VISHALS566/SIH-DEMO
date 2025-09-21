from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import AlumniSpotlight, Club

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def spotlight_list(request):
    """
    Get list of alumni spotlights
    """
    spotlights = AlumniSpotlight.objects.filter(is_featured=True).order_by('-created_at')
    data = []
    for spotlight in spotlights:
        data.append({
            'id': spotlight.id,
            'title': spotlight.title,
            'description': spotlight.description,
            'alumni_name': spotlight.alumni.get_full_name(),
            'alumni_position': spotlight.alumni.current_position,
            'alumni_company': spotlight.alumni.company,
            'image_url': spotlight.image.url if spotlight.image else None,
            'created_at': spotlight.created_at
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def spotlight_detail(request, pk):
    """
    Get details of a specific alumni spotlight
    """
    try:
        spotlight = AlumniSpotlight.objects.get(id=pk)
        data = {
            'id': spotlight.id,
            'title': spotlight.title,
            'description': spotlight.description,
            'alumni': {
                'id': spotlight.alumni.id,
                'name': spotlight.alumni.get_full_name(),
                'position': spotlight.alumni.current_position,
                'company': spotlight.alumni.company,
                'user_type': spotlight.alumni.user_type
            },
            'image_url': spotlight.image.url if spotlight.image else None,
            'video_url': spotlight.video_url,
            'status': spotlight.status,
            'is_featured': spotlight.is_featured,
            'published_at': spotlight.published_at,
            'created_at': spotlight.created_at
        }
        return Response(data)
    except AlumniSpotlight.DoesNotExist:
        return Response({'error': 'Spotlight not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def clubs_list(request):
    """
    Get list of alumni clubs
    """
    clubs = Club.objects.all().order_by('name')
    data = []
    for club in clubs:
        data.append({
            'id': club.id,
            'name': club.name,
            'description': club.description,
            'category': club.category,
            'member_count': club.members.count(),
            'is_member': request.user in club.members.all(),
            'created_at': club.created_at
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def club_detail(request, pk):
    """
    Get details of a specific club
    """
    try:
        club = Club.objects.get(id=pk)
        data = {
            'id': club.id,
            'name': club.name,
            'description': club.description,
            'category': club.category,
            'president': {
                'id': club.president.id,
                'name': club.president.get_full_name(),
                'user_type': club.president.user_type
            },
            'member_count': club.members.count(),
            'members': [
                {
                    'id': member.id,
                    'name': member.get_full_name(),
                    'user_type': member.user_type
                }
                for member in club.members.all()[:10]  # Limit to first 10 members
            ],
            'status': club.status,
            'logo_url': club.logo.url if club.logo else None,
            'website_url': club.website_url,
            'social_media_links': club.social_media_links,
            'is_member': request.user in club.members.all(),
            'created_at': club.created_at
        }
        return Response(data)
    except Club.DoesNotExist:
        return Response({'error': 'Club not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_club(request, pk):
    """
    Join an alumni club
    """
    try:
        club = Club.objects.get(id=pk)
        club.members.add(request.user)
        return Response({'message': 'Successfully joined the club'}, status=status.HTTP_200_OK)
    except Club.DoesNotExist:
        return Response({'error': 'Club not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_club(request, pk):
    """
    Leave an alumni club
    """
    try:
        club = Club.objects.get(id=pk)
        club.members.remove(request.user)
        return Response({'message': 'Successfully left the club'}, status=status.HTTP_200_OK)
    except Club.DoesNotExist:
        return Response({'error': 'Club not found'}, status=status.HTTP_404_NOT_FOUND)