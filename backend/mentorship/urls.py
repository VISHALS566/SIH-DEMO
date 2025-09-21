from django.urls import path
from . import views

urlpatterns = [
    path('programs/', views.programs_list, name='programs_list'),
    path('requests/', views.create_request, name='create_request'),
    path('requests/<int:pk>/accept/', views.accept_request, name='accept_request'),
    path('requests/<int:pk>/reject/', views.reject_request, name='reject_request'),
]