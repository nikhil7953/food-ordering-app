from rest_framework.exceptions import PermissionDenied

class CountryFilterMixin:
    """
    Mixin to filter queryset by user's country for managers and members.
    Admins see all data.
    
    Usage: Add this mixin to your ViewSet before other mixins
    Example: class RestaurantViewSet(CountryFilterMixin, viewsets.ModelViewSet):
    """
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated:
            return queryset.none()
        
        # Admin sees everything
        if user.role == 'admin':
            return queryset
        
        # Manager and Member see only their country's data
        if user.role in ['manager', 'member']:
            # Check if the model has a country field
            if hasattr(queryset.model, 'country'):
                return queryset.filter(country=user.country)
            
            # For models that don't have country directly (like MenuItem)
            # Filter through related fields
            model_name = queryset.model.__name__
            
            if model_name == 'MenuItem':
                # Filter menu items by restaurant country
                return queryset.filter(category__restaurant__country=user.country)
            
            elif model_name == 'MenuCategory':
                # Filter categories by restaurant country
                return queryset.filter(restaurant__country=user.country)
            
            elif model_name == 'OrderItem':
                # Filter order items by order country
                return queryset.filter(order__country=user.country)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Automatically set country when creating objects for non-admin users
        """
        user = self.request.user
        
        # If user is not admin and model has country field, set it to user's country
        if user.role in ['manager', 'member'] and hasattr(serializer.Meta.model, 'country'):
            serializer.save(country=user.country)
        else:
            serializer.save()


class RoleBasedAccessMixin:
    """
    Mixin to handle role-based action restrictions
    """
    
    # Define which actions are allowed for which roles
    role_action_permissions = {
        'admin': ['list', 'retrieve', 'create', 'update', 'partial_update', 'destroy'],
        'manager': ['list', 'retrieve', 'create', 'update', 'partial_update'],
        'member': ['list', 'retrieve', 'create'],
    }
    
    def check_action_permission(self):
        """
        Check if the user's role has permission for the current action
        """
        user = self.request.user
        action = self.action
        
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required.")
        
        allowed_actions = self.role_action_permissions.get(user.role, [])
        
        if action not in allowed_actions:
            raise PermissionDenied(
                f"Your role ({user.role}) does not have permission to perform this action."
            )
    
    def dispatch(self, request, *args, **kwargs):
        """
        Override dispatch to check permissions before processing request
        """
        response = super().dispatch(request, *args, **kwargs)
        return response