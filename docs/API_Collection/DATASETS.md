# Datasets Used

This document describes all the sample datasets used in the Food Ordering Application for testing and development purposes.

---

## Table of Contents

- [Test Users](#test-users)
- [Restaurants](#restaurants)
- [Menu Categories](#menu-categories)
- [Menu Items](#menu-items)
- [Payment Methods](#payment-methods)
- [Sample Orders](#sample-orders)
- [How to Populate Data](#how-to-populate-data)

---

## Test Users

The application requires **6 test users** to be created before running the data population script. These users represent different roles and countries for testing RBAC and country-based filtering.

### User Credentials

| Username | Role | Country | Email | Purpose |
|----------|------|---------|-------|---------|
| `nick_fury` | Admin | AMERICA | nick@example.com | Full access, can view all orders |
| `captain_marvel` | Manager | INDIA | marvel@example.com | Manager for Indian restaurants |
| `captain_america` | Manager | AMERICA | america@example.com | Manager for American restaurants |
| `thanos` | Member | INDIA | thanos@example.com | Regular user from India |
| `thor` | Member | INDIA | thor@example.com | Regular user from India |
| `travis` | Member | AMERICA | travis@example.com | Regular user from America |

### Creating Test Users

**Option 1: Via Django Admin**
1. Go to `http://127.0.0.1:8000/admin/`
2. Login with superuser credentials
3. Navigate to **Users** → **Add User**
4. Create each user with the details above

**Option 2: Via Django Shell**
python manage.py shell

from django.contrib.auth import get_user_model
User = get_user_model()

# Create Admin
User.objects.create_user(
    username='nick_fury',
    email='nick@example.com',
    password='your_password',
    role='admin',
    country='AMERICA'
)

# Create Managers
User.objects.create_user(
    username='captain_marvel',
    email='marvel@example.com',
    password='your_password',
    role='manager',
    country='INDIA'
)

User.objects.create_user(
    username='captain_america',
    email='america@example.com',
    password='your_password',
    role='manager',
    country='AMERICA'
)

# Create Members
User.objects.create_user(
    username='thanos',
    email='thanos@example.com',
    password='your_password',
    role='member',
    country='INDIA'
)

User.objects.create_user(
    username='thor',
    email='thor@example.com',
    password='your_password',
    role='member',
    country='INDIA'
)

User.objects.create_user(
    username='travis',
    email='travis@example.com',
    password='your_password',
    role='member',
    country='AMERICA'
)---

## Restaurants

The dataset includes **4 restaurants** - 2 from India and 2 from America.

### Indian Restaurants

| Name | Description | Address | Phone | Email | Owner |
|------|-------------|---------|-------|-------|-------|
| **Taj Mahal Restaurant** | Authentic Indian cuisine with royal taste | 123 MG Road, Mumbai, India | +91-22-12345678 | info@tajmahal.in | captain_marvel |
| **Spice Garden** | South Indian delicacies | 456 Brigade Road, Bangalore, India | +91-80-87654321 | contact@spicegarden.in | captain_marvel |

### American Restaurants

| Name | Description | Address | Phone | Email | Owner |
|------|-------------|---------|-------|-------|-------|
| **Burger Palace** | Classic American burgers and fries | 789 5th Avenue, New York, USA | +1-212-5551234 | info@burgerpalace.com | captain_america |
| **Pizza Heaven** | New York style pizzas | 321 Broadway, New York, USA | +1-212-5555678 | hello@pizzaheaven.com | captain_america |

**Note:** All restaurants are set to `is_active=True` by default.

---

## Menu Categories

The dataset includes **6 menu categories** organized by restaurant:

### Taj Mahal Restaurant
- **Appetizers** (display_order: 1)
- **Main Course** (display_order: 2)

### Spice Garden
- **Breakfast** (display_order: 1)

### Burger Palace
- **Burgers** (display_order: 1)
- **Sides** (display_order: 2)

### Pizza Heaven
- **Pizzas** (display_order: 1)

---

## Menu Items

The dataset includes **10 menu items** across different restaurants and categories.

### Taj Mahal Restaurant

| Item Name | Category | Price | Description | Vegetarian | Preparation Time |
|-----------|----------|-------|-------------|------------|------------------|
| **Samosa** | Appetizers | $5.99 | Crispy pastry filled with spiced potatoes | ✅ Yes | 15 min |
| **Chicken Tikka Masala** | Main Course | $15.99 | Tender chicken in creamy tomato sauce | ❌ No | 30 min |
| **Paneer Butter Masala** | Main Course | $12.99 | Cottage cheese in rich butter gravy | ✅ Yes | 25 min |

### Spice Garden

| Item Name | Category | Price | Description | Vegetarian | Vegan | Preparation Time |
|-----------|----------|-------|-------------|------------|-------|------------------|
| **Masala Dosa** | Breakfast | $8.99 | Crispy rice crepe with potato filling | ✅ Yes | ❌ No | 20 min |
| **Idli Sambar** | Breakfast | $6.99 | Steamed rice cakes with lentil soup | ✅ Yes | ✅ Yes | 15 min |

### Burger Palace

| Item Name | Category | Price | Description | Vegetarian | Preparation Time |
|-----------|----------|-------|-------------|------------|------------------|
| **Classic Cheeseburger** | Burgers | $12.99 | Beef patty with cheese, lettuce, tomato | ❌ No | 15 min |
| **Veggie Burger** | Burgers | $11.99 | Plant-based patty with fresh vegetables | ✅ Yes | 15 min |
| **French Fries** | Sides | $4.99 | Crispy golden fries | ✅ Yes | 10 min |

### Pizza Heaven

| Item Name | Category | Price | Description | Vegetarian | Preparation Time |
|-----------|----------|-------|-------------|------------|------------------|
| **Margherita Pizza** | Pizzas | $14.99 | Classic tomato sauce, mozzarella, basil | ✅ Yes | 20 min |
| **Pepperoni Pizza** | Pizzas | $16.99 | Tomato sauce, mozzarella, pepperoni | ❌ No | 20 min |

**Note:** All menu items are set to `is_available=True` by default.

---

## Payment Methods

The dataset includes **3 payment methods** assigned to different users:

| User | Payment Type | Details | Card Brand | Is Default |
|------|--------------|---------|------------|------------|
| **nick_fury** | CREDIT_CARD | Card ending in 1234 | Visa | ✅ Yes |
| **captain_marvel** | UPI | captain_marvel@upi | - | ✅ Yes |
| **captain_america** | DEBIT_CARD | Card ending in 5678 | Mastercard | ✅ Yes |

---

## Sample Orders

The dataset includes **2 sample orders** to demonstrate order functionality:

### Order 1: Thanos (Member) - India

- **User:** thanos (Member, INDIA)
- **Restaurant:** Taj Mahal Restaurant
- **Status:** DELIVERED
- **Country:** INDIA
- **Total Amount:** $18.98
- **Delivery Address:** Titan Tower, Mumbai, India
- **Items:**
  - 1x Samosa ($5.99)
  - 1x Paneer Butter Masala ($12.99)

### Order 2: Travis (Member) - America

- **User:** travis (Member, AMERICA)
- **Restaurant:** Burger Palace
- **Status:** CONFIRMED
- **Country:** AMERICA
- **Total Amount:** $17.98
- **Delivery Address:** Stark Tower, New York, USA
- **Items:**
  - 1x Classic Cheeseburger ($12.99)
  - 1x French Fries ($4.99)

---

## How to Populate Data

### Prerequisites

1. **Create Test Users First**: The `populate_data` command requires the 6 test users to exist before running. See [Test Users](#test-users) section above.

2. **Run Migrations**: Ensure all database migrations are applied:h
   python manage.py migrate
   ### Populating Sample Data

From the `backend` directory:

# Activate virtual environment
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux

# Populate sample data
python manage.py populate_data
### Clearing and Repopulating

To clear existing data and repopulate from scratch:

python manage.py populate_data --clearThis will:
1. Delete all existing orders, order items, payment methods, menu items, menu categories, and restaurants
2. Recreate all sample data

**Note:** This command does NOT delete users. Users must be created separately.

### Expected Output

After running `populate_data`, you should see:
