import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    onSnapshot,
    setDoc,
} from 'firebase/firestore';
import { getDb } from './firebaseConfig';
import type { SpreadsheetDocument } from '@/types';

const DOCUMENTS_COLLECTION = 'documents';
const CELLS_COLLECTION = 'cells';

export async function createDocument(
    title: string,
    userId: string,
    userName: string
): Promise<string> {
    const now = Date.now();
    const docRef = await addDoc(collection(getDb(), DOCUMENTS_COLLECTION), {
        title,
        createdBy: userId,
        createdByName: userName,
        createdAt: now,
        updatedAt: now,
    });

    // Create empty cells document
    await setDoc(doc(getDb(), CELLS_COLLECTION, docRef.id), {});

    return docRef.id;
}

export async function deleteDocument(docId: string): Promise<void> {
    await deleteDoc(doc(getDb(), DOCUMENTS_COLLECTION, docId));
    // Also delete cells doc
    try {
        await deleteDoc(doc(getDb(), CELLS_COLLECTION, docId));
    } catch {
        // Cells doc may not exist
    }
}

export async function updateDocumentTitle(docId: string, title: string): Promise<void> {
    await updateDoc(doc(getDb(), DOCUMENTS_COLLECTION, docId), {
        title,
        updatedAt: Date.now(),
    });
}

export function subscribeToDocuments(
    callback: (docs: SpreadsheetDocument[]) => void
): () => void {
    const q = query(
        collection(getDb(), DOCUMENTS_COLLECTION),
        orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as SpreadsheetDocument[];
        callback(docs);
    });
}
