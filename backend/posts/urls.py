from django.urls import path
from . import views

urlpatterns = [
    path('', views.post_list, name='post_list'),
    path('<int:pk>/', views.post_detail, name='post_detail'),
    path('<int:pk>/like/', views.like_post, name='like_post'),
    path('<int:pk>/comments/', views.post_comments, name='post_comments'),
    path('<int:pk>/comments/', views.add_comment, name='add_comment'),
]