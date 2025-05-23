# E-Commerce Angular Application

A modern, full-featured e-commerce application built with Angular and .NET Core backend. This application provides a complete shopping experience with both customer and admin interfaces.

## Features

### Customer Features
- **Product Browsing**
  - View all products with pagination
  - Search products by name
  - Filter products by category and brand
  - Responsive product cards with images and details

- **Shopping Cart**
  - Add/remove products
  - Update quantities
  - Persistent cart (localStorage + server sync)
  - Real-time total calculation

- **User Authentication**
  - User registration
  - Login/Logout functionality
  - JWT-based authentication
  - Protected routes

- **Order Management**
  - Checkout process
  - Multiple delivery methods
  - Order history
  - Order status tracking

### Admin Features
- **Dashboard**
  - Overview statistics
  - Total orders
  - Revenue tracking
  - Product count
  - User statistics

- **Product Management**
  - Add/Edit/Delete products
  - Manage product categories
  - Manage product brands
  - Image upload functionality

## Technical Stack

### Frontend
- Angular 16+
- TypeScript
- Bootstrap 5
- RxJS
- Angular Router
- HttpClient

### Backend (API)
- .NET Core
- Entity Framework Core
- SQL Server
- JWT Authentication
- RESTful API
- 
### Admin Access
To access the admin dashboard:
- Email: Admin1@gmail.com
- Password: Admin@123
- Navigate to: `/admin/dashboard`

## Project Structure

```
Ecommerce/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin components
│   │   ├── cart/            # Cart functionality
│   │   ├── products/        # Product listing
│   │   ├── services/        # Shared services
│   │   ├── models/          # Interfaces/Types
│   │   └── guards/          # Route guards
│   ├── assets/             # Static files
│   └── environments/       # Environment configs
```

## Key Features Implementation

### Authentication
- JWT-based authentication
- Role-based authorization
- Secure route guards
- Persistent login state

### Shopping Cart
- Real-time updates
- Server synchronization
- Local storage persistence
- Quantity management

### Admin Dashboard
- Secure admin routes
- Statistics overview
- Product management
- Order management

## API Integration

The frontend communicates with a .NET Core backend API:
- Base URL: `http://localhost:5229/api`
- Protected routes using JWT
- RESTful endpoints for all features

## Styling

- Bootstrap 5 for responsive design
- Custom SCSS for enhanced styling
- Bootstrap Icons
- Responsive layout for all screen sizes

## Security Features

- JWT token authentication
- Protected API routes
- Secure admin access
- Input validation
- Error handling

## Future Enhancements

- Payment gateway integration
- Advanced product filtering
- User profile management
- Order tracking system
- Advanced analytics for admin
- Product reviews and ratings
