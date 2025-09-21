from django.urls import path
from . import views

urlpatterns = [
    path('', views.event_list, name='event_list'),
    path('<int:pk>/register/', views.register_event, name='register_event'),
    path('<int:pk>/unregister/', views.unregister_event, name='unregister_event'),
]