from django.contrib import admin
from .models import Restaurant, MenuItem

print("=" * 50)
print("RESTAURANTS ADMIN.PY IS LOADING!")
print("=" * 50)

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'address']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_available']
    list_filter = ['category', 'is_available', 'is_vegetarian']
    search_fields = ['name']

