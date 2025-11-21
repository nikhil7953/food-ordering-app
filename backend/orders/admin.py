from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['menu_item_name', 'price', 'subtotal']
    fields = ['menu_item_name', 'quantity', 'price', 'subtotal', 'special_instructions']
    
    def menu_item_name(self, obj):
        return obj.menu_item.name
    menu_item_name.short_description = 'Menu Item'
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'restaurant', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'country', 'created_at']
    search_fields = ['user__username', 'restaurant__name']
    inlines = [OrderItemInline]