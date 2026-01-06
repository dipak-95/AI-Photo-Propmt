# AI Photo Prompt By Pearl - Implementation Plan

## 1. Project Structure
We will use a Monorepo approach with two main applications:
- **/admin**: A Next.js application that serves as both the **Admin Panel** (Web) and the **Backend API**.
- **/mobile**: A React Native (Expo) application for the User Interface (Android & iOS).

## 2. Admin Panel (Backend & Web)
**Tech Stack**: Next.js, Tailwind CSS, API Routes.
**Features**:
- **Authentication**: Simple Admin Login.
- **Dashboard**: View, Add, Edit, Delete AI Prompts/Photos.
- **API**: Endpoints to serve prompts to the mobile app (`/api/prompts`).
- **Storage**: We'll use a local JSON database initially for zero-configuration persistence, which can be easily swapped for MongoDB later.

## 3. Mobile App (User)
**Tech Stack**: React Native (Expo), StyleSheet/NativeWind.
**Features**:
- **Home Screen**: Grid of Photos.
- **Search**: Smart search by keyword/style.
- **Details Screen**: View Full Image, Copy Prompt, Open in Gemini.
- **Favorites**: Local storage for saved prompts.
- **Settings**: Static pages for Privacy, Version, etc.

## 4. Design Guidelines
- **Aesthetics**: Dark mode, vibrant colors (Pearl branding), glassmorphism.
- **UX**: Smooth transitions, easy "Copy" actions.

## 5. Next Steps
1.  Initialize Admin (Next.js) and Mobile (Expo) projects.
2.  Build the Admin API and Dashboard.
3.  Build the Mobile App Screens.
