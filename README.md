# Pearl AI - Photo Prompt App

## Project Overview
**Pearl AI** is a complete ecosystem consisting of a Mobile App (React Native/Expo) for users to discover AI prompts, and an Admin Panel (Next.js) for creators to manage content.

## 🚀 Getting Started

### 1. Admin Panel & Backend
The Admin Panel serves as the content management system and the API backend.

**Location**: `/admin`
**Credentials**: 
- Email: `admin@pearl.com`
- Password: `admin123`

**Run Command**:
```bash
cd admin
npm run dev
```
*Access at: http://localhost:3000*

### 2. Mobile App
The mobile app displays the prompts and allows users to copy them or open Gemini.

**Location**: `/mobile`

**Run Command**:
```bash
cd mobile
npx expo start
```
### 📱 Testing on iPhone (iOS)
1. Install **Expo Go** from the App Store.
2. Connect your iPhone to the **same Wi-Fi** as your PC.
3. Open the **Camera App** (not Expo Go).
4. Scan the QR code.
5. Tap "Open in Expo Go".

### 📱 Testing on Android
1. Install **Expo Go** from Play Store.
2. Open Expo Go.
3. Tap "Scan QR Code" and scan the code.

## 📱 Features Implemented
- **Glassmorphism UI**: Beautiful dark/glass aesthetics.
- **Admin Dashboard**: Create, Read, Update, Delete (CRUD) AI Prompts.
- **Smart Search**: Filter by keywords or styles (Cinematic, Realistic, etc.).
- **Favorites**: Save your best prompts locally on the device.
- **One-Click Actions**: Copy prompts or open Gemini directly.
- **Settings**: Privacy Policy and App Info screens.

## 🔧 Configuration
- **API Connection**: The mobile app connects to the Admin backend. 
- Access `mobile/App.js` and update `API_URL` if you are testing on a physical device (use your PC's IP address: `10.33.107.169`).
