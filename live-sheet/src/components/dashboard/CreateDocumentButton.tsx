'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { createDocument } from '@/services/firebase/firestore';

export default function CreateDocumentButton() {
    const router = useRouter();
    const { user } = useUser();
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = useCallback(async () => {
        if (!title.trim() || !user) return;
        setCreating(true);
        try {
            const docId = await createDocument(title.trim(), user.uid, user.displayName);
            setShowModal(false);
            setTitle('');
            router.push(`/doc/${docId}`);
        } catch (error) {
            console.error('Error creating document:', error);
        } finally {
            setCreating(false);
        }
    }, [title, user, router]);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="create-doc-btn"
                id="create-doc-btn"
            >
                <span className="create-doc-icon">+</span>
                <span>New Spreadsheet</span>
            </button>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Create New Spreadsheet</h2>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter spreadsheet title"
                            className="modal-input"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                            maxLength={60}
                            id="new-doc-title-input"
                        />
                        <div className="modal-actions">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={!title.trim() || creating}
                                id="create-doc-submit-btn"
                            >
                                {creating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
