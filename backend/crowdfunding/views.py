from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import CrowdfundingCampaign, Donation

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def campaigns_list(request):
    """
    Get list of crowdfunding campaigns
    """
    campaigns = CrowdfundingCampaign.objects.filter(is_active=True).order_by('-created_at')
    data = []
    for campaign in campaigns:
        data.append({
            'id': campaign.id,
            'title': campaign.title,
            'description': campaign.description,
            'category': campaign.category,
            'target_amount': campaign.target_amount,
            'current_amount': campaign.current_amount,
            'progress_percentage': (campaign.current_amount / campaign.target_amount * 100) if campaign.target_amount > 0 else 0,
            'donor_count': campaign.donations.count(),
            'creator': {
                'id': campaign.creator.id,
                'name': campaign.creator.get_full_name(),
                'user_type': campaign.creator.user_type
            },
            'is_verified': campaign.is_verified,
            'start_date': campaign.start_date,
            'end_date': campaign.end_date,
            'created_at': campaign.created_at
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_campaign(request):
    """
    Create a new crowdfunding campaign
    """
    campaign = CrowdfundingCampaign.objects.create(
        title=request.data.get('title', ''),
        description=request.data.get('description', ''),
        category=request.data.get('category', 'general'),
        target_amount=request.data.get('target_amount', 1000.00),
        start_date=request.data.get('start_date'),
        end_date=request.data.get('end_date'),
        creator=request.user
    )
    
    return Response({
        'id': campaign.id,
        'title': campaign.title,
        'description': campaign.description,
        'category': campaign.category,
        'target_amount': campaign.target_amount,
        'current_amount': campaign.current_amount,
        'creator': {
            'id': campaign.creator.id,
            'name': campaign.creator.get_full_name(),
            'user_type': campaign.creator.user_type
        },
        'is_verified': campaign.is_verified,
        'start_date': campaign.start_date,
        'end_date': campaign.end_date,
        'created_at': campaign.created_at
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def make_donation(request, campaign_id):
    """
    Make a donation to a campaign
    """
    try:
        campaign = CrowdfundingCampaign.objects.get(id=campaign_id)
        
        amount = request.data.get('amount', 0)
        message = request.data.get('message', '')
        is_anonymous = request.data.get('is_anonymous', False)
        
        if amount <= 0:
            return Response({'error': 'Invalid donation amount'}, status=status.HTTP_400_BAD_REQUEST)
        
        donation = Donation.objects.create(
            campaign=campaign,
            donor=request.user,
            amount=amount,
            message=message,
            is_anonymous=is_anonymous
        )
        
        # Update campaign current amount
        campaign.current_amount += amount
        campaign.save()
        
        return Response({
            'id': donation.id,
            'amount': donation.amount,
            'message': donation.message,
            'is_anonymous': donation.is_anonymous,
            'donor': {
                'id': donation.donor.id,
                'name': donation.donor.get_full_name(),
                'user_type': donation.donor.user_type
            } if not is_anonymous else None,
            'campaign': {
                'id': campaign.id,
                'title': campaign.title,
                'current_amount': campaign.current_amount,
                'progress_percentage': (campaign.current_amount / campaign.target_amount * 100) if campaign.target_amount > 0 else 0
            },
            'created_at': donation.created_at
        }, status=status.HTTP_201_CREATED)
    except CrowdfundingCampaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def campaign_donations(request, campaign_id):
    """
    Get donations for a campaign
    """
    try:
        campaign = CrowdfundingCampaign.objects.get(id=campaign_id)
        donations = campaign.donations.all().order_by('-created_at')
        data = []
        for donation in donations:
            data.append({
                'id': donation.id,
                'amount': donation.amount,
                'message': donation.message,
                'is_anonymous': donation.is_anonymous,
                'donor': {
                    'id': donation.donor.id,
                    'name': donation.donor.get_full_name(),
                    'user_type': donation.donor.user_type
                } if not donation.is_anonymous else None,
                'created_at': donation.created_at
            })
        return Response(data)
    except CrowdfundingCampaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)
