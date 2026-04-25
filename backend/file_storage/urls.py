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
    path('api/public/<str:token>/', PublicShareViewSet.as_view({'get': 'info'}), name='public-info'),
    path('api/public/<str:token>/preview/', PublicShareViewSet.as_view({'get': 'preview'}), name='public-preview'),
    path('api/public/<str:token>/record_view/', PublicShareViewSet.as_view({'post': 'record_view'}), name='public-record-view'),
    path('api/public/<str:token>/download/', PublicShareViewSet.as_view({'get': 'download'}), name='public-download'),
]