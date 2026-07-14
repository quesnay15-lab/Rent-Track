# RentTrack — Apartment Listing App

A simple, beginner-friendly apartment rental listing app built with **React Native**, **Expo SDK 54**, **Expo Router v6**, and **JavaScript**.

Users can register, log in, browse and search apartment listings, view apartment details, submit rental requests, view their submitted requests, and manage their profile.

**No backend or account setup required** — the app stores everything locally on the device using AsyncStorage, and comes pre-seeded with sample apartment listings.

---

## Features

- Local email/password "accounts" with two roles: **Tenant** and **Landlord**
- Show/hide password toggle on Login and Register
- Home screen with search and apartment listing cards (all listings, both sample and landlord-posted)
- Apartment details screen with "Request to Rent" (tenants) or "Edit Listing" (landlords viewing their own)
- **My Listings** (landlords only) — add, edit, and delete your own apartment listings
- **Messages** tab — a real chat thread between a tenant and the landlord of a specific apartment
- My Requests screen showing the logged-in user's submitted requests, with a trash icon to remove a request (e.g. if you already found a place)
- Profile screen with photo, role badge, user info, and logout
- "Set Up My Profile" screen to add/change a profile photo and edit name/email
- Loading indicators and empty states throughout

---

## Tech Stack

- React Native + Expo SDK 54
- Expo Router v6 (file-based navigation)
- JavaScript (no TypeScript)
- AsyncStorage (local on-device data — no backend, no API keys, no setup)

---

## Project Structure

```text
RentTrack/
├── app/
│   ├── (auth)/            # Login & Register (auth stack)
│   ├── (tabs)/             # Home, My Requests, Profile (bottom tabs)
│   ├── apartment/[id].jsx  # Apartment details screen
│   ├── _layout.jsx         # Root layout (wraps app in AuthProvider)
│   └── index.jsx           # Entry point — redirects based on auth state
├── components/             # Reusable UI components
├── context/                 # AuthContext (global logged-in user state)
├── services/                 # Local "CRUD" helpers (AsyncStorage-backed)
│   ├── storage.js            # Shared AsyncStorage read/write helpers
│   ├── authService.js         # Register / login / logout / profile
│   ├── apartmentService.js    # Apartment listing lookups
│   └── requestService.js      # Rental request creation & lookups
├── constants/                # Theme colors, spacing, fonts, sample data
├── styles/                    # Shared global styles
├── assets/                     # App icons / splash images
├── package.json
├── app.json
├── eas.json                    # Build profiles for generating an APK
└── babel.config.js
```

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app

```bash
npx expo start
```

Scan the QR code with the Expo Go app (Android/iOS), or press `a` for an Android emulator / `w` for web.

That's it — no Firebase project, no API keys, no config files to edit. On first launch the app seeds itself with 5 sample apartments.

---

## How the data works

Everything is stored locally on the device with `@react-native-async-storage/async-storage`:

| Data | Where it lives | Notes |
|------|------------------|-------|
| User accounts | `renttrack_users` key | Plain-text demo storage — fine for learning, not for a real production app |
| Current session | `renttrack_current_user_id` key | Just remembers which user id is "logged in" |
| Apartments | `renttrack_apartments` key | Seeded once from `constants/sampleApartments.js` |
| Rental requests | `renttrack_requests` key | Created when a user taps "Request to Rent" |

Because data is local to the device, it will reset if the app is uninstalled, and different devices/installs won't share data. **This includes chat**: a tenant and a landlord can only message each other for real if both accounts are logged into on the same physical device (e.g. log in as the tenant, send a message, log out, log in as the landlord on the same phone to reply). Two different phones will not see each other's messages, since there's no server relaying them. If you ever want to sync data (including chat) across real devices, `services/storage.js` is the one file you'd swap out for a real backend — the rest of the app talks to `authService`, `apartmentService`, `requestService`, and `messageService`, and doesn't care where the data actually lives.

---

## Building an APK

This project is set up to build with [EAS Build](https://docs.expo.dev/build/introduction/), Expo's cloud build service (free tier available).

### 1. Install the EAS CLI and log in

```bash
npm install -g eas-cli
eas login
```

(Create a free Expo account at https://expo.dev/signup if you don't have one.)

### 2. Link the project to EAS

From the project folder:

```bash
eas init
```

This sets a project ID in `app.json` under `extra.eas.projectId`.

### 3. Build the APK

```bash
eas build -p android --profile preview
```

This uses the `preview` profile in `eas.json`, which is configured to produce an installable `.apk` file (rather than the Play Store's `.aab` format). The build runs on Expo's servers — you'll get a link to download the `.apk` once it finishes (usually 10–20 minutes).

### 4. Install it on a phone

Download the `.apk` from the link EAS gives you, transfer it to an Android phone (or open the link directly on the phone), and install it. You may need to allow "install from unknown sources" in Android settings.

### Building a Play Store release later

When you're ready for a real Play Store release, use:

```bash
eas build -p android --profile production
```

This produces an `.aab` (Android App Bundle), which is what the Play Store requires for new app submissions.

---

## Notes

- This project intentionally excludes payments, chat, maps, push notifications, QR codes, multiple user roles, and admin dashboards to keep it beginner-friendly.
- `assets/*.png` are minimal placeholder images — swap them with your own app icon and splash screen before publishing.
- Because there's no backend, this is best suited for demos, coursework, and learning Expo/React Native — not for handling real user data.
