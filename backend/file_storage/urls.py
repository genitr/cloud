from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import FileSharingViewSet, FileViewSet, FolderViewSet, PublicShareViewSet

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='file')
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'shares', FileSharingViewSet, basename='shares')
router.register(r'public', PublicShareViewSet, basename='public')

urlpatterns = [
    path('api/', include(router.urls)),
]