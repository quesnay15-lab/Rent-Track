# RentTrack

RentTrack is a mobile app that connects tenants and landlords in one place — browse and list apartments, message directly, and manage rentals without the back-and-forth of emails or spreadsheets.

Built with **React Native (Expo)** and **Firebase** (Authentication + Firestore), RentTrack supports two user roles — **Tenant** and **Landlord** — each with a tailored experience.

## Features

### For Tenants
- 🏠 **Browse apartment listings** in real time — new listings from landlords appear instantly, no refresh needed
- 🔍 **Search and filter** listings by title/keyword
- ⭐ **View ratings and reviews** for each apartment before reaching out
- 💬 **Message landlords** directly through in-app chat
- 📋 **Track requests** sent to landlords in one place
- 👤 **Manage profile**, including profile photo upload

### For Landlords
- ➕ **Create and publish** new apartment listings with photos, pricing, and descriptions
- ✏️ **Edit or update** existing listings (rent, status, details)
- 🗑️ **Remove listings** that are no longer available
- 📂 **View all owned listings** in one dashboard
- 💬 **Respond to tenant messages** and manage inquiries
- 👤 **Manage profile** and account details

### Core Platform Features
- 🔐 **Secure authentication** — email/password sign-up and login, with friendly error messages for common issues (invalid email, weak password, existing account, etc.)
- ⚡ **Real-time data sync** — apartment listings update live across all tenant devices via Firestore listeners
- 🖼️ **Image uploads** — profile photos and listing images stored via Firebase Storage
- 🔄 **Pull-to-refresh** support throughout the app
- 📱 **Cross-platform** — runs on iOS and Android from a single Expo codebase

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (Expo Router) |
| Backend | Firebase (Authentication, Firestore, Storage) |
| Navigation | Expo Router (file-based routing) |
| Build/Deploy | EAS Build |

## Project Structure

```
RentTrack/
├── app/
│   ├── (auth)/          # Login, registration screens
│   ├── (tabs)/           # Main tab navigation (home, messages, requests, profile)
│   ├── apartment/        # Apartment details, listing forms
│   └── chat/             # Messaging screens
├── components/           # Reusable UI components
├── constants/             # Theme, sample data
├── context/               # Auth context provider
├── services/              # Firebase service layer (auth, apartments, messages, reviews, storage)
└── styles/                # Global styles
```

## Getting Started

### Prerequisites
- Node.js and npm
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project with Authentication and Firestore enabled

### Installation
```bash
git clone https://github.com/quesnay15-lab/Rent-Track.git
cd Rent-Track
npm install
```

### Configure Firebase
Add your Firebase project credentials to `services/firebaseConfig.js`.

### Run the app
```bash
npx expo start
```

### Build an APK
```bash
eas build -p android --profile preview
```

## Roadmap Ideas
- Push notifications for new messages and listings
- In-app rent payment tracking
- Lease document uploads
- Map view for apartment search

---

*RentTrack — making apartment hunting and management simpler for everyone.*
