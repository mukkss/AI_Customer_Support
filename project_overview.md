# SkyScale E-Commerce - Project Overview

## 1. Executive Summary
SkyScale is a full-stack e-commerce application featuring a React frontend and an Express/Node.js backend. It supports public browsing, secure customer authentication (JWT), product browsing, cart management, ordering, and a real-time AI support chat widget.

---

## 2. User Journey & Features

### A. Public Access (The "Outside")
*   **Home Page**: The landing page at `/`. Publicly accessible. Welcomes users and encourages login/registration.
    *   *Redirects logged-in users to `/products`.*
*   **Authentication**:
    *   **Login**: `/login`. Users enter credentials. On success, a secure HTTP-Only cookie is set, and they are redirected "inside".
    *   **Register**: `/register`. New users can create an account (Customer role).
    *   **Secure Navbar**: Shows "Login/Register" for guests.

### B. Secured Access (The "Inside")
Once authenticated, the user enters the main application area:
*   **Product Catalog**: `/products`. Displays a grid of products fetched from the database.
*   **Product Details**: `/product/:id`. Detailed view of a specific item.
*   **Shopping Cart**: `/cart`. Manage items before purchase.
*   **Checkout**: `/checkout`. finalizing orders.
*   **Order History**: `/orders`. View past orders and status.
*   **Admin Dashboard**: `/admin`. (Role-based) Access for admins to manage the platform.

### C. AI Support Chat
*   **Location**: Floating button at the bottom-right.
*   **Visibility**: **Only visible to logged-in users**.
*   **Functionality**: Opens a chat window to converse with an AI agent.
*   **Backend Integration**: Messages are sent to `/api/chat`, secured by the same JWT auth. The backend knows *exactly* which customer is chatting.

---

## 3. Technical Architecture

### A. Frontend (React + Vite)
*   **Routing**: `react-router-dom` handles navigation.
    *   *Public*: `/`, `/login`, `/register`.
    *   *Protected*: `/products`, `/cart`, `/orders`, etc. (Guarded by `ProtectedRoute`).
*   **State Management**: `CartContext` for shopping cart state.
*   **Styling**: Glassmorphism design using `index.css` variables and CSS modules.
*   **Key Files**:
    *   `src/App.jsx`: Main routing logic and Layout wrapper for auth reactivity.
    *   `src/pages/Home.jsx`: Public landing page.
    *   `src/components/Navbar.jsx`: navigation bar with dynamic Auth links.
    *   `src/components/ChatWidget.jsx`: The floating chat component.

### B. Backend (Node.js + Express)
*   **Server**: Runs on port `5000`.
*   **Database**: PostgreSQL (connected via `pg` library).
*   **Authentication**:
    *   **JWT**: Issued on login, stored in `HTTP-Only` cookie.
    *   **Middleware**: `authMiddleware.js` verifies the token for protected routes.
*   **Key Files**:
    *   `server.js`: Main entry point, mounts routes and middleware (CORS, Cookie Parser).
    *   `routes/auth.js`: Handles `/register`, `/login`, `/logout`. Issues JWTs.
    *   `routes/products.js`: Fetches items from `catalog.products` table.
    *   `routes/orders.js`: Manages order creation and history in `orders.orders` table.
    *   `routes/chat.js`: Protected endpoint for the chat widget. Accesses `req.user` to identify the customer.
    *   `middleware/authMiddleware.js`: Intercepts requests to check for valid `token` cookie.

### C. Database (PostgreSQL)
*   **Schemas**:
    *   `auth`: Accounts and Admins.
    *   `customer`: Customer profiles.
    *   `catalog`: Products, Categories.
    *   `orders`: Orders, Order Items.

---

## 4. Workflows

### Authentication Flow
1.  User submits credentials on Frontend.
2.  Backend verifies against `auth.accounts`.
3.  Backend signs a **JWT** (containing `customer_id`, `email`).
4.  Backend sets `token` cookie (HTTP-Only).
5.  Frontend redirects user to `/products`.

### Chat Flow
1.  Logged-in user sends message via `ChatWidget`.
2.  Frontend POSTs to `/api/chat` (cookies included).
3.  `authMiddleware` verifies cookie & extracts `customer_id`.
4.  `chat.js` processes message (contextualized to that specific user).
5.  Response is sent back and displayed.
