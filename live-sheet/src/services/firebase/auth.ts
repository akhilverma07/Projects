import {
    signInAnonymously as firebaseSignInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    signOut as firebaseSignOut,
} from 'firebase/auth';
import { getAppAuth } from './firebaseConfig';

export async function signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getAppAuth(), provider);
}

export async function signInAnonymously(displayName: string): Promise<void> {
    const result = await firebaseSignInAnonymously(getAppAuth());
    await updateProfile(result.user, { displayName });
}

export async function signOut(): Promise<void> {
    await firebaseSignOut(getAppAuth());
}
