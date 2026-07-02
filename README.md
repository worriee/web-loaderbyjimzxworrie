# JMxWorrie — GB Loader App

> One-tap load loading. Zero hassle.

![JMxWorrie Hero Banner](public/screenshots/screenshot-desktop.png)

---

## What is JMxWorrie?

A **mobile-first Progressive Web App (PWA)** that makes buying data load as easy as sending a text message. Users submit orders with a receipt, and admins manage everything in **real-time** — no app store download required.

---

## Features at a Glance

| For Users                                 | For Admins                            |
| ----------------------------------------- | ------------------------------------- |
| Simple order form                         | Live dashboard with real-time updates |
| Upload receipt via camera or gallery      | Change order status with one click    |
| Instant status tracking by Transaction ID | Secure admin-only access              |
| Install as PWA on your home screen        | Easy order deletion                   |

---

## How It Works

### User Flow

```
Fill Form  -->  Upload Receipt  -->  Get Transaction ID  -->  Track Status
```

### Admin Flow

```
Login  -->  View Live Orders  -->  Update Status  -->  Done
```

---

## Tech Stack

**Frontend**
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

**Backend & Infrastructure**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

**Security & Auth**
![bcrypt](https://img.shields.io/badge/bcrypt-00599C?style=flat&logo=bcrypt&logoColor=white)
![Redis](https://img.shields.io/badge/Upstash_Redis-DC382D?style=flat&logo=redis&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

---

## Installation

### Download APK (Recommended for Users)

Download the latest APK directly from the [Releases Tab](https://github.com/worriee/web-loaderbyjimzxworrie/releases).

1. Go to the [Releases page](https://github.com/worriee/web-loaderbyjimzxworrie/releases)
2. Download the latest `.apk` file
3. Open the APK on your Android device
4. Allow installation from unknown sources if prompted
5. Done — the app is ready to use

### Install as PWA (Alternative)

1. Visit the live app URL in your browser
2. Tap **"Add to Home Screen"** when prompted
3. Open from your home screen — it works like a native app

---

## Security

This application implements industry-standard security practices:

- **Bcrypt Password Hashing** — Admin passwords are never stored in plain text
- **JWT httpOnly Cookies** — Session tokens are inaccessible to JavaScript
- **CORS Origin Validation** — Only trusted domains can access the API
- **Rate Limiting** — Brute-force and spam protection via Upstash Redis
- **File Upload Validation** — 5MB size limit, images only (JPG, PNG, WebP)
- **Server-Side Auth Checks** — All admin routes verify JWT before processing

---

## License

MIT License

Built with **James x Worrie**
