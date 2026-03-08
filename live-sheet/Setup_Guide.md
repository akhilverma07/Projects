# LiveSheet — Quick Setup Guide

## Prerequisites
- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+
- A **Google account** for Firebase console access

## Step 1: Install Dependencies
```bash
cd live-sheet
npm install
```

## Step 2: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter a project name (e.g. `live-sheet`)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

## Step 3: Register a Web App
1. Click the **Web icon** `</>` on the project overview page
2. Enter an app nickname (e.g. `live-sheet-web`)
3. Click **"Register app"**
4. Keep the config snippet — you'll need it next

## Step 4: Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=live-sheet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=live-sheet
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=live-sheet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://live-sheet-default-rtdb.firebaseio.com
```

## Step 5: Enable Authentication
1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google** (set support email, save)
3. Enable **Anonymous** (save)

## Step 6: Set Up Cloud Firestore
1. Firebase Console → **Firestore Database** → **Create database**
2. Start in **test mode**, select a location, click **Enable**

### Firestore Security Rules (Development)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{docId} {
      allow read, write: if request.auth != null;
    }
    match /cells/{docId} {
      allow read, write: if request.auth != null;
    }
    match /presence/{docId}/users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 7: Set Up Realtime Database (for presence)
1. Firebase Console → **Realtime Database** → **Create Database**
2. Start in **test mode**, click **Enable**
3. Copy the database URL to `NEXT_PUBLIC_FIREBASE_DATABASE_URL`

### Realtime Database Rules
```json
{
  "rules": {
    "presence": {
      "$docId": {
        "$uid": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid === $uid"
        }
      }
    }
  }
}
```

## Step 8: Run the Application
```bash
npm run dev
```
Open http://localhost:3000

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing or insufficient permissions" | Check Firestore rules, ensure user is authenticated |
| "Firebase: Error (auth/configuration-not-found)" | Verify `.env.local` values match Firebase config |
| Google sign-in popup blocked | Allow popups for localhost |
| Grid not rendering | Check console, restart with `npm run dev` |
| Presence not updating | RTDB is optional but recommended; check rules |
