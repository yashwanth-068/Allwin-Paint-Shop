# All Win Paint Shop - Karur, Tamil Nadu

A professional e-commerce website for a paint and hardware shop with three user modules: Owner, Manager, and Buyers.

## Features

### For Buyers
- Browse products (Paints, Cement, Steel Bars, Tools, Hardware)
- Search and filter products
- Add to cart and checkout
- Online payment via Razorpay
- Track orders
- User profile management

### For Managers
- Counter billing for walk-in customers
- Process online orders
- Manage inventory stock
- View daily sales
- Low stock alerts

### For Owner
- Complete dashboard with analytics
- Sales reports and trends
- User management
- Product management
- Inventory management
- View all transactions and orders

## Tech Stack

A full-stack MERN application — here's the complete stack layer by layer:

### 🖥️ Frontend (Client Side)
| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (via React component styles & index.css) |
| Language | JavaScript (ES6+) |
| UI Library | React.js v18 |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Charts & Analytics | Chart.js + React-Chartjs-2 |
| Notifications | React Toastify |
| Icons | React Icons |
| Date Utilities | date-fns |

### ⚙️ Backend (Server Side)
| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| File Uploads | Multer |
| Validation | express-validator |
| CORS | cors |
| Environment Config | dotenv |
| Dev Server | Nodemon |

### 💳 Payment Gateway
| Layer | Technology |
|-------|------------|
| Payment Integration | Razorpay |

### 🗄️ Database
| Layer | Technology |
|-------|------------|
| Database | MongoDB (NoSQL) |
| ODM (Object Data Modeling) | Mongoose |
| Collections | Users, Products, Orders, Sales |

### 📐 Architecture Overview
```
Browser (HTML + CSS + JS)
        ↓
   React.js (UI Layer)
        ↓
  Axios (HTTP Requests)
        ↓
 Express.js REST API
        ↓
  Mongoose ODM Layer
        ↓
  MongoDB Database
```

## Getting Started (Without Docker)

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Razorpay account for payment integration

### 1. Clone or open the project

```bash
cd d:\Varun\krs-paint-shop
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create or edit `backend\.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/allwin_paint_shop
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:3000
```

(Optional) Seed demo data:

```bash
node seed.js
```

To re-seed demo data, set:
```
SEED_FORCE=true
```

Start the backend:

```bash
npm run dev
```

Keep this terminal open.

### 3. Frontend setup (new terminal)

```bash
cd d:\Varun\krs-paint-shop\frontend
npm install
npm start
```

The app will open at **http://localhost:3000**.

## Single-Server Hosting (Production)

For hosting on a single server, the Express backend serves the React build.

1. Build the frontend:
```bash
cd d:\Varun\krs-paint-shop\frontend
npm install
npm run build
```

2. Start the backend in production mode:
```bash
cd d:\Varun\krs-paint-shop\backend
npm install
set NODE_ENV=production
npm start
```

Now the React app and API are both available from the backend server (same domain).

## Demo Accounts (after running seed.js)

| Role    | Email             | Password   |
|---------|-------------------|------------|
| Owner   | owner@allwin.com  | password123 |
| Manager | manager@allwin.com | password123 |
| Buyer   | buyer@allwin.com  | password123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Manager/Owner)

### Orders
- `POST /api/orders` - Create order
- `POST /api/orders/verify-payment` - Verify Razorpay payment
- `GET /api/orders/myorders` - Get user's orders

### Dashboard
- `GET /api/dashboard/owner` - Owner dashboard data
- `GET /api/dashboard/manager` - Manager dashboard data

## Project Structure

```
allwin-paint-shop/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── seed.js          # Demo data (run: node seed.js)
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   ├── App.js
│   └── package.json
├── RUN-WITHOUT-DOCKER.md   # Step-by-step run guide
└── README.md
```

## Razorpay Setup

1. Create account at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get API keys from Settings > API Keys
3. Add keys to `backend\.env`

## Contact Email Setup

Add SMTP credentials in `backend\.env`:
```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password
CONTACT_FROM_EMAIL=your_email@domain.com
CONTACT_TO_EMAIL=receiver_email@domain.com
```

## Support

- Email: info@allwinpaintshop.com
- Phone: +91 98765 43210

---

**All Win Paint Shop** - Quality Building Materials in Karur, Tamil Nadu
