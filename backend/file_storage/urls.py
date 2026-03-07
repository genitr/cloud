from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import FileSharingViewSet, FileViewSet, PublicShareView, FolderViewSet

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='file')
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'shares', FileSharingViewSet, basename='share')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/share/<uuid:token>/', PublicShareView.as_view(), name='public-share'),
    path('api/share/<uuid:token>/download/', PublicShareView.as_view(), {'download': True}, name='public-download'),
]