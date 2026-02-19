# 🏋️ FitPro - Hospitality Management System

A full-stack web application for managing a GYM / Hospitality business with customer management, product inventory, orders, billing, and GYM activities.

---

## 📁 Project Structure

```
hospital-mgmt/
├── backend/                        # Node.js + Express Backend
│   ├── config/
│   │   └── database.js             # MySQL connection + DB schema setup
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js                 # Login / Register routes
│   │   ├── customers.js            # Customer CRUD routes
│   │   ├── products.js             # Product CRUD routes
│   │   ├── orders.js               # Orders CRUD routes
│   │   ├── billing.js              # Billing CRUD routes
│   │   └── gymActivities.js        # GYM Activities CRUD routes
│   ├── server.js                   # Main Express server
│   ├── .env                        # Environment variables
│   └── package.json
│
├── frontend/                       # React.js Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js          # Navigation sidebar
│   │   │   ├── Sidebar.css
│   │   │   └── modals/
│   │   │       ├── CustomersModal.js    # Customers CRUD + View Detail
│   │   │       ├── ProductsModal.js     # Products CRUD
│   │   │       ├── OrdersModal.js       # Orders management
│   │   │       ├── BillingModal.js      # Billing + Print Receipt
│   │   │       ├── GymModal.js          # GYM Activities cards
│   │   │       ├── DashboardOverview.js # Stats dashboard
│   │   │       └── Modal.css            # Shared modal styles
│   │   ├── context/
│   │   │   └── AuthContext.js      # React Auth context (login state)
│   │   ├── pages/
│   │   │   ├── LoginPage.js        # Login form
│   │   │   ├── LoginPage.css
│   │   │   ├── Dashboard.js        # Main dashboard layout
│   │   │   └── Dashboard.css
│   │   ├── services/
│   │   │   └── api.js              # Axios API services for all endpoints
│   │   ├── App.js                  # Routes + Auth guards
│   │   ├── App.css                 # Global styles + design system
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── package.json                    # Root scripts to run both
└── README.md
```

---

## 🚀 Quick Setup

### Prerequisites
- Node.js v16+
- MySQL 8.0+ running locally
- npm or yarn

### Step 1: Configure Backend Environment

Edit `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD    ← Change this!
DB_NAME=hospitality_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 3: Initialize Database

The database auto-initializes when you start the backend server. It will:
- Create the `hospitality_db` database
- Create all 7 tables (users, customers, products, orders, order_items, billing, gym_activities)
- Insert sample data (admin user, customers, products, GYM activities)

### Step 4: Run the Application

**Option A — Run both together from root:**
```bash
npm install
npm start
```

**Option B — Run separately:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 5: Access the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

---

## 🔐 Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@gym.com | admin123 | Admin |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login and get JWT |
| POST | /api/auth/register | Register new user |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers | Get all customers |
| GET | /api/customers/:id | Get single customer |
| POST | /api/customers | Create customer |
| PUT | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get single product |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders | Get all orders |
| GET | /api/orders/:id | Get order with items |
| POST | /api/orders | Create order |
| PUT | /api/orders/:id | Update order status |
| DELETE | /api/orders/:id | Delete order |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/billing | Get all bills |
| GET | /api/billing/:id | Get bill with items |
| POST | /api/billing | Create bill |
| PUT | /api/billing/:id | Update bill |
| DELETE | /api/billing/:id | Delete bill |

### GYM Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/gym-activities | Get all activities |
| GET | /api/gym-activities/:id | Get single activity |
| POST | /api/gym-activities | Create activity |
| PUT | /api/gym-activities/:id | Update activity |
| DELETE | /api/gym-activities/:id | Delete activity |

---

## 🎨 Frontend Features

| Menu Section | Features |
|--------------|----------|
| **Dashboard** | Stats overview, recent orders, revenue summary |
| **Customers** | Full CRUD + View Detail modal + search + membership badges |
| **Products** | Full CRUD + stock levels + category + search |
| **Orders** | View all orders + detail view + status update + delete |
| **Billing** | Full CRUD + **Print Receipt** (browser print dialog) + payment status |
| **GYM Activities** | Card grid layout + CRUD + category colors + trainer/schedule info |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Styling | Custom CSS (no UI framework needed) |

---

## 🗄️ Database Schema

```sql
users            -- Admin/staff accounts
customers        -- GYM members with membership type
products         -- Products/supplements/equipment
orders           -- Customer orders
order_items      -- Line items for each order
billing          -- Invoices with payment tracking
gym_activities   -- Available GYM classes/activities
```
