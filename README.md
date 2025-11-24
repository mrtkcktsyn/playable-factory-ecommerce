# Playable Factory – Ecommerce Case Study

This repository contains a full-stack e-commerce application implemented as a case study for the **Playable Factory – Software Engineer** position.

The project simulates a small but realistic shopping flow with:

- Product browsing, filtering, sorting and search  
- Shopping cart and checkout with stock management  
- Customer authentication and order history  
- A lightweight admin panel for orders, dashboard statistics and product management  

---

## Tech Stack

**Frontend**

- **Next.js** (App Router, TypeScript)
- **React**
- **Tailwind CSS**

**Backend**

- **Node.js** / **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** authentication (access token)
- **bcrypt** for password hashing

---

## Project Structure

```txt
playableEcommerce/
  backend/
    src/
      controllers/
      middleware/
      models/
      routes/
    scripts/
      seedProducts.js
    server.js
    .env (local, not committed)
  frontend/
    src/
      app/
        (pages: products, product detail, cart, profile, admin, etc.)
      context/
      components/
    .env.local (local, not committed)
  README.md
```

- The backend exposes a REST API under `/api`.
- The frontend consumes this API via `NEXT_PUBLIC_API_URL`.

---

## Features

### Customer Side

#### Authentication & Profile

- Register & login with email and password
- Passwords are hashed using bcrypt
- Authenticated user information is stored in localStorage (token + basic user info)
- **Profile** page:
  - Shows basic customer info
  - Shows order history or links to the “My Orders” page

#### Homepage

- Hero section with a simple brand-style layout
- **Category shortcuts** that navigate to filtered product listing
- Featured product sections:
  - Example: “New arrivals” / “Popular picks” based on simple sort logic

#### Product Listing (Category / All Products)

- Products listing page with:
  - Text search (by name / slug)
  - Category filter (mapped to search keywords)
  - Price range filter (min / max)
  - Minimum rating filter (e.g. 3+, 4+)
  - Sorting:
    - Newest
    - Price (low → high / high → low)
    - Rating
  - Pagination (page + limit, backed by the API)

The backend supports these via query parameters such as:

- `search`
- `category` (by ObjectId when needed)
- `minPrice`, `maxPrice`
- `minRating`
- `sort`, `order`
- `page`, `limit`

#### Product Details

- Product detail page (`/products/[slug]`) with:
  - Main product information (name, description, price, rating, stock)
  - Basic specs section
  - Small “reviews/ratings” style block (UI level)
  - **Quantity selector** (± buttons and numeric input)
  - **Add to Cart** button

The page is a server component that fetches the product by `slug` from the backend and passes data to a client component responsible for quantity & cart actions.

#### Shopping Cart

- Global cart state is handled with a React Context
- Cart page shows:
  - Line items (name, quantity, unit price, line total)
  - Ability to increase/decrease quantity or remove an item
  - Summary panel:
    - Subtotal
    - Tax (simple percentage)
    - Shipping (simple flat rate)
    - Grand total

#### Checkout

- Checkout form collects:
  - Shipping address (name, address line, city, country, postal code)
- When submitted:
  - Checkout calls `POST /api/orders/checkout` with cart items + address
  - Order is created in MongoDB
  - Product stock is decreased accordingly
- After successful checkout:
  - Cart is cleared
  - User can see the order in their order history

---

### Admin Side

Admin access is role-based using a `role` field on the user document.

#### Admin Dashboard

- Accessible only for `role: "admin"`
- Shows:
  - Total sales
  - Number of orders
  - Number of customers
  - Recent orders
  - Basic status distribution / trend-like view

This gives a quick overview of the system from an admin perspective.

#### Admin Orders

- Admin orders page:
  - Lists all orders from `/api/orders`
  - Shows:
    - Order id / short hash
    - Customer name and email
    - Total amount
    - Status
    - Created date
  - (Status update API exists in backend and can be extended for more advanced flows)

#### Admin Products

- Admin products page (`/admin/products`) with:
  - List of all products (including inactive and out-of-stock)
  - Fields:
    - Name
    - Slug
    - Price
    - Stock
    - Active / inactive flag
  - Actions:
    - **Update stock** inline (`PATCH /api/products/:id/stock`)
    - **Activate / deactivate** product (`PATCH /api/products/:id/toggle`)

Only active products with stock are visible on the public side; this satisfies the case requirement that customers must not see out-of-stock products.

---

## API Overview (Main Endpoints)

> Base URL (development): `http://localhost:5000/api`

### Auth

- `POST /auth/register`  
  Register a new user.

- `POST /auth/login`  
  Login and receive a JWT token.

### Products

- `GET /products`  
  Public. Supports filtering, sorting, pagination with query params.

- `GET /products/:slug`  
  Public. Get product detail by slug.

- `GET /products/admin`  
  Admin only. Get all products (including inactive / out-of-stock).

- `POST /products`  
  Admin only. Create new product.

- `PUT /products/:id`  
  Admin only. Update product.

- `PATCH /products/:id/stock`  
  Admin only. Update stock.

- `PATCH /products/:id/toggle`  
  Admin only. Toggle product active/inactive.

### Orders

- `POST /orders/checkout`  
  Authenticated users. Create a new order from cart data and shipping address.

- `GET /orders/my`  
  Authenticated users. Get orders of the current user.

- `GET /orders`  
  Admin only. Get all orders.

- `GET /orders/:id`  
  Authenticated (user or admin). Get single order details.

- `PATCH /orders/:id/status`  
  Admin only. Update order status.

---

## Environment Variables

### Backend (`backend/.env`)

Example:

```env
MONGODB_URI=mongodb://localhost:27017/playableecommerce
JWT_SECRET=your_jwt_secret_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Adjust these values according to your local setup.

---

## Database & Seeding

### Product & Category Seed

For a clean and consistent initial dataset, there is a simple seed script:

```bash
cd backend
node scripts/seedProducts.js
```

This script:

- Connects to MongoDB using `MONGODB_URI`
- Clears existing **categories** and **products**
- Inserts a small set of categories (headphones, mouse, keyboard, etc.)
- Inserts several sample products linked to these categories

> This script is intended for local development.

### Users & Orders

Users and orders can be created via the UI or Postman:

- Use `/auth/register` to create:
  - One **admin** user (then set `role: "admin"` manually in DB)
  - One **customer** user
- Create orders by:
  - Logging in as the customer
  - Adding items to the cart
  - Completing the checkout flow  
  or
  - Calling `POST /orders/checkout` from Postman with a valid token and body shape matching the frontend.

---

## Demo Credentials (Suggested)

The database state depends on your local seeding, but the recommended demo accounts are:

- **Customer**
  - Email: `user@customer.com`
  - Password: `user123`

- **Admin**
  - Email: `admin@admin.com`
  - Password: `admin123`s
  - Role: `admin` (set directly in MongoDB for this user)

Update these in your database as needed to match what you plan to share with reviewers.

---

## Running the Application Locally

### Prerequisites

- Node.js (LTS)
- npm or yarn
- MongoDB running locally (or a connection string to a MongoDB instance)

### 1. Backend

```bash
cd backend
npm install
```

Configure `backend/.env` as described above, then:

```bash
npm run dev
```

Backend will start on `http://localhost:5000` by default.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
```

Configure `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Then run:

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`.

---

## Deployment (High-Level Guide)

A simple deployment plan could be:

### Backend

- Host on a Node-friendly environment (e.g. Render, Railway, Heroku-like service, or a VPS)
- Set environment variables:
  - `MONGODB_URI` pointing to a cloud MongoDB (e.g. MongoDB Atlas)
  - `JWT_SECRET` to a secure random string
  - `CLIENT_URL` to your frontend URL
- Run:
  - `npm install`
  - `npm run start` (after building or using a process manager like PM2)

### Frontend

- Deploy Next.js app using:
  - Vercel, Netlify, or any provider that supports Next.js
- Set `NEXT_PUBLIC_API_URL` to your deployed backend API URL
- Build:
  - `npm install`
  - `npm run build`

---

## Implemented vs. Missing / Future Work

### Implemented (Case Requirements)

- Customer auth (login / register)
- Profile & order history
- Homepage with categories + featured sections
- Product listing:
  - Search, filters (category, price, rating), sorting, pagination
- Product detail:
  - Basic specs, pricing, rating, quantity selection, add to cart
- Cart:
  - Line items, quantity updates, price calculations (tax + shipping)
- Checkout:
  - Shipping address form, dummy payment, order creation, stock decrement
- Admin panel:
  - Dashboard with key metrics
  - Order listing for admin
  - Product management (stock + active toggle)
- Responsive layout with Tailwind CSS

### Partial / Not Implemented

- Dedicated customer management page for admin (listing all customers)
- Anonymous (guest) checkout flow
- Advanced order delivery simulation
- Caching layer (e.g. Redis) for heavy read endpoints
- Dockerization

These can be added on top of the current architecture without major structural changes.

---

## Notes

This project is intentionally scoped to demonstrate:

- Ability to design and implement a small full-stack system
- Clean API structure and basic validation
- Integration between Next.js frontend and Express backend
- Practical features that map directly to the case study requirements

The focus is on clarity and completeness of the core flow rather than pixel-perfect design or production-grade hardening (rate limiting, advanced error reporting, etc.).
