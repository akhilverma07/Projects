import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, getDocs, query, setDoc, collection, where } from 'firebase/firestore';
import { resolveAdminScope, resolveUserRole } from '../lib/roles';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const normalizedEmail = email.trim().toLowerCase();
        // Fetch additional user data from Firestore (like role)
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let roleFromDoc: string | undefined;
        let scopeFromDoc: string | undefined;
        let nameFromDoc: string | undefined;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          roleFromDoc = userData.role;
          scopeFromDoc = userData.admin_scope;
          nameFromDoc = userData.name;
        }

        // Auto-upgrade approved partners to admin (own scope)
        if (normalizedEmail) {
          const partnerQuery = query(
            collection(db, 'partner_applications'),
            where('email_lower', '==', normalizedEmail),
            where('status', '==', 'confirmed')
          );
          const partnerDocs = await getDocs(partnerQuery);
          if (!partnerDocs.empty && roleFromDoc !== 'admin') {
            roleFromDoc = 'admin';
            scopeFromDoc = 'own';
            await setDoc(
              doc(db, 'users', firebaseUser.uid),
              {
                name: nameFromDoc || firebaseUser.displayName || 'User',
                email,
                email_lower: normalizedEmail,
                role: 'admin',
                admin_scope: 'own'
              },
              { merge: true }
            );
          }
        }

        setUser({
          id: firebaseUser.uid,
          email,
          name: nameFromDoc || firebaseUser.displayName || 'User',
          role: resolveUserRole(email, roleFromDoc),
          adminScope: resolveAdminScope(email, scopeFromDoc)
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (user: User) => setUser(user);
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
