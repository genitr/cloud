from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Доступ только для администраторов"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsSuperUser(permissions.BasePermission):
    """Доступ только для суперпользователей"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser