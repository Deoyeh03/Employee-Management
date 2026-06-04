# Antigravity Employee Management System

A full-stack employee management and performance tracking platform designed for managing workers, scheduling shifts, tracking attendance in real-time, and logging item-processing performance metrics.

## Features

* **Admin Web Dashboard (Next.js)**
  * Manage staff (Add, Activate, Suspend workers) securely.
  * Real-time tracking of Active Personnel and Average Cycle Time.
  * Schedule and assign upcoming shifts to workers.
  * View historical attendance and performance logs.

* **Worker Mobile App (React Native / Expo)**
  * Personal shift schedule widget syncing in real-time.
  * Clock-in / Clock-out functionality.
  * Secure, token-based performance logging system for processed items.

* **Backend (Node.js / Express)**
  * Real-time WebSocket broadcasting (`socket.io`).
  * JWT-based authentication and Role-Based Access Control (RBAC).
  * Robust PostgreSQL database architecture with Row-Level Security (RLS) for multi-tenant isolation.

## Tech Stack

* **Frontend (Web)**: React, Next.js, Tailwind CSS, Lucide Icons.
* **Frontend (Mobile)**: React Native, Expo, Expo Router.
* **Backend**: Node.js, Express, TypeScript, Socket.io, Zod.
* **Database**: PostgreSQL (Dockerized for local development).

---

## Local Development Setup

### Prerequisites
* Node.js (v18+)
* Docker & Docker Compose
* Expo CLI (for the mobile app)

### 1. Database & Backend Setup
1. Clone the repository and navigate into the root directory.
2. Start the PostgreSQL database and Backend server using Docker:
   ```bash
   docker compose up --build
   ```
3. Open a new terminal and run the database seeder to create your initial admin account:
   ```bash
   docker exec -i antigravity_db psql -U postgres -d antigravity < seed.sql
   ```
   *Your default admin login is `admin@gmail.com` with password `password123`.*

### 2. Start the Web Admin Dashboard
1. Navigate to the `frontend-web` directory:
   ```bash
   cd frontend-web
   npm install
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser.

### 3. Start the Mobile Worker App
1. Navigate to the `frontend-mobile` directory:
   ```bash
   cd frontend-mobile
   npm install
   npx expo start
   ```
2. Scan the QR code using the **Expo Go** app on your iOS/Android device.

---

## Deployment Guide (Render & Vercel)

This application is ready to be deployed to the cloud via Infrastructure-as-Code. 

### Deployment Order
It is critical to deploy in the following order:
1. **PostgreSQL Database & Backend Server (Render)**: Render will provision both simultaneously using the `render.yaml` file.
2. **Seed the Production Database**: Run the `seed-production.js` script pointing to your new Render database URL.
3. **Web Dashboard (Vercel)**: Import the `frontend-web` folder into Vercel and provide it with the live Backend API URL.
4. **Mobile App**: Update the `.env` variables with your live Backend URL and build the APK/IPA using Expo EAS.

For detailed step-by-step instructions, refer to the **Walkthrough** guide provided by your AI assistant!
