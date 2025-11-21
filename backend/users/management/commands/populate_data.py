# users/management/commands/populate_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from restaurants.models import Restaurant, MenuCategory, MenuItem
from orders.models import Order, OrderItem
from payments.models import PaymentMethod
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with sample data for testing (restaurants, menus, orders)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('🚀 Starting data population...'))

        # Clear existing data if flag is set
        if kwargs['clear']:
            self.stdout.write('🗑️  Clearing existing data...')
            OrderItem.objects.all().delete()
            Order.objects.all().delete()
            PaymentMethod.objects.all().delete()
            MenuItem.objects.all().delete()
            MenuCategory.objects.all().delete()
            Restaurant.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Data cleared'))

        # Get existing users
        try:
            nick_fury = User.objects.get(username='nick_fury')
            captain_marvel = User.objects.get(username='captain_marvel')
            captain_america = User.objects.get(username='captain_america')
            thanos = User.objects.get(username='thanos')
            thor = User.objects.get(username='thor')
            travis = User.objects.get(username='travis')
            self.stdout.write(self.style.SUCCESS('✓ Found existing users'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('❌ Required users not found. Please create them first.'))
            return

        # Update nick_fury country if not set
        if not nick_fury.country:
            nick_fury.country = 'AMERICA'
            nick_fury.save()
            self.stdout.write('✓ Updated nick_fury country')

        # Create Restaurants
        self.stdout.write('\n🍽️  Creating restaurants...')

        # India Restaurants
        taj_mahal_restaurant = Restaurant.objects.create(
            name='Taj Mahal Restaurant',
            description='Authentic Indian cuisine with royal taste',
            address='123 MG Road, Mumbai, India',
            country='INDIA',
            phone_number='+91-22-12345678',
            email='info@tajmahal.in',
            is_active=True,
            owner=captain_marvel
        )
        
        spice_garden = Restaurant.objects.create(
            name='Spice Garden',
            description='South Indian delicacies',
            address='456 Brigade Road, Bangalore, India',
            country='INDIA',
            phone_number='+91-80-87654321',
            email='contact@spicegarden.in',
            is_active=True,
            owner=captain_marvel
        )

        # America Restaurants
        burger_palace = Restaurant.objects.create(
            name='Burger Palace',
            description='Classic American burgers and fries',
            address='789 5th Avenue, New York, USA',
            country='AMERICA',
            phone_number='+1-212-5551234',
            email='info@burgerpalace.com',
            is_active=True,
            owner=captain_america
        )
        
        pizza_heaven = Restaurant.objects.create(
            name='Pizza Heaven',
            description='New York style pizzas',
            address='321 Broadway, New York, USA',
            country='AMERICA',
            phone_number='+1-212-5555678',
            email='hello@pizzaheaven.com',
            is_active=True,
            owner=captain_america
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created {Restaurant.objects.count()} restaurants'))

        # Create Menu Categories and Items
        self.stdout.write('\n🍕 Creating menu items...')

        # Taj Mahal Restaurant Menu
        taj_appetizers = MenuCategory.objects.create(
            name='Appetizers',
            restaurant=taj_mahal_restaurant,
            display_order=1
        )
        
        taj_main_course = MenuCategory.objects.create(
            name='Main Course',
            restaurant=taj_mahal_restaurant,
            display_order=2
        )

        MenuItem.objects.create(
            name='Samosa',
            description='Crispy pastry filled with spiced potatoes',
            price=Decimal('5.99'),
            category=taj_appetizers,
            is_vegetarian=True,
            is_available=True,
            preparation_time=15
        )

        MenuItem.objects.create(
            name='Chicken Tikka Masala',
            description='Tender chicken in creamy tomato sauce',
            price=Decimal('15.99'),
            category=taj_main_course,
            is_available=True,
            preparation_time=30
        )

        MenuItem.objects.create(
            name='Paneer Butter Masala',
            description='Cottage cheese in rich butter gravy',
            price=Decimal('12.99'),
            category=taj_main_course,
            is_vegetarian=True,
            is_available=True,
            preparation_time=25
        )

        # Spice Garden Menu
        sg_breakfast = MenuCategory.objects.create(
            name='Breakfast',
            restaurant=spice_garden,
            display_order=1
        )

        MenuItem.objects.create(
            name='Masala Dosa',
            description='Crispy rice crepe with potato filling',
            price=Decimal('8.99'),
            category=sg_breakfast,
            is_vegetarian=True,
            is_available=True,
            preparation_time=20
        )

        MenuItem.objects.create(
            name='Idli Sambar',
            description='Steamed rice cakes with lentil soup',
            price=Decimal('6.99'),
            category=sg_breakfast,
            is_vegetarian=True,
            is_vegan=True,
            is_available=True,
            preparation_time=15
        )

        # Burger Palace Menu
        bp_burgers = MenuCategory.objects.create(
            name='Burgers',
            restaurant=burger_palace,
            display_order=1
        )

        bp_sides = MenuCategory.objects.create(
            name='Sides',
            restaurant=burger_palace,
            display_order=2
        )

        MenuItem.objects.create(
            name='Classic Cheeseburger',
            description='Beef patty with cheese, lettuce, tomato',
            price=Decimal('12.99'),
            category=bp_burgers,
            is_available=True,
            preparation_time=15
        )

        MenuItem.objects.create(
            name='Veggie Burger',
            description='Plant-based patty with fresh vegetables',
            price=Decimal('11.99'),
            category=bp_burgers,
            is_vegetarian=True,
            is_available=True,
            preparation_time=15
        )

        MenuItem.objects.create(
            name='French Fries',
            description='Crispy golden fries',
            price=Decimal('4.99'),
            category=bp_sides,
            is_vegetarian=True,
            is_available=True,
            preparation_time=10
        )

        # Pizza Heaven Menu
        ph_pizzas = MenuCategory.objects.create(
            name='Pizzas',
            restaurant=pizza_heaven,
            display_order=1
        )

        MenuItem.objects.create(
            name='Margherita Pizza',
            description='Classic tomato sauce, mozzarella, basil',
            price=Decimal('14.99'),
            category=ph_pizzas,
            is_vegetarian=True,
            is_available=True,
            preparation_time=20
        )

        MenuItem.objects.create(
            name='Pepperoni Pizza',
            description='Tomato sauce, mozzarella, pepperoni',
            price=Decimal('16.99'),
            category=ph_pizzas,
            is_available=True,
            preparation_time=20
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created {MenuItem.objects.count()} menu items'))

        # Create Payment Methods
        self.stdout.write('\n💳 Creating payment methods...')

        PaymentMethod.objects.create(
            user=nick_fury,
            payment_type='CREDIT_CARD',
            card_last4='1234',
            card_brand='Visa',
            is_default=True
        )

        PaymentMethod.objects.create(
            user=captain_marvel,
            payment_type='UPI',
            upi_id='captain_marvel@upi',
            is_default=True
        )

        PaymentMethod.objects.create(
            user=captain_america,
            payment_type='DEBIT_CARD',
            card_last4='5678',
            card_brand='Mastercard',
            is_default=True
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created {PaymentMethod.objects.count()} payment methods'))

        # Create Sample Orders
        self.stdout.write('\n📦 Creating sample orders...')

        # Order 1: Thanos orders from Taj Mahal (India)
        samosa = MenuItem.objects.get(name='Samosa')
        paneer = MenuItem.objects.get(name='Paneer Butter Masala')
        
        order1 = Order.objects.create(
            user=thanos,
            restaurant=taj_mahal_restaurant,
            status='DELIVERED',
            country='INDIA',
            total_amount=Decimal('18.98'),
            delivery_address='Titan Tower, Mumbai, India'
        )
        
        OrderItem.objects.create(order=order1, menu_item=samosa, quantity=1, price=samosa.price)
        OrderItem.objects.create(order=order1, menu_item=paneer, quantity=1, price=paneer.price)

        # Order 2: Travis orders from Burger Palace (America)
        burger = MenuItem.objects.get(name='Classic Cheeseburger')
        fries = MenuItem.objects.get(name='French Fries')
        
        order2 = Order.objects.create(
            user=travis,
            restaurant=burger_palace,
            status='CONFIRMED',
            country='AMERICA',
            total_amount=Decimal('17.98'),
            delivery_address='Stark Tower, New York, USA'
        )
        
        OrderItem.objects.create(order=order2, menu_item=burger, quantity=1, price=burger.price)
        OrderItem.objects.create(order=order2, menu_item=fries, quantity=1, price=fries.price)

        self.stdout.write(self.style.SUCCESS(f'✓ Created {Order.objects.count()} sample orders'))

        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('✅ DATA POPULATION COMPLETE!'))
        self.stdout.write('='*50)
        self.stdout.write(f'📊 Summary:')
        self.stdout.write(f'   • Users: {User.objects.count()}')
        self.stdout.write(f'   • Restaurants: {Restaurant.objects.count()}')
        self.stdout.write(f'   • Menu Categories: {MenuCategory.objects.count()}')
        self.stdout.write(f'   • Menu Items: {MenuItem.objects.count()}')
        self.stdout.write(f'   • Payment Methods: {PaymentMethod.objects.count()}')
        self.stdout.write(f'   • Orders: {Order.objects.count()}')
        self.stdout.write('\n🎉 Your database is ready for testing!')