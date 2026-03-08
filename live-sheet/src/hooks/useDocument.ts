'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getDb } from '@/services/firebase/firebaseConfig';
import type { SpreadsheetDocument } from '@/types';

export function useDocument(docId: string | null) {
    const [document, setDocument] = useState<SpreadsheetDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!docId) {
            setLoading(false);
            return;
        }

        const ref = doc(getDb(), 'documents', docId);
        const unsubscribe = onSnapshot(ref, (snapshot) => {
            if (snapshot.exists()) {
                setDocument({
                    id: snapshot.id,
                    ...snapshot.data(),
                } as SpreadsheetDocument);
            } else {
                setDocument(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [docId]);

    return { document, loading };
}
