# restaurants/serializers.py
from rest_framework import serializers
from .models import Restaurant, MenuCategory, MenuItem

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'slug', 'description', 'address', 'country', 'phone_number',
                 'email', 'logo', 'banner', 'is_active', 'owner', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

class MenuCategorySerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'restaurant', 'restaurant_name', 'is_active', 'display_order']
        read_only_fields = ['id']

class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    restaurant_name = serializers.CharField(source='category.restaurant.name', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'is_vegetarian',
                 'is_vegan', 'is_gluten_free', 'is_available', 'category', 'category_name',
                 'restaurant_name', 'preparation_time', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class MenuItemDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with nested category and restaurant info"""
    category = MenuCategorySerializer(read_only=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'is_vegetarian',
                 'is_vegan', 'is_gluten_free', 'is_available', 'category',
                 'preparation_time', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']