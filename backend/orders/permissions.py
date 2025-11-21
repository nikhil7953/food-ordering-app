from rest_framework import permissions


class CanPlaceOrder(permissions.BasePermission):
    """
    Permission to check if the user can place an order.
    Only authenticated users with role admin or manager can place orders.
    Members CANNOT place orders.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'manager']


class CanCancelOrder(permissions.BasePermission):
    """
    Permission to check if the user can cancel an order.
    Only Admins and Managers can cancel orders.
    Members CANNOT cancel orders (per challenge requirements).
    """
    def has_permission(self, request, view):
        """
        Check if user has permission to cancel orders at all.
        Only admin and manager can cancel - Members are NOT allowed.
        """
        if not request.user.is_authenticated:
            return False
        
        # Only admin and manager can cancel orders
        # Members are explicitly NOT allowed per challenge requirements
        return request.user.role in ['admin', 'manager']
    
    def has_object_permission(self, request, view, obj):
        """
        Object-level permission for canceling specific orders.
        """
        if not request.user.is_authenticated:
            return False
            
        # Admins can cancel any order
        if request.user.role == 'admin':
            return True
            
        # Managers can cancel orders from their country only
        if request.user.role == 'manager':
            return obj.country == request.user.country and obj.status not in ['DELIVERED', 'CANCELLED']
            
        # Members CANNOT cancel orders at all
        # This line removed: return obj.user == request.user and obj.status not in ['DELIVERED', 'CANCELLED']
        return False


class CanViewOrder(permissions.BasePermission):
    """
    Permission to check if the user can view an order.
    Users can view their own orders.
    Admins can view all orders.
    Managers can view orders from their country.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
            
        # Admins can view all orders
        if request.user.role == 'admin':
            return True
            
        # Managers can view orders from their country
        if request.user.role == 'manager':
            return obj.country == request.user.country
            
        # Members can view only their own orders
        return obj.user == request.user