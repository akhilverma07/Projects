import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

function getApp(): FirebaseApp {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    return initializeApp(firebaseConfig);
}

// Lazy initialization to prevent build-time errors when env vars are missing
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _rtdb: Database | null = null;

export function getDb(): Firestore {
    if (!_db) {
        _db = getFirestore(getApp());
    }
    return _db;
}

export function getAppAuth(): Auth {
    if (!_auth) {
        _auth = getAuth(getApp());
    }
    return _auth;
}

export function getRtdb(): Database | null {
    if (!_rtdb) {
        const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
        // Check if the user accidentally pasted the Firestore console URL
        if (!dbUrl || dbUrl.includes('console.firebase.google.com') || !dbUrl.includes('firebaseio.com')) {
            console.warn('LiveSheet: Invalid or missing Realtime Database URL. Presence tracking (disconnects) will be disabled. URL must be a .firebaseio.com or .firebasedatabase.app domain.');
            return null;
        }
        try {
            _rtdb = getDatabase(getApp());
        } catch (error) {
            console.error('LiveSheet: Failed to initialize Realtime Database', error);
            return null;
        }
    }
    return _rtdb;
}
