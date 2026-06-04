# Employee Management System 👔

A comprehensive, full-stack monorepo designed for real-time workforce management. Built with modern web and mobile technologies, this system allows business owners to manage staff schedules, track live attendance, and log daily performance metrics, while giving workers a dedicated mobile application to interact with their shifts in real time.

## 🚀 Key Features

* **Real-Time Data Sync:** Powered by Socket.IO, shifts and employee statuses synchronize instantly across all web and mobile clients without refreshing.
* **Role-Based Access Control:** Secure JWT authentication tailored for Owners, Managers, and Workers.
* **Admin Web Dashboard:** A sleek, glassmorphic Next.js portal to add staff, manage schedules, toggle account states, and view live daily statistics.
* **Mobile Worker Portal:** A React Native Expo app for workers to view their upcoming shifts, clock in/out securely, and log the number of items they have processed.
* **Robust Security:** Built-in defenses against deactivated user access, forcing instant session terminations and preventing unauthorized API interactions.

## 🛠️ Technology Stack

* **Backend Environment:** Node.js, Express.js, TypeScript
* **Database:** PostgreSQL (with Row-Level Security prepared for Multi-Tenancy)
* **Real-Time Engine:** Socket.IO
* **Web Frontend:** Next.js 15, React 19, TailwindCSS v4, Lucide Icons
* **Mobile Frontend:** React Native (Expo Router), AsyncStorage

## 📂 Project Structure

This is a monorepo containing three distinct applications:

* `/backend` - The Express REST API and WebSocket server.
* `/frontend-web` - The Next.js Admin Web Dashboard.
* `/frontend-mobile` - The React Native Expo Worker App.
* `/db-init` - Initial SQL schema definitions for the PostgreSQL database.

## 💻 Local Development Setup

### Prerequisites
* Docker & Docker Compose
* Node.js v18+ 
* Expo CLI

### 1. Start the Backend & Database
The easiest way to run the backend locally is using Docker.
```bash
docker compose up backend db --build
```
*This will start the PostgreSQL database and the Node.js backend on `http://localhost:3001`.*

### 2. Start the Admin Web Dashboard
Open a new terminal window:
```bash
cd frontend-web
npm install
npm run dev
```
*The web dashboard will be available at `http://localhost:3000`.*

### 3. Start the Mobile Worker App
Open a new terminal window:
```bash
cd frontend-mobile
npm install
npx expo start
```
*You can scan the QR code using the Expo Go app on your physical device, or press `a` / `i` to launch an Android/iOS emulator.*

## ☁️ Deployment

This project is configured with "Infrastructure-as-Code" templates for easy deployment.

* **Backend & Database:** Deploy seamlessly to [Render](https://render.com) using the included `render.yaml` Blueprint file.
* **Frontend Web:** Deploy the `frontend-web` directory natively to [Vercel](https://vercel.com).
* **Environment Variables:** Make sure to supply the production API URLs (`NEXT_PUBLIC_API_URL` for the web, and `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_SOCKET_URL` for mobile).

See the detailed deployment walkthrough for step-by-step cloud hosting instructions!
