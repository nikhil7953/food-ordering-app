# Architecture & Design Document

This document describes the system architecture, design patterns, and technical implementation of the Food Ordering Application.

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Database Schema](#database-schema)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Authentication & Authorization](#authentication--authorization)
- [Data Flow](#data-flow)
- [API Design](#api-design)
- [Security Architecture](#security-architecture)
- [Technology Stack](#technology-stack)

---

## System Overview

The Food Ordering Application is a full-stack web application built with a **Django REST Framework backend** and a **React frontend**. The system implements:

- **Role-Based Access Control (RBAC)**: Three user roles (Admin, Manager, Member) with different permissions
- **Country-Based Filtering**: Automatic data filtering based on user's country
- **JWT Authentication**: Token-based authentication for secure API access
- **RESTful API**: RESTful endpoints for all operations

### High-Level Architecture


┌─────────────────────────────────────────────────────────────┐
│ Client Browser │
│ (React Frontend) │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Pages │ │ Contexts │ │ Services │ │
│ │ (UI) │ │ (State) │ │ (API) │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└───────────────────────────┬──────────────────────────────────┘
│ HTTP/HTTPS
│ JWT Tokens
▼
┌─────────────────────────────────────────────────────────────┐
│ Django REST Framework │
│ (Backend API) │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Views │ │ Serializers │ │ Permissions │ │
│ │ (Logic) │ │ (Data) │ │ (RBAC) │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Models │ │ Mixins │ │ Filters │ │
│ │ (Database) │ │ (Country) │ │ (Search) │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└───────────────────────────┬──────────────────────────────────┘
│ ORM
▼
┌─────────────────────────────────────────────────────────────┐
│ SQLite Database │
│ (Development Database) │
└─────────────────────────────────────────────────────────────┘




---

## Architecture Diagram

### Component Architecture


┌──────────────────────────────────────────────────────────────┐
│ FRONTEND │
├──────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ React Application │ │
│ │ │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│ │ │ Pages │ │ Contexts │ │ Services │ │ │
│ │ │ │ │ │ │ │ │ │
│ │ │ - Login │ │ - Auth │ │ - API │ │ │
│ │ │ - Home │ │ - Cart │ │ - Axios │ │ │
│ │ │ - Cart │ │ │ │ │ │ │
│ │ │ - Orders │ │ │ │ │ │ │
│ │ └──────────┘ └──────────┘ └──────────┘ │ │
│ │ │ │
│ │ ┌──────────────────────────────────────────┐ │ │
│ │ │ Material-UI Components │ │ │
│ │ │ (Buttons, Cards, Forms, Tables, etc.) │ │ │
│ │ └──────────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌──────────────────────────────────────────┐ │ │
│ │ │ React Router │ │ │
│ │ │ (Client-side routing with protected │ │ │
│ │ │ routes) │ │ │
│ │ └──────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
│ │
└───────────────────────────┬─────────────────────────────────┘
│
│ REST API (JSON)
│ JWT Authentication
│
┌─────────────────────────────▼─────────────────────────────────┐
│ BACKEND │
├────────────────────────────────────────────────────────────────┤
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Django REST Framework │ │
│ │ │ │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │
│ │ │ ViewSets │ │Serializers│ │Permissions │ │ │
│ │ │ │ │ │ │ │ │ │
│ │ │ - Users │ │ - User │ │ - IsAdmin │ │ │
│ │ │ - Rest. │ │ - Rest. │ │ - IsManager│ │ │
│ │ │ - Orders │ │ - Order │ │ - CanPlace │ │ │
│ │ │ - Payments│ │ - Payment │ │ - CanCancel│ │ │
│ │ └────────────┘ └────────────┘ └────────────┘ │ │
│ │ │ │
│ │ ┌────────────────────────────────────────────┐ │ │
│ │ │ CountryFilterMixin │ │ │
│ │ │ (Automatic country-based filtering) │ │ │
│ │ └────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌────────────────────────────────────────────┐ │ │
│ │ │ JWT Authentication │ │ │
│ │ │ (Token generation, validation, refresh) │ │ │
│ │ └────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Django ORM │ │
│ │ │ │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │
│ │ │ Models │ │ Migrations │ │ Queries │ │ │
│ │ │ │ │ │ │ │ │ │
│ │ │ - User │ │ - Schema │ │ - Filter │ │ │
│ │ │ - Rest. │ │ - Changes │ │ - Select │ │ │
│ │ │ - Order │ │ │ │ - Join │ │ │
│ │ │ - Payment │ │ │ │ │ │ │
│ │ └────────────┘ └────────────┘ └────────────┘ │ │
│ └──────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────┬─────────────────────────────────┘
│
│ SQL Queries
│
┌──────────────────────────────▼─────────────────────────────────┐
│ SQLite Database │
│ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Users │ │Restaurants│ │ Orders │ │ Payments │ │
│ │ │ │ │ │ │ │ │ │
│ │ - id │ │ - id │ │ - id │ │ - id │ │
│ │ - role │ │ - name │ │ - status │ │ - type │ │
│ │ - country│ │ - country│ │ - total │ │ - user │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│ │
└────────────────────────────────────────────────────────────────┘



---

## Database Schema

### Entity Relationship Diagram




┌─────────────────┐
│ User │
├─────────────────┤
│ id (PK) │
│ username │
│ email │
│ role │◄──┐
│ country │ │
│ phone │ │
└─────────────────┘ │
│ │
│ │
│ 1 │
│ │
│ │
│ │
▼ │
┌─────────────────┐ │
│ Restaurant │ │
├─────────────────┤ │
│ id (PK) │ │
│ name │ │
│ slug │ │
│ description │ │
│ address │ │
│ country │ │
│ owner_id (FK)────┼───┘
│ is_active │
└─────────────────┘
│
│ 1
│
│
▼
┌─────────────────┐
│ MenuCategory │
├─────────────────┤
│ id (PK) │
│ name │
│ restaurant_id(FK)│
│ display_order │
└─────────────────┘
│
│ 1
│
│
▼
┌─────────────────┐
│ MenuItem │
├─────────────────┤
│ id (PK) │
│ name │
│ price │
│ category_id (FK) │
│ is_vegetarian │
│ is_available │
└─────────────────┘
│
│ 1
│
│
▼
┌─────────────────┐
│ OrderItem │
├─────────────────┤
│ id (PK) │
│ order_id (FK) │
│ menu_item_id(FK)│
│ quantity │
│ price │
└─────────────────┘
│
│ N
│
│
▼
┌─────────────────┐ ┌─────────────────┐
│ Order │ │ PaymentMethod │
├─────────────────┤ ├─────────────────┤
│ id (PK) │ │ id (PK) │
│ user_id (FK)────┼──────┤ user_id (FK) │
│ restaurant_id(FK)│ │ payment_type │
│ status │ │ is_default │
│ country │ │ card_last4 │
│ total_amount │ │ upi_id │
│ payment_method_id(FK)──┤ │
│ delivery_address│ └─────────────────┘
└─────────────────┘




### Database Tables

#### 1. Users Table
- **Primary Key**: `id`
- **Fields**: `username`, `email`, `password`, `role`, `country`, `phone`
- **Relationships**: 
  - One-to-Many with `Restaurant` (owner)
  - One-to-Many with `Order`
  - One-to-Many with `PaymentMethod`

#### 2. Restaurants Table
- **Primary Key**: `id`
- **Fields**: `name`, `slug`, `description`, `address`, `country`, `phone_number`, `email`, `logo`, `banner`, `is_active`, `owner_id`
- **Relationships**:
  - Many-to-One with `User` (owner)
  - One-to-Many with `MenuCategory`
  - One-to-Many with `Order`

#### 3. MenuCategory Table
- **Primary Key**: `id`
- **Fields**: `name`, `description`, `restaurant_id`, `is_active`, `display_order`
- **Relationships**:
  - Many-to-One with `Restaurant`
  - One-to-Many with `MenuItem`

#### 4. MenuItem Table
- **Primary Key**: `id`
- **Fields**: `name`, `description`, `price`, `image`, `category_id`, `is_vegetarian`, `is_vegan`, `is_gluten_free`, `is_available`, `preparation_time`
- **Relationships**:
  - Many-to-One with `MenuCategory`
  - One-to-Many with `OrderItem`

#### 5. Orders Table
- **Primary Key**: `id`
- **Fields**: `user_id`, `restaurant_id`, `status`, `country`, `total_amount`, `delivery_address`, `payment_method_id`, `special_instructions`, `created_at`, `updated_at`
- **Relationships**:
  - Many-to-One with `User`
  - Many-to-One with `Restaurant`
  - Many-to-One with `PaymentMethod`
  - One-to-Many with `OrderItem`

#### 6. OrderItem Table
- **Primary Key**: `id`
- **Fields**: `order_id`, `menu_item_id`, `quantity`, `price`, `special_instructions`
- **Relationships**:
  - Many-to-One with `Order`
  - Many-to-One with `MenuItem`

#### 7. PaymentMethods Table
- **Primary Key**: `id`
- **Fields**: `user_id`, `payment_type`, `is_default`, `card_last4`, `card_brand`, `upi_id`, `created_at`, `updated_at`
- **Relationships**:
  - Many-to-One with `User`
  - One-to-Many with `Order`

---

## Backend Architecture

### Django Apps Structure


backend/
├── food_ordering/ # Main Django project
│ ├── settings.py # Configuration
│ ├── urls.py # Root URL routing
│ └── wsgi.py # WSGI application
│
├── users/ # User management app
│ ├── models.py # User model (extends AbstractUser)
│ ├── views.py # User ViewSets
│ ├── serializers.py # User serializers
│ ├── permissions.py # RBAC permissions
│ └── mixins.py # CountryFilterMixin
│
├── restaurants/ # Restaurant & menu app
│ ├── models.py # Restaurant, MenuCategory, MenuItem
│ ├── views.py # Restaurant ViewSets
│ └── serializers.py # Restaurant serializers
│
├── orders/ # Order management app
│ ├── models.py # Order, OrderItem
│ ├── views.py # Order ViewSets
│ └── serializers.py # Order serializers
│
└── payments/ # Payment methods app
├── models.py # PaymentMethod
├── views.py # PaymentMethod ViewSets
└── serializers.py # PaymentMethod serializers




### Key Backend Components

#### 1. Models Layer
- **Purpose**: Define database schema and business logic
- **Location**: `*/models.py`
- **Key Models**: `User`, `Restaurant`, `MenuItem`, `Order`, `PaymentMethod`

#### 2. ViewSets Layer
- **Purpose**: Handle HTTP requests and responses
- **Location**: `*/views.py`
- **Pattern**: Django REST Framework ViewSets
- **Features**: 
  - Automatic CRUD operations
  - Custom actions (`@action` decorator)
  - Permission checks

#### 3. Serializers Layer
- **Purpose**: Convert between Python objects and JSON
- **Location**: `*/serializers.py`
- **Features**:
  - Data validation
  - Nested serialization
  - Read-only fields

#### 4. Permissions Layer
- **Purpose**: Implement RBAC
- **Location**: `users/permissions.py`
- **Key Permissions**:
  - `IsAdmin`: Admin-only access
  - `IsManager`: Manager and Admin access
  - `IsMember`: All authenticated users
  - `CanPlaceOrder`: Admin and Manager only
  - `CanCancelOrder`: Admin and Manager only
  - `CanUpdatePaymentMethod`: Admin only

#### 5. Mixins Layer
- **Purpose**: Reusable functionality
- **Location**: `users/mixins.py`
- **Key Mixin**: `CountryFilterMixin`
  - Automatically filters queryset by user's country
  - Applied to all ViewSets that need country filtering

### Request Flow (Backend)



HTTP Request
│
▼
┌─────────────────┐
│ URL Router │ (urls.py)
│ - Route to app │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ ViewSet │ (views.py)
│ - get_queryset()│
│ - get_permissions()│
└────────┬─────────┘
│
├─────────────────┐
│ │
▼ ▼
┌─────────────────┐ ┌─────────────────┐
│ Permission │ │ CountryFilter │
│ Check │ │ Mixin │
│ (RBAC) │ │ (Filter data) │
└────────┬─────────┘ └────────┬─────────┘
│ │
└──────────┬──────────┘
│
▼
┌─────────────────┐
│ Serializer │ (serializers.py)
│ - Validate │
│ - Transform │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Model │ (models.py)
│ - Save to DB │
│ - Query DB │
└────────┬────────┘
│
▼
┌─────────────────┐
│ Database │
│ (SQLite) │
└─────────────────┘



---

## Frontend Architecture

### React Component Structure


frontend/src/
├── App.js # Main app component with routing
├── components/
│ └── Navbar.js # Navigation bar component
├── contexts/
│ ├── AuthContext.js # Authentication state management
│ └── CartContext.js # Shopping cart state management
├── pages/
│ ├── Login.js # Login page
│ ├── Register.js # Registration page
│ ├── Home.js # Restaurant listing page
│ ├── RestaurantDetail.js # Restaurant menu page
│ ├── Cart.js # Shopping cart page
│ ├── Checkout.js # Checkout page
│ ├── Orders.js # Order history page
│ ├── OrderDetail.js # Order details page
│ └── Profile.js # User profile page
└── services/
└── api.js # API service layer (Axios)



### Frontend Architecture Layers

#### 1. Presentation Layer (Pages)
- **Purpose**: UI components and user interaction
- **Technology**: React functional components with Material-UI
- **Features**:
  - Form handling
  - Data display
  - User interactions

#### 2. State Management Layer (Contexts)
- **Purpose**: Global state management
- **Technology**: React Context API
- **Contexts**:
  - **AuthContext**: User authentication state, login/logout
  - **CartContext**: Shopping cart state, add/remove items

#### 3. Service Layer (API)
- **Purpose**: API communication
- **Technology**: Axios with interceptors
- **Features**:
  - Automatic token injection
  - Token refresh handling
  - Error handling

### Frontend Data Flow


User Action (Click, Form Submit)
│
▼
┌─────────────────┐
│ Page Component │ (pages/.js)
│ - Event Handler│
└────────┬─────────┘
│
├─────────────────┐
│ │
▼ ▼
┌─────────────────┐ ┌─────────────────┐
│ Context │ │ API Service │
│ (State Update) │ │ (HTTP Request) │
│ - AuthContext │ │ - api.js │
│ - CartContext │ │ - Axios │
└────────┬─────────┘ └────────┬─────────┘
│ │
│ │
│ ▼
│ ┌─────────────────┐
│ │ Backend API │
│ │ (Django REST) │
│ └────────┬────────┘
│ │
│ ▼
│ ┌─────────────────┐
│ │ Response │
│ │ (JSON Data) │
│ └────────┬────────┘
│ │
└─────────────────────┘
│
▼
┌─────────────────┐
│ Update UI │
│ (Re-render) │
└─────────────────┘




---

## Authentication & Authorization

### Authentication Flow

┌─────────────┐
│ User │
│ (Browser) │
└──────┬──────┘
│
│ 1. POST /api/token/
│ {username, password}
▼
┌─────────────────┐
│ Django Backend │
│ - Validate │
│ - Generate JWT │
└──────┬──────────┘
│
│ 2. Response
│ {access, refresh}
▼
┌─────────────────┐
│ Frontend │
│ - Store tokens │
│ - localStorage │
└──────┬──────────┘
│
│ 3. Subsequent Requests
│ Header: Authorization: Bearer <token>
▼
┌─────────────────┐
│ Axios │
│ Interceptor │
│ - Add token │
└──────┬──────────┘
│
▼
┌─────────────────┐
│ Backend │
│ - Verify token │
│ - Extract user │
│ - Check RBAC │
└─────────────────┘


### JWT Token Structure

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens
- **Token Payload**: Contains user ID, username, role, country

### Authorization (RBAC) Flow

Request Arrives
│
▼
┌─────────────────┐
│ Extract User │
│ from JWT │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Get User Role │
│ - admin │
│ - manager │
│ - member │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Check │
│ Permission │
│ Class │
└────────┬─────────┘
│
├──────────────┬──────────────┐
│ │ │
▼ ▼ ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Admin │ │ Manager │ │ Member │
│ │ │ │ │ │
│ ✅ All │ │ ✅ Country │ │ ✅ View │
│ ✅ Create │ │ ✅ Place │ │ ❌ Place │
│ ✅ Update │ │ ✅ Cancel │ │ ❌ Cancel │
│ ✅ Delete │ │ ❌ Create │ │ ❌ Create │
└─────────────┘ └─────────────┘ └─────────────┘



---

## Data Flow

### Order Placement Flow


User adds items to cart
│
▼
┌─────────────────┐
│ CartContext │
│ - Add items │
│ - Store in │
│ localStorage │
└────────┬─────────┘
│
▼
User clicks "Checkout"
│
▼
┌─────────────────┐
│ Checkout Page │
│ - Enter address│
│ - Select payment│
└────────┬─────────┘
│
▼
User clicks "Place Order"
│
▼
┌─────────────────┐
│ API Call │
│ POST /orders/ │
│ - Items │
│ - Address │
│ - Payment │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Backend │
│ - Validate │
│ - Check RBAC │
│ - Create Order │
│ - Calculate │
│ Total │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Database │
│ - Save Order │
│ - Save Items │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Response │
│ - Order ID │
│ - Status │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Frontend │
│ - Clear cart │
│ - Show success │
│ - Redirect │
└─────────────────┘


### Country-Based Filtering Flow


User Request
│
▼
┌─────────────────┐
│ ViewSet │
│ get_queryset() │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ CountryFilter │
│ Mixin │
│ - Get user │
│ - Get country │
└────────┬─────────┘
│
├──────────────┐
│ │
▼ ▼
┌─────────────┐ ┌─────────────┐
│ Admin │ │ Manager/ │
│ │ │ Member │
│ ✅ All │ │ ✅ Filter │
│ Data │ │ by Country│
└─────────────┘ └──────┬──────┘
│
▼
┌─────────────────┐
│ Filtered │
│ Queryset │
│ - Restaurants │
│ - Menu Items │
│ - Orders │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Serialize │
│ & Return │
└─────────────────┘



---

## API Design

### RESTful API Principles

- **Resource-Based URLs**: `/api/restaurants/`, `/api/orders/`
- **HTTP Methods**: GET (read), POST (create), PATCH (update), DELETE (remove)
- **Status Codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found)
- **JSON Format**: All requests and responses use JSON

### API Endpoint Structure


/api/
├── token/ # Authentication
│ ├── POST /token/ # Login
│ ├── POST /token/refresh/ # Refresh token
│ └── POST /token/verify/ # Verify token
│
├── users/ # User management
│ ├── POST /register/ # Register
│ ├── GET /me/ # Get profile
│ ├── PATCH /me/ # Update profile
│ └── GET / # List users (Admin)
│
├── restaurants/ # Restaurants
│ ├── GET / # List restaurants
│ ├── GET /{id}/ # Get restaurant
│ └── GET /{id}/menu/ # Get menu
│
├── menu-items/ # Menu items
│ ├── GET / # List items
│ └── GET /{id}/ # Get item
│
├── orders/ # Orders
│ ├── POST / # Create order
│ ├── GET / # List orders (Admin)
│ ├── GET /my_orders/ # User orders
│ ├── GET /{id}/ # Get order
│ ├── POST /{id}/cancel/ # Cancel order
│ └── PATCH /{id}/update_status/ # Update status
│
└── payment-methods/ # Payment methods
├── GET /my_payment_methods/ # User methods
├── POST / # Create method
├── PATCH /{id}/ # Update method
├── DELETE /{id}/ # Delete method
└── POST /{id}/set_default/ # Set default



---

## Security Architecture

### Security Layers

1. **Authentication**: JWT tokens
2. **Authorization**: RBAC permissions
3. **Data Filtering**: Country-based filtering
4. **CORS**: Cross-Origin Resource Sharing configuration
5. **Input Validation**: Serializer validation
6. **SQL Injection Protection**: Django ORM (parameterized queries)

### Security Flow

Request
│
▼
┌─────────────────┐
│ CORS Check │
│ (Allowed │
│ Origins) │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ JWT Validation │
│ (Token exists │
│ & valid) │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ RBAC Check │
│ (Role-based │
│ permissions) │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Country Filter │
│ (Data filtering│
│ by country) │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Input │
│ Validation │
│ (Serializer) │
└────────┬─────────┘
│
▼
┌─────────────────┐
│ Process │
│ Request │
└─────────────────┘


---

## Technology Stack

### Backend
- **Framework**: Django 5.2.8
- **API**: Django REST Framework 3.16.1
- **Authentication**: djangorestframework-simplejwt 5.5.1
- **Database**: SQLite (development)
- **CORS**: django-cors-headers 4.9.0
- **Filtering**: django-filter 25.2
- **Image Processing**: Pillow 12.0.0

### Frontend
- **Library**: React 19.2.0
- **UI Components**: Material-UI 7.3.5
- **Routing**: React Router 7.9.6
- **HTTP Client**: Axios 1.13.2
- **State Management**: React Context API

### Development Tools
- **Backend**: Python 3.11+, Django
- **Frontend**: Node.js 16+, npm
- **Version Control**: Git
- **API Testing**: Postman

---

## Design Patterns Used

1. **MVC Pattern**: Django follows Model-View-Controller
2. **RESTful API**: Resource-based API design
3. **Mixin Pattern**: Reusable functionality (CountryFilterMixin)
4. **Context API**: Global state management in React
5. **Protected Routes**: Route guards for authentication
6. **Interceptor Pattern**: Axios interceptors for token management

---

## Deployment Considerations

### Development
- **Database**: SQLite
- **Server**: Django development server
- **Frontend**: React development server

### Production (Recommended)
- **Database**: PostgreSQL or MySQL
- **Server**: Gunicorn + Nginx
- **Frontend**: Build static files, serve via Nginx
- **Environment Variables**: Use `python-decouple` for secrets
- **HTTPS**: SSL/TLS certificates
- **CORS**: Configure allowed origins properly

---

## Conclusion

This architecture provides:
- ✅ Scalable and maintainable codebase
- ✅ Secure authentication and authorization
- ✅ Efficient data filtering
- ✅ Clear separation of concerns
- ✅ RESTful API design
- ✅ Modern frontend architecture

For more details, refer to:
- [README.md](../README.md) - Setup and usage instructions
- [DATASETS.md](./DATASETS.md) - Sample data documentation
- [API Collection](./API_Collection/) - Postman API collection


