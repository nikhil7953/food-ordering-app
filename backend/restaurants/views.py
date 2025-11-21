# restaurants/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Restaurant, MenuCategory, MenuItem
from .serializers import (
    RestaurantSerializer, 
    MenuCategorySerializer, 
    MenuItemSerializer,
    MenuItemDetailSerializer
)
from users.permissions import IsAdmin, IsManager, IsMember
from users.mixins import CountryFilterMixin


class RestaurantViewSet(CountryFilterMixin, viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing restaurants.
    All roles can view, but filtering by country for managers/members.
    """
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated, IsMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'is_active']
    search_fields = ['name', 'description', 'address']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        """
        Admin can create/update/delete restaurants
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated, IsMember]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def menu(self, request, pk=None):
        """
        Get all menu items for a specific restaurant
        """
        restaurant = self.get_object()
        categories = MenuCategory.objects.filter(
            restaurant=restaurant, 
            is_active=True
        ).prefetch_related('menu_items')
        
        menu_data = []
        for category in categories:
            items = MenuItem.objects.filter(
                category=category,
                is_available=True
            )
            menu_data.append({
                'category': MenuCategorySerializer(category).data,
                'items': MenuItemSerializer(items, many=True).data
            })
        
        return Response(menu_data)


class MenuCategoryViewSet(CountryFilterMixin, viewsets.ModelViewSet):
    """
    API endpoint for managing menu categories.
    """
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['restaurant', 'is_active']
    ordering_fields = ['display_order', 'name']
    ordering = ['display_order']

    def get_permissions(self):
        """
        Admin can manage categories
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


class MenuItemViewSet(CountryFilterMixin, viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing menu items.
    All roles can view, filtered by country.
    """
    queryset = MenuItem.objects.all().select_related('category__restaurant')
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated, IsMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_available', 'is_vegetarian', 'is_vegan', 'is_gluten_free']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        """
        Use detailed serializer for retrieve action
        """
        if self.action == 'retrieve':
            return MenuItemDetailSerializer
        return MenuItemSerializer

    def get_permissions(self):
        """
        Admin can manage menu items
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated, IsMember]
        return [permission() for permission in permission_classes]