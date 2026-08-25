# 🍽️ Restaurant Management System

A full-stack restaurant management platform connecting **customers**, **restaurants**, and **admins** in one seamless experience — with real-time ordering, live chat, notifications, reviews, and a social community feed.

Built with **React (TypeScript)** on the frontend and **Node.js / Express / MongoDB** on the backend, powered by **Socket.io** for real-time features and **Cloudinary** for media storage.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Real-Time Events (Socket.io)](#-real-time-events-socketio)
- [User Roles](#-user-roles)

---

## 🌟 Overview

This platform allows customers to browse restaurants, place orders, chat with restaurants in real time, and rate their experience after delivery. Restaurants get a full dashboard to manage their menu, track orders, and view performance analytics. Admins have complete oversight — approving restaurants, managing users, moderating reported content, and monitoring platform-wide statistics.

---

## ✨ Features

### Authentication & Security
- JWT-based authentication
- Email OTP verification on signup
- Secure forgot/reset password flow
- Role-based access control (Admin / Restaurant / Customer)
- Rate limiting, XSS protection, NoSQL injection sanitization, Helmet security headers

### Customer
- Browse and search restaurants
- Place orders with real-time price calculation (server-side, discount-aware)
- Track order status live (pending → accepted → on the way → delivered)
- Cancel orders before acceptance
- Rate & review restaurants — **only after delivery is confirmed**
- Live chat with restaurants (auto-opens when an order is placed)
- Post, like, and comment in the Community feed
- Report inappropriate restaurants, meals, or posts

### Restaurant
- Full dashboard with order & revenue analytics (last 7 days, top-selling meals, etc.)
- Manage menu: add / edit / delete meals, set discounts, toggle availability
- Accept / reject / update order status in real time
- Live chat with customers
- Profile & password management

### Admin
- Approve or reject new restaurant registrations
- Manage all restaurants and customers (activate/deactivate/delete)
- Ban/unban users or restaurants from the community
- Full visibility over meals and orders across the platform
- Review and act on user reports
- Platform-wide statistics dashboard (revenue, order breakdown, top restaurants, etc.)

### Real-Time (Socket.io)
- Instant notifications (new order, order accepted/rejected/delivered, new message)
- Live chat with online/offline presence and typing indicators
- System messages auto-posted into chat when an order is created

### Community Feed
- Facebook-style feed for restaurants & customers
- Posts with image and/or text
- Likes and comments
- Cloudinary-powered image uploads

---

## 🛠️ Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Axios
- Socket.io Client

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io
- JWT (jsonwebtoken)
- Joi (validation)
- Bcrypt.js (password hashing)
- Nodemailer (email/OTP)
- Cloudinary + Multer (image uploads)
- Helmet, express-rate-limit, express-mongo-sanitize, xss-clean (security)

---

## 📁 Project Structure

```
full stack/
├── Back-end/
│   ├── config/            # DB & Cloudinary configuration
│   ├── middlewares/       # Auth, validation, error handling, upload
│   ├── models/            # Mongoose schemas
│   ├── modules/           # Feature modules (controller + route + validation)
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── restaurant/
│   │   ├── customer/
│   │   ├── meal/
│   │   ├── order/
│   │   ├── review/
│   │   ├── notification/
│   │   ├── chat/
│   │   ├── community/
│   │   ├── report/
│   │   └── upload/
│   ├── sockets/           # Socket.io setup
│   ├── seed/               # Admin seed script
│   ├── utils/              # Helper functions
│   └── server.js
│
└── Front-end/
    ├── src/
    │   ├── components/     # Reusable UI & layout components
    │   ├── context/        # Auth, Language, Theme contexts
    │   ├── hooks/
    │   ├── i18n/            # Arabic/English translations
    │   ├── lib/             # Axios instance, Socket client, API modules
    │   └── pages/
    │       ├── auth/
    │       ├── admin/
    │       ├── restaurant/
    │       ├── customer/
    │       └── shared/      # Chat, Community, Notifications, Profile
    └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [MongoDB](https://www.mongodb.com/) instance (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for OTP emails)

### 1. Clone the repository
```bash
git clone https://github.com/Abdo-rays/wagpaty.git
cd "full stack"
```

### 2. Backend Setup
```bash
cd Back-end
npm install
```

Create a `.env` file in `Back-end/` (see [Environment Variables](#-environment-variables) below).

Seed the first admin account:
```bash
node seed/createAdmin.js
```

Run the backend:
```bash
npm run dev
```
Server runs on `http://localhost:5000` by default.

### 3. Frontend Setup
```bash
cd ../Front-end
npm install
npm run dev
```
Frontend runs on the Vite dev server (typically `http://localhost:5173`).

---

## 🔐 Environment Variables

Create `Back-end/.env` with the following:

```env
NODE_ENV=development
PORT=5000

# Database
DB_URI=mongodb://127.0.0.1:27017/restaurant-app

# JWT
JWT_SECRET=your_strong_secret_key
JWT_EXPIRES_IN=7d

# OTP
OTP_EXPIRES_IN_MINUTES=10
RESET_PASSWORD_EXPIRES_IN_MINUTES=10

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Restaurant App <your_email@gmail.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> ⚠️ Never commit `.env` to version control — it's already excluded via `.gitignore`.

---

## 🔌 API Overview

| Base Route | Description |
|---|---|
| `/api/auth` | Signup, login, OTP verification, password reset |
| `/api/admin` | Restaurant/customer/meal/order management, bans, platform stats |
| `/api/restaurants` | Restaurant profile & dashboard analytics |
| `/api/customers` | Customer profile, dashboard, restaurant browsing |
| `/api/meals` | Meal CRUD & public browsing |
| `/api/orders` | Order lifecycle (create, accept, reject, deliver, cancel) |
| `/api/reviews` | Post-delivery ratings & reviews |
| `/api/notifications` | User notifications |
| `/api/chat` | Customer ⇄ restaurant conversations |
| `/api/community` | Posts, likes, comments |
| `/api/reports` | Reporting restaurants, meals, or posts |
| `/api/upload` | Cloudinary image uploads |

All protected routes require a `Bearer <token>` in the `Authorization` header.

---

## ⚡ Real-Time Events (Socket.io)

Connect with an authenticated token:
```ts
const socket = io("http://localhost:5000", { auth: { token } });
```

| Event | Direction | Description |
|---|---|---|
| `newNotification` | Server → Client | New notification received |
| `newMessage` | Server → Client | New chat message |
| `userStatusChanged` | Server → Client | Online/offline status update |
| `typing` / `stopTyping` | Bidirectional | Typing indicator in chat |
| `joinConversation` / `leaveConversation` | Client → Server | Join/leave a chat room |
| `checkOnlineStatus` | Client → Server | Check if a partner is online |

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Admin** | Full platform control, approvals, moderation, analytics |
| **Restaurant** | Menu management, order handling, dashboard analytics |
| **Customer** | Browsing, ordering, reviewing, chatting, community participation |

---

## 📄 License

This project is available for educational and portfolio purposes.
