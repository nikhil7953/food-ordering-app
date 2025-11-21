from django.contrib import admin
from .models import PaymentMethod

print("=" * 50)
print(" PAYMENTS ADMIN.PY IS LOADING!")
print("=" * 50)

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['user', 'payment_type', 'is_default', 'created_at']
    list_filter = ['payment_type', 'is_default']
    search_fields = ['user__username']

