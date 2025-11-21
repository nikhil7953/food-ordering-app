# orders/views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer
from users.permissions import CanPlaceOrder, CanCancelOrder
from users.mixins import CountryFilterMixin


class OrderViewSet(CountryFilterMixin, viewsets.ModelViewSet):
    """
    API endpoint for managing orders.
    """
    queryset = Order.objects.all().select_related('user', 'restaurant', 'payment_method').prefetch_related('items')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['status', 'restaurant', 'country']
    search_fields = ['user__username', 'restaurant__name']
    ordering_fields = ['created_at', 'updated_at', 'total_amount']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """
        Use different serializers for different actions
        """
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action == 'update_status':
            return OrderStatusUpdateSerializer
        return OrderSerializer

    def get_permissions(self):
        """
        Different permissions for different actions
        """
        if self.action == 'create':
            # Only Admin and Manager can create orders (place/checkout)
            permission_classes = [IsAuthenticated, CanPlaceOrder]
        elif self.action in ['place_order', 'cancel']:
            permission_classes = [IsAuthenticated, CanPlaceOrder]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Set the user and country when creating an order
        """
        serializer.save(
            user=self.request.user,
            country=self.request.user.country
        )

    @action(detail=True, methods=['post'])
    def place_order(self, request, pk=None):
        """
        Place/checkout an order (Admin and Manager only)
        """
        order = self.get_object()
        
        if order.user != request.user and request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'You can only place your own orders'},
                status=status.HTTP_403_FORBIDDEN
            )

        if order.status != 'PENDING':
            return Response(
                {'error': 'Order has already been placed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'CONFIRMED'
        order.save()

        return Response(
            {'status': 'Order placed successfully', 'order': OrderSerializer(order).data},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanCancelOrder])
    def cancel(self, request, pk=None):
        """
        Cancel an order (Admin and Manager only)
        """
        order = self.get_object()

        if order.status == 'CANCELLED':
            return Response(
                {'error': 'Order is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.status == 'DELIVERED':
            return Response(
                {'error': 'Cannot cancel a delivered order'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'CANCELLED'
        order.save()

        return Response(
            {'status': 'Order cancelled successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Update order status (Admin and Manager only)
        """
        order = self.get_object()
        serializer = self.get_serializer(order, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {'status': 'Order status updated successfully', 'order': OrderSerializer(order).data},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """
        Get current user's orders
        """
        queryset = self.get_queryset().filter(user=request.user)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)