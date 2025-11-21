from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API Root - Lists all available endpoints
    """
    return Response({
        'message': 'Welcome to Food Ordering API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'api_root': '/api/',
            
            # Authentication
            'token_obtain': '/api/token/',
            'token_refresh': '/api/token/refresh/',
            'token_verify': '/api/token/verify/',
            
            # Users
            'users': '/api/users/',
            'users_me': '/api/users/me/',
            'users_register': '/api/users/register/',
            'users_login': '/api/users/login/',
            
            # Restaurants
            'restaurants': '/api/restaurants/',
            'menu_categories': '/api/categories/',
            'menu_items': '/api/menu-items/',
            'restaurant_menu': '/api/restaurants/{id}/menu/',
            
            # Orders
            'orders': '/api/orders/',
            'my_orders': '/api/orders/my_orders/',
            'place_order': '/api/orders/{id}/place_order/',
            'cancel_order': '/api/orders/{id}/cancel/',
            'update_order_status': '/api/orders/{id}/update_status/',
            
            # Payments
            'payment_methods': '/api/payment-methods/',
            'my_payment_methods': '/api/payment-methods/my_payment_methods/',
            'set_default_payment': '/api/payment-methods/{id}/set_default/',
        }
    })


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Root
    path('api/', api_root, name='api-root'),
    
    # App URLs
    path('api/', include('users.urls')),
    path('api/', include('restaurants.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('payments.urls')),
    
    # Authentication
    path('api/auth/', include('rest_framework.urls', namespace='rest_framework')),
    
    # JWT Token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)