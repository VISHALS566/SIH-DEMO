from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Post, Comment, Like

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def post_list(request):
    """
    Get list of posts
    """
    posts = Post.objects.all().order_by('-created_at')
    data = []
    for post in posts:
        data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'post_type': post.post_type,
            'author': {
                'id': post.author.id,
                'name': post.author.get_full_name(),
                'user_type': post.author.user_type
            },
            'likes_count': post.likes.count(),
            'comments_count': post.comments.count(),
            'created_at': post.created_at,
            'is_liked': post.likes.filter(user=request.user).exists()
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def post_detail(request, pk):
    """
    Get details of a specific post
    """
    try:
        post = Post.objects.get(id=pk)
        data = {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'post_type': post.post_type,
            'author': {
                'id': post.author.id,
                'name': post.author.get_full_name(),
                'user_type': post.author.user_type
            },
            'likes_count': post.likes.count(),
            'comments_count': post.comments.count(),
            'created_at': post.created_at,
            'is_liked': post.likes.filter(user=request.user).exists()
        }
        return Response(data)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_post(request):
    """
    Create a new post
    """
    data = request.data.copy()
    data['author'] = request.user.id
    
    post = Post.objects.create(
        title=data.get('title', ''),
        content=data.get('content', ''),
        post_type=data.get('post_type', 'general'),
        author=request.user
    )
    
    return Response({
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'post_type': post.post_type,
        'author': {
            'id': post.author.id,
            'name': post.author.get_full_name(),
            'user_type': post.author.user_type
        },
        'created_at': post.created_at
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def like_post(request, post_id):
    """
    Like or unlike a post
    """
    try:
        post = Post.objects.get(id=post_id)
        like, created = Like.objects.get_or_create(
            user=request.user,
            content_type='post',
            object_id=post.id
        )
        
        if not created:
            like.delete()
            message = 'Post unliked'
        else:
            message = 'Post liked'
        
        return Response({
            'message': message,
            'likes_count': post.likes.count(),
            'is_liked': post.likes.filter(user=request.user).exists()
        })
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def post_comments(request, post_id):
    """
    Get comments for a post
    """
    try:
        post = Post.objects.get(id=post_id)
        comments = post.comments.all().order_by('created_at')
        data = []
        for comment in comments:
            data.append({
                'id': comment.id,
                'content': comment.content,
                'author': {
                    'id': comment.author.id,
                    'name': comment.author.get_full_name(),
                    'user_type': comment.author.user_type
                },
                'created_at': comment.created_at
            })
        return Response(data)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_comment(request, post_id):
    """
    Add a comment to a post
    """
    try:
        post = Post.objects.get(id=post_id)
        comment = Comment.objects.create(
            post=post,
            author=request.user,
            content=request.data.get('content', '')
        )
        
        return Response({
            'id': comment.id,
            'content': comment.content,
            'author': {
                'id': comment.author.id,
                'name': comment.author.get_full_name(),
                'user_type': comment.author.user_type
            },
            'created_at': comment.created_at
        }, status=status.HTTP_201_CREATED)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
