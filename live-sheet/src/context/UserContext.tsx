'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getAppAuth } from '@/services/firebase/firebaseConfig';
import { getPresenceColor } from '@/constants/colors';
import type { UserIdentity } from '@/types';

interface UserContextValue {
    user: UserIdentity | null;
    firebaseUser: User | null;
    loading: boolean;
}

const UserContext = createContext<UserContextValue>({
    user: null,
    firebaseUser: null,
    loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserIdentity | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAppAuth(), (fbUser) => {
            if (fbUser) {
                setFirebaseUser(fbUser);
                setUser({
                    uid: fbUser.uid,
                    displayName: fbUser.displayName || 'Anonymous',
                    color: getPresenceColor(fbUser.uid),
                    photoURL: fbUser.photoURL || undefined,
                    isAnonymous: fbUser.isAnonymous,
                });
            } else {
                setFirebaseUser(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ user, firebaseUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextValue {
    return useContext(UserContext);
}
