from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission check for Admin role only
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsManager(permissions.BasePermission):
    """
    Permission check for Admin and Manager roles
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'manager']


class IsMember(permissions.BasePermission):
    """
    Permission check for all authenticated users (Admin, Manager, Member)
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'manager', 'member']


class CanPlaceOrder(permissions.BasePermission):
    """
    Only Admin and Manager can place/checkout orders
    Members CANNOT create or place orders
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Allow all roles to view orders (GET, LIST)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only admin and manager can create/place orders (POST)
        # Members are NOT allowed to place orders per challenge requirements
        return request.user.role in ['admin', 'manager']


class CanCancelOrder(permissions.BasePermission):
    """
    Only Admin and Manager can cancel orders
    Members CANNOT cancel orders
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # For cancel action, only admin and manager
        if view.action == 'cancel':
            return request.user.role in ['admin', 'manager']
        
        # For other actions, allow (will be checked elsewhere)
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Object-level permission for canceling specific orders
        """
        if not request.user.is_authenticated:
            return False
            
        # Admins can cancel any order
        if request.user.role == 'admin':
            return True
            
        # Managers can cancel orders from their country only
        if request.user.role == 'manager':
            return obj.country == request.user.country and obj.status not in ['DELIVERED', 'CANCELLED']
            
        # Members CANNOT cancel orders (per challenge requirements)
        return False


class CanUpdatePaymentMethod(permissions.BasePermission):
    """
    Only Admin can create/update/delete payment methods
    All users can view their own payment methods
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only admin can create, update, or delete payment methods
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return request.user.role == 'admin'
        
        # All authenticated users can view their own payment methods (GET)
        return True


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object or admins to access it
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.role == 'admin':
            return True
        
        # Check if object has a user field and if it matches the request user
        return hasattr(obj, 'user') and obj.user == request.user