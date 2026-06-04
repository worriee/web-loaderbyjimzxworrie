# GB Loader App

A fast and reliable system for managing data (GB) transactions. This app is a **Progressive Web App (PWA)**, meaning you can install it on your phone and use it just like a regular mobile app.

---

## Overview

**GB Loader App** is designed to make buying and managing data packages simple. It provides a smooth experience for users to submit orders and a powerful, real-time dashboard for admins to manage them.

### For Users

- **Easy Ordering**: A simple form to request your data (Phone, Network, and Amount).
- **Quick Uploads**: Upload your payment receipt directly from your phone's gallery or camera.
- **Instant Status**: Check if your order is pending, completed, or cancelled at any time.

### For Admins

- **Live Dashboard**: See new orders instantly without refreshing the page, thanks to real-time updates.
- **Order Management**: Easily update the status of an order or remove old records.
- **Secure Access**: A protected admin area to ensure only authorized staff can manage transactions.

---

## PWA Features

As a **Progressive Web App (PWA)**, this project offers:

- **Installable**: Add the app to your home screen on Android or iOS for quick access.
- **Mobile Optimized**: Designed to feel and work like a native mobile application.
- **Fast & Lightweight**: Optimized for speed and low data usage.

---

## Tech Stack

- **Frontend**: [React 19](https://react.dev/) & [Vite](https://vitejs.dev/) (Fast and modern)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Clean and responsive)
- **Backend**: [Vercel Serverless Functions](https://vercel.com/) (Reliable and scalable)
- **Database & Storage**: [Supabase](https://supabase.com/) (Real-time database and secure file storage)

---

## 📂 Project Structure

```text
Project Root Directory
├── 📂 api/                   <-- Backend logic (Vercel)
│   ├── 📄 login.js           <-- Admin login
│   ├── 📄 verify.js          <-- Check if admin is logged in
│   └── 📂 admin/             <-- Admin tools
│       ├── 📄 transactions.js <-- Get all orders
│       ├── 📄 update-status.js <-- Change order status
│       └── 📄 delete-transaction.js <-- Remove an order
├── 📂 src/                   <-- Frontend code (React)
│   ├── 📂 components/        <-- UI parts
│   │   ├── 📄 AdminPanel.jsx <-- Admin dashboard
│   │   ├── 📄 UserPanel.jsx  <-- User order form
│   │   └── 📄 Login.jsx      <-- Admin login page
│   └── 📂 utils/             <-- Helper tools
│       └── 📄 supabaseClient.js <-- Connect to database
├── 📂 supabase/              <-- Database & Cloud functions
│   └── 📂 functions/         <-- Receipt upload logic
└── 📂 public/                <-- PWA & App icons
```

---

## 🔄 How it works

**User Side:**
`Fill Form` → `Upload Receipt` → `Order Saved` → `Check Status`

**Admin Side:**
`Login` → `View Live Orders` → `Update Status` → `Delete Orders`
