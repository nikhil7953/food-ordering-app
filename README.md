# Food Ordering Application

A full-stack web-based food ordering application with role-based access control (RBAC) and country-based data filtering. Built with Django REST Framework and React.

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+ and npm
- Git

### Local Setup

1. **Clone the repository:**ash
   git clone https://github.com/nikhil7953/food-ordering-app.git
   cd food-ordering-app
   2. **Backend Setup:**
 
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or source venv/bin/activate  # Mac/Linux
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py populate_data
   3. **Frontend Setup:**
   cd frontend
   npm install
   4. **Run the application:**
   
   # Terminal 1 - Backend (from backend directory)
   python manage.py runserver
   
   # Terminal 2 - Frontend (from frontend directory)
   npm start
   5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://127.0.0.1:8000/api
   - Django Admin: http://127.0.0.1:8000/admin

**Test Users:** See [Test Users](#test-users) section for login credentials.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Populating Sample Data](#populating-sample-data)
- [Test Users](#test-users)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Country-Based Filtering](#country-based-filtering)
- [Architecture](#architecture)
- [Testing](#testing)

---

## Features

- **Restaurant & Menu Management**
  - View restaurants and menu items
  - Browse restaurants by country
  - View detailed restaurant information and menus

- **Order Management**
  - Create orders and add food items to cart
  - Checkout and place orders
  - View order history
  - Track order status (Pending → Confirmed → Preparing → Out for Delivery → Delivered)
  - Cancel orders (based on role permissions)

- **Payment Methods**
  - Add payment methods (Credit/Debit Card, UPI, Net Banking, Wallet, Cash on Delivery)
  - Set default payment method
  - Manage payment methods

- **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (Admin, Manager, Member)
  - Country-based data filtering

---

## Tech Stack

### Backend

- **Python 3.11+**
- **Django 5.2.8** - Web framework
- **Django REST Framework 3.16.1** - REST API
- **djangorestframework-simplejwt 5.5.1** - JWT authentication
- **django-cors-headers 4.9.0** - CORS handling
- **django-filter 25.2** - Filtering support
- **Pillow 12.0.0** - Image processing
- **SQLite** - Database (development)

### Frontend

- **React 19.2.0** - UI library
- **Material-UI (MUI) 7.3.5** - Component library
- **React Router 7.9.6** - Routing
- **Axios 1.13.2** - HTTP client

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** and **npm** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/downloads))

---

## Installation

### 1. Clone the Repository

git clone https://github.com/nikhil7953/food-ordering-app.git
cd food-ordering-app### 2. Backend Setup
h
# Navigate to backend directory
cd backend

# Create virtual environment (Windows)
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Mac/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional, for Django admin)
python manage.py createsuperuser### 3. Frontend Setup

# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
---

## Running the Application

### Start Backend Server

# From backend directory
cd backend

# Activate virtual environment (if not already activated)
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux

# Run Django development server
python manage.py runserverBackend will be available at: **http://127.0.0.1:8000**

### Start Frontend Server

# From frontend directory
cd frontend

# Start React development server
npm startFrontend will be available at: **http://localhost:3000**

---

## Populating Sample Data

To populate the database with sample restaurants, menu items, and orders:

# From backend directory
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux

# Populate sample data
python manage.py populate_data

# To clear existing data and repopulate
python manage.py populate_data --clearThis will create:
- 4 Restaurants (2 in India, 2 in America)
- 6 Menu Categories
- 10 Menu Items
- 3 Payment Methods
- 2 Sample Orders

**Note:** Make sure you have created the test users first (see [Test Users](#test-users) section).

---

## Test Users

The application requires the following test users to be created. You can create them via Django admin or using Django shell:

### Create Users via Django Admin

1. Go to **http://127.0.0.1:8000/admin/**
2. Login with superuser credentials
3. Navigate to **Users** → **Add User**
4. Create the following users:

| Username | Role | Country | Password |
|----------|------|---------|----------|
| `nick_fury` | Admin | America | (set your own) |
| `captain_marvel` | Manager | India | (set your own) |
| `captain_america` | Manager | America | (set your own) |
| `thanos` | Member | India | (set your own) |
| `thor` | Member | India | (set your own) |
| `travis` | Member | America | (set your own) |

### Create Users via Django Shell
thon
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

## Project Structure
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or source venv/bin/activate  # Mac/Linux
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py populate_dataegister/` - Register new user
- `GET /api/users/me/` - Get current user profile
- `PATCH /api/users/me/` - Update current user profile
- `GET /api/users/` - List all users (Admin only)
- `GET /api/users/{id}/` - Get user details (Admin only)

### Restaurants
- `GET /api/restaurants/` - List restaurants (filtered by country)
- `GET /api/restaurants/{id}/` - Get restaurant details
- `GET /api/restaurants/{id}/menu/` - Get restaurant menu

### Menu Items
- `GET /api/menu-items/` - List menu items (filtered by country)
- `GET /api/menu-items/{id}/` - Get menu item details

### Orders
- `POST /api/orders/` - Create order (Admin/Manager only)
- `GET /api/orders/` - List all orders (Admin only)
- `GET /api/orders/my_orders/` - Get current user's orders
- `GET /api/orders/{id}/` - Get order details
- `POST /api/orders/{id}/cancel/` - Cancel order (Admin/Manager only)
- `PATCH /api/orders/{id}/update_status/` - Update order status

### Payment Methods
- `GET /api/payment-methods/my_payment_methods/` - Get user's payment methods
- `POST /api/payment-methods/` - Create payment method
- `PATCH /api/payment-methods/{id}/` - Update payment method (Admin only)
- `DELETE /api/payment-methods/{id}/` - Delete payment method (Admin only)
- `POST /api/payment-methods/{id}/set_default/` - Set default payment method

**Note:** For detailed API documentation with example requests, see the Postman collection in `docs/API_Collection/Food_Ordering_API.postman_collection.json`.

---

## Role-Based Access Control (RBAC)

### Admin Role
- ✅ Full access to all resources
- ✅ Can view all orders from all users
- ✅ Can create/update/delete restaurants, menu items, payment methods
- ✅ Can cancel any order
- ✅ Can update order status
- ✅ Can place orders

### Manager Role
- ✅ Can view restaurants and menu items from their country
- ✅ Can place orders
- ✅ Can view and cancel orders from their country
- ✅ Can view their own payment methods
- ❌ Cannot create/update/delete restaurants or menu items
- ❌ Cannot update payment methods (except their own)

### Member Role
- ✅ Can view restaurants and menu items from their country
- ✅ Can view their own orders
- ✅ Can view their own payment methods
- ❌ Cannot place orders
- ❌ Cannot cancel orders
- ❌ Cannot create/update/delete restaurants or menu items

---

## Country-Based Filtering

The application automatically filters data based on the user's country:

- **Restaurants**: Users only see restaurants from their country
- **Menu Items**: Users only see menu items from restaurants in their country
- **Orders**: 
  - Admins see all orders
  - Managers see orders from their country
  - Members see only their own orders

This filtering is implemented using the `CountryFilterMixin` in the backend, which automatically applies country-based filtering to all ViewSets that inherit from it.

---

## Architecture

### Backend Architecture
- **Django REST Framework**: RESTful API design with ViewSets
- **JWT Authentication**: Token-based authentication using `djangorestframework-simplejwt`
- **Custom Permissions**: Role-based access control via custom permission classes
- **Country Filtering Mixin**: Automatic country-based data filtering
- **SQLite Database**: Development database (can be switched to PostgreSQL for production)

### Frontend Architecture
- **React**: Component-based UI with functional components and hooks
- **Context API**: Global state management for Authentication and Shopping Cart
- **React Router**: Client-side routing with protected routes
- **Material-UI**: UI component library for consistent design
- **Axios**: HTTP client with interceptors for automatic token management

### Data Flow
1. User logs in → Receives JWT access and refresh tokens
2. Frontend stores tokens in localStorage
3. Axios interceptors automatically add tokens to API requests
4. Backend validates tokens and applies RBAC permissions
5. Backend filters data based on user's country using `CountryFilterMixin`
6. Response sent back to frontend with filtered data

---

## Testing

### Manual Testing Steps

1. **Test Authentication**:
   - Register a new user
   - Login and verify JWT tokens are received
   - Test token refresh functionality

2. **Test RBAC**:
   - Login as Admin → Verify full access to all resources
   - Login as Manager → Verify country-based filtering works
   - Login as Member → Verify restricted access (cannot place orders)

3. **Test Order Flow**:
   - Add items to cart
   - Proceed to checkout
   - Place order (Admin/Manager only)
   - View order history
   - Cancel order (if permitted by role)

4. **Test Country Filtering**:
   - Login as user from India → See only Indian restaurants
   - Login as user from America → See only American restaurants

### API Testing
Use the provided Postman collection:
1. Import `docs/API_Collection/Food_Ordering_API.postman_collection.json` into Postman
2. Set up environment variables:
   - `base_url`: `http://localhost:8000/api`
   - `access_token`: (will be populated after login)
   - `refresh_token`: (will be populated after login)
3. Test all endpoints with different user roles

---

## Troubleshooting

### Backend Issues
- **Port 8000 already in use**: Change port with `python manage.py runserver 8001`
- **Migration errors**: Run `python manage.py migrate`
- **Module not found**: Ensure virtual environment is activated
- **Database errors**: Run `python manage.py populate_data --clear` to reset data

### Frontend Issues
- **Port 3000 already in use**: React will prompt to use another port
- **CORS errors**: Ensure `django-cors-headers` is installed and `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`
- **API connection failed**: Verify backend is running on `http://localhost:8000`
- **Token errors**: Clear localStorage and login again

---

## Additional Resources

- **Postman Collection**: `docs/API_Collection/Food_Ordering_API.postman_collection.json`
- **Django Admin**: `http://127.0.0.1:8000/admin/`
- **API Root**: `http://127.0.0.1:8000/api/`


   cd frontend
   npm install-m "docs: Add Quick Start section and fix formatting"
git push origin main