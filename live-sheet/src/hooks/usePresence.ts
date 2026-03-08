'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    doc,
    setDoc,
    deleteDoc,
    collection,
    onSnapshot,
} from 'firebase/firestore';
import {
    ref as rtdbRef,
    set,
    onDisconnect,
} from 'firebase/database';
import { getDb, getRtdb } from '@/services/firebase/firebaseConfig';
import type { UserPresence, UserIdentity } from '@/types';

const PRESENCE_COLLECTION = 'presence';
const HEARTBEAT_INTERVAL = 30_000;
const STALE_THRESHOLD = 60_000;

export function usePresence(docId: string | null, user: UserIdentity | null) {
    const [presenceList, setPresenceList] = useState<UserPresence[]>([]);
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const updateSelectedCell = useCallback(
        async (selectedCell: string | null) => {
            if (!docId || !user) return;

            try {
                const presRef = doc(getDb(), PRESENCE_COLLECTION, docId, 'users', user.uid);
                await setDoc(
                    presRef,
                    {
                        uid: user.uid,
                        displayName: user.displayName,
                        color: user.color,
                        photoURL: user.photoURL || null,
                        selectedCell: selectedCell || null,
                        lastActive: Date.now(),
                    },
                    { merge: true }
                );
            } catch {
                // Silently ignore presence update errors
            }
        },
        [docId, user]
    );

    useEffect(() => {
        if (!docId || !user) return;

        const presRef = doc(getDb(), PRESENCE_COLLECTION, docId, 'users', user.uid);

        const setPresence = async () => {
            await setDoc(presRef, {
                uid: user.uid,
                displayName: user.displayName,
                color: user.color,
                photoURL: user.photoURL || null,
                selectedCell: null,
                lastActive: Date.now(),
            });
        };

        setPresence();

        // RTDB presence for disconnect cleanup
        try {
            const rtdb = getRtdb();
            if (rtdb) {
                const rtdbPresRef = rtdbRef(rtdb, `presence/${docId}/${user.uid}`);
                set(rtdbPresRef, { online: true, lastActive: Date.now() });
                onDisconnect(rtdbPresRef).remove();
            }
        } catch {
            // RTDB may not be configured
        }

        // Heartbeat
        heartbeatRef.current = setInterval(async () => {
            try {
                await setDoc(presRef, { lastActive: Date.now() }, { merge: true });
            } catch {
                // Ignore heartbeat errors
            }
        }, HEARTBEAT_INTERVAL);

        // Subscribe to presence changes
        const presCollection = collection(getDb(), PRESENCE_COLLECTION, docId, 'users');
        const unsubscribe = onSnapshot(presCollection, (snapshot) => {
            const now = Date.now();
            const users: UserPresence[] = [];

            snapshot.docs.forEach((d) => {
                const data = d.data() as UserPresence;
                if (now - data.lastActive < STALE_THRESHOLD) {
                    users.push(data);
                }
            });

            setPresenceList(users);
        });

        return () => {
            unsubscribe();
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
            }
            deleteDoc(presRef).catch(() => { });
        };
    }, [docId, user]);

    // Cleanup on page close
    useEffect(() => {
        if (!docId || !user) return;

        const handleBeforeUnload = () => {
            const presRef = doc(getDb(), PRESENCE_COLLECTION, docId, 'users', user.uid);
            deleteDoc(presRef).catch(() => { });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [docId, user]);

    return { presenceList, updateSelectedCell };
}
