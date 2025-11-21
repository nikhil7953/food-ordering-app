# orders/serializers.py
from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import Order, OrderItem
from restaurants.serializers import MenuItemSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'menu_item_price', 'quantity', 'price', 'subtotal', 'special_instructions']
        read_only_fields = ['id', 'subtotal']


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity', 'special_instructions']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_name', 'restaurant', 'restaurant_name', 'status', 'status_display',
            'country', 'total_amount', 'delivery_address', 'payment_method',
            'special_instructions', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'items']


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = ['restaurant', 'country', 'delivery_address', 'payment_method', 'special_instructions', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        # Calculate total FIRST before creating order
        total = Decimal('0.00')
        for item_data in items_data:
            menu_item = item_data['menu_item']
            quantity = item_data.get('quantity', 1)
            price = menu_item.price
            total += price * quantity

        # Create order and items atomically
        with transaction.atomic():
            order = Order.objects.create(
                **validated_data,
                total_amount=total
            )

            # Create order items
            for item_data in items_data:
                OrderItem.objects.create(
                    order=order,
                    menu_item=item_data['menu_item'],
                    quantity=item_data.get('quantity', 1),
                    price=item_data['menu_item'].price,
                    special_instructions=item_data.get('special_instructions', '')
                )

        return order


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']
