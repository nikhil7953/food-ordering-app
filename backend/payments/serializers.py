# payments/serializers.py
from rest_framework import serializers
from .models import PaymentMethod

class PaymentMethodSerializer(serializers.ModelSerializer):
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'user', 'payment_type', 'payment_type_display', 'is_default',
            'card_last4', 'card_brand', 'upi_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate(self, data):
        payment_type = data.get('payment_type')

        # Validate card details for card payments
        if payment_type in ['CREDIT_CARD', 'DEBIT_CARD']:
            if not data.get('card_last4') or not data.get('card_brand'):
                raise serializers.ValidationError(
                    "card_last4 and card_brand are required for card payments."
                )

        # Validate UPI details
        elif payment_type == 'UPI' and not data.get('upi_id'):
            raise serializers.ValidationError(
                "upi_id is required for UPI payments."
            )

        return data

    def create(self, validated_data):
        # If setting this as default, unset other defaults for this user
        if validated_data.get('is_default', False):
            PaymentMethod.objects.filter(
                user=validated_data['user'],
                is_default=True
            ).update(is_default=False)
        
        return super().create(validated_data)