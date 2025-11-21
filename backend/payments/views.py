# payments/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import PaymentMethod
from .serializers import PaymentMethodSerializer
from .permissions import CanUpdatePaymentMethod
from users.permissions import IsAdmin


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing payment methods.
    - All users can CREATE their own payment methods (needed for checkout)
    - Only Admin can UPDATE/DELETE payment methods
    - Users can view their own payment methods
    """
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        Permission logic:
        - CREATE: All authenticated users (for adding payment methods during checkout)
        - UPDATE/PATCH/DELETE: Only Admin
        - VIEW/LIST: All authenticated users (their own only)
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            # Only admin can UPDATE or DELETE payment methods
            permission_classes = [IsAuthenticated, IsAdmin]
        elif self.action == 'create':
            # All authenticated users can CREATE their own payment methods
            permission_classes = [IsAuthenticated]
        else:
            # Anyone can view their own payment methods
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Users can only see their own payment methods.
        Admins can see all payment methods.
        """
        user = self.request.user
        if user.role == 'admin':
            return PaymentMethod.objects.all()
        return PaymentMethod.objects.filter(user=user)

    def perform_create(self, serializer):
        """
        Set the user when creating a payment method.
        Users create payment methods for themselves.
        """
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """
        Only admins can update payment methods.
        This is enforced by get_permissions() but added for clarity.
        """
        serializer.save()

    @action(detail=False, methods=['get'])
    def my_payment_methods(self, request):
        """
        Get current user's payment methods.
        """
        queryset = PaymentMethod.objects.filter(user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """
        Set a payment method as default.
        Users can set their own payment methods as default.
        Admins can set any payment method as default.
        """
        payment_method = self.get_object()

        # Check ownership - users can only modify their own, admins can modify any
        if payment_method.user != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'You can only modify your own payment methods'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Set all other payment methods for this user as non-default
        PaymentMethod.objects.filter(user=payment_method.user).update(is_default=False)

        # Set this one as default
        payment_method.is_default = True
        payment_method.save()

        return Response(
            {'status': 'Payment method set as default'},
            status=status.HTTP_200_OK
        )