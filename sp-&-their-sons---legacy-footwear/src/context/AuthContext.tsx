import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { AppUser } from '../types';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  authSetupError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const ADMIN_EMAIL = 'aanyamac@gmail.com';
const DEFAULT_ADMIN = {
  name: 'Akhil Verma',
  email: ADMIN_EMAIL,
  password: 'Akhil@321',
  role: 'admin' as const,
};

const mapFirebaseAuthError = (error: unknown) => {
  const authError = error as { code?: string };

  switch (authError.code) {
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is disabled in Firebase. Enable Email/Password in Firebase Console > Authentication > Sign-in method.';
    case 'auth/user-not-found':
      return 'Account does not exist. Please create a new account by registering first.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      if (error instanceof Error && error.message === 'No account found for this email. Please register first.') {
        return error.message;
      }
      return error instanceof Error ? error.message : 'Authentication failed.';
  }
};

const upsertUserProfile = async (currentUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
}, role: 'admin' | 'customer', createdAt?: string | null) => {
  await setDoc(doc(db, 'users', currentUser.uid), {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    role,
    createdAt: createdAt ?? serverTimestamp(),
    lastLogin: serverTimestamp(),
  }, { merge: true });
};

const doesUserExist = async (email: string) => {
  const userQuery = query(
    collection(db, 'users'),
    where('email', '==', email),
    limit(1),
  );
  const snapshot = await getDocs(userQuery);
  return !snapshot.empty;
};

const ensureDefaultAdminAccount = async () => {
  try {
    await signInWithEmailAndPassword(auth, DEFAULT_ADMIN.email, DEFAULT_ADMIN.password);
  } catch (error) {
    const authError = error as { code?: string };

    if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
      const credential = await createUserWithEmailAndPassword(auth, DEFAULT_ADMIN.email, DEFAULT_ADMIN.password);
      await updateProfile(credential.user, { displayName: DEFAULT_ADMIN.name });
      await upsertUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: DEFAULT_ADMIN.name,
      }, 'admin');
    } else if (authError.code !== 'auth/email-already-in-use') {
      throw error;
    }
  }

  if (auth.currentUser && normalizeEmail(auth.currentUser.email || '') === normalizeEmail(DEFAULT_ADMIN.email)) {
    if (auth.currentUser.displayName !== DEFAULT_ADMIN.name) {
      await updateProfile(auth.currentUser, { displayName: DEFAULT_ADMIN.name });
    }

    const adminDocRef = doc(db, 'users', auth.currentUser.uid);
    const adminSnapshot = await getDoc(adminDocRef);
    const existingCreatedAt = adminSnapshot.exists() ? adminSnapshot.data().createdAt ?? null : null;

    await upsertUserProfile({
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: DEFAULT_ADMIN.name,
    }, 'admin', existingCreatedAt);

    await signOut(auth);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authSetupError, setAuthSetupError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;

        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnapshot = await getDoc(userDocRef);
        const storedData = userSnapshot.exists() ? userSnapshot.data() : null;
        const role = normalizeEmail(firebaseUser.email || '') === normalizeEmail(DEFAULT_ADMIN.email)
          ? 'admin'
          : ((storedData?.role as 'admin' | 'customer' | undefined) ?? 'customer');
        const displayName = firebaseUser.displayName || storedData?.displayName || firebaseUser.email?.split('@')[0] || 'User';

        await upsertUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName,
        }, role, storedData?.createdAt ?? null);

        setUser({
          uid: firebaseUser.uid,
          name: displayName,
          email: firebaseUser.email || '',
          role,
        });
        setLoading(false);
      });

      if (!auth.currentUser) {
        void ensureDefaultAdminAccount().catch((error) => {
          const authError = error as { code?: string };
          if (authError.code === 'auth/email-already-in-use') {
            return;
          }
          console.error('Admin bootstrap error:', error);
          if (isMounted) {
            setAuthSetupError(mapFirebaseAuthError(error));
          }
        });
      }

      return unsubscribe;
    };

    let unsubscribeAuth: (() => void) | undefined;

    initializeAuth().then((unsubscribe) => {
      unsubscribeAuth = unsubscribe;
    });

    return () => {
      isMounted = false;
      unsubscribeAuth?.();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw new Error('Email is required.');
    }

    if (!password) {
      throw new Error('Password is required.');
    }

    try {
      setAuthSetupError(null);
      if (normalizedEmail === normalizeEmail(ADMIN_EMAIL)) {
        await ensureDefaultAdminAccount();
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
        return;
      }

      const userExists = await doesUserExist(normalizedEmail);
      if (!userExists) {
        throw new Error('Account does not exist. Please register first.');
      }

      await signInWithEmailAndPassword(auth, normalizedEmail, password);
    } catch (error) {
      const authError = error as { code?: string };
      if (authError.code === 'auth/invalid-credential') {
        throw new Error('Invalid password.');
      }
      throw new Error(mapFirebaseAuthError(error));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error('Name is required.');
    }

    if (!normalizedEmail) {
      throw new Error('Email is required.');
    }

    if (normalizedEmail === normalizeEmail(ADMIN_EMAIL)) {
      throw new Error('This email is reserved for the admin account. Please use the admin login credentials.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    try {
      setAuthSetupError(null);
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await updateProfile(credential.user, { displayName: trimmedName });
      await upsertUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: trimmedName,
      }, 'customer');
    } catch (error) {
      throw new Error(mapFirebaseAuthError(error));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const isAdmin = Boolean(
    user &&
    (user.role === 'admin' || normalizeEmail(user.email) === normalizeEmail(ADMIN_EMAIL))
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, authSetupError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
