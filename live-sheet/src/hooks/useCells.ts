'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { getDb } from '@/services/firebase/firebaseConfig';
import type { CellData, CellMap, WriteStatus } from '@/types';

const CELLS_COLLECTION = 'cells';

interface UseCellsReturn {
    cells: CellMap;
    updateCell: (cellId: string, data: CellData) => Promise<void>;
    writeStatus: WriteStatus;
}

export function useCells(docId: string | null): UseCellsReturn {
    const [cells, setCells] = useState<CellMap>({});
    const [writeStatus, setWriteStatus] = useState<WriteStatus>('idle');
    const writeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!docId) return;

        const ref = doc(getDb(), CELLS_COLLECTION, docId);
        const unsubscribe = onSnapshot(
            ref,
            (snapshot) => {
                if (snapshot.exists()) {
                    setCells(snapshot.data() as CellMap);
                } else {
                    setCells({});
                }

                if (writeTimeoutRef.current) {
                    clearTimeout(writeTimeoutRef.current);
                }
                setWriteStatus((prev) => (prev === 'saving' ? 'saved' : prev));

                writeTimeoutRef.current = setTimeout(() => {
                    setWriteStatus('idle');
                }, 2000);
            },
            (error) => {
                console.error('Cell subscription error:', error);
                setWriteStatus('error');
            }
        );

        return () => {
            unsubscribe();
            if (writeTimeoutRef.current) {
                clearTimeout(writeTimeoutRef.current);
            }
        };
    }, [docId]);

    const updateCell = useCallback(
        async (cellId: string, data: CellData) => {
            if (!docId) return;

            setWriteStatus('saving');

            try {
                const ref = doc(getDb(), CELLS_COLLECTION, docId);
                await updateDoc(ref, { [cellId]: data });

                const docRef = doc(getDb(), 'documents', docId);
                await updateDoc(docRef, { updatedAt: Date.now() });

                setWriteStatus('saved');

                if (writeTimeoutRef.current) {
                    clearTimeout(writeTimeoutRef.current);
                }
                writeTimeoutRef.current = setTimeout(() => {
                    setWriteStatus('idle');
                }, 2000);
            } catch (error) {
                console.error('Error updating cell:', error);
                setWriteStatus('error');
            }
        },
        [docId]
    );

    return { cells, updateCell, writeStatus };
}
