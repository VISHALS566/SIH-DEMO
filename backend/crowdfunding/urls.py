from django.urls import path
from . import views

urlpatterns = [
    path('campaigns/', views.campaigns_list, name='campaigns_list'),
    path('campaigns/<int:pk>/donate/', views.make_donation, name='make_donation'),
    path('campaigns/<int:pk>/donations/', views.campaign_donations, name='campaign_donations'),
]