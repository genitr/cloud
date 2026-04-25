from django.contrib import admin

from .models import Folder, File, FileSharing


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'id', 
        'parent_folder', 
        'owner',
        'updated_at'
    ]
    search_fields = ['name', 'owner']
    list_filter = ['created_at', 'owner']


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'id',
        'folder', 
        'owner', 
        'size', 
        'content_type',
        'downloads_count',
        'views_count',
        'comment',
        'updated_at'
    ]
    search_fields = ['name', 'owner']
    list_filter = [ 'owner', 'content_type', 'size', 'uploaded_at']


@admin.register(FileSharing)
class FileSharingAdmin(admin.ModelAdmin):
    list_display = [
        'file', 
        'created_by',
        'created_at',
    ]
    list_filter = ['created_by',]
