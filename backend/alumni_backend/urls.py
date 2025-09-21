"""
Alumni Backend URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    # path('api/alumni/', include('alumni.urls')),
    # path('api/posts/', include('posts.urls')),
    # path('api/events/', include('events.urls')),
    # path('api/mentorship/', include('mentorship.urls')),
    # path('api/crowdfunding/', include('crowdfunding.urls')),
    # path('api/chat/', include('chat.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
