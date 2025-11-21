# payments/permissions.py
from rest_framework import permissions

class CanUpdatePaymentMethod(permissions.BasePermission):
    """
    Custom permission to only allow owners of a payment method to update/delete it,
    or allow admin users to perform any action.
    """
    
    def has_permission(self, request, view):
        """
        Allow authenticated users to create payment methods.
        """
        # Anyone authenticated can create their own payment method
        if view.action == 'create':
            return request.user and request.user.is_authenticated
        
        # For other actions, allow by default (will be checked in has_object_permission)
        return True
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the owner of the payment method
        # or admin users.
        return obj.user == request.user or request.user.role == 'admin'  # Fixed: lowercase 'admin'
