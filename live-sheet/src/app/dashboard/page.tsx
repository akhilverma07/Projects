'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { subscribeToDocuments, deleteDocument } from '@/services/firebase/firestore';
import { signOut } from '@/services/firebase/auth';
import DocumentCard from '@/components/dashboard/DocumentCard';
import CreateDocumentButton from '@/components/dashboard/CreateDocumentButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
import type { SpreadsheetDocument } from '@/types';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading } = useUser();
    const [documents, setDocuments] = useState<SpreadsheetDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToDocuments((docs) => {
            setDocuments(docs);
            setDocsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleDelete = useCallback(async (docId: string) => {
        try {
            await deleteDocument(docId);
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    }, []);

    const handleSignOut = useCallback(async () => {
        await signOut();
        router.push('/');
    }, [router]);

    if (loading || !user) {
        return (
            <div className="landing-loading">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="dashboard-logo">
                        <svg width="32" height="32" viewBox="0 0 52 52" fill="none">
                            <rect x="4" y="4" width="44" height="44" rx="10" fill="var(--color-primary-10)" stroke="var(--color-primary)" strokeWidth="2" />
                            <line x1="4" y1="18" x2="48" y2="18" stroke="var(--color-primary-40)" strokeWidth="1.5" />
                            <line x1="20" y1="4" x2="20" y2="48" stroke="var(--color-primary-40)" strokeWidth="1.5" />
                        </svg>
                    </div>
                    <h1 className="dashboard-title">LiveSheet</h1>
                </div>
                <div className="dashboard-header-right">
                    <div className="dashboard-user">
                        <span className="dashboard-user-name">{user.displayName}</span>
                        <div
                            className="dashboard-user-avatar"
                            style={{ backgroundColor: user.color }}
                        >
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} />
                            ) : (
                                user.displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                    <ThemeToggle />
                    <button onClick={handleSignOut} className="btn btn-ghost btn-sm" id="signout-btn">
                        Sign out
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-toolbar">
                    <h2 className="dashboard-section-title">Your Spreadsheets</h2>
                    <CreateDocumentButton />
                </div>

                {docsLoading ? (
                    <div className="dashboard-loading">
                        <div className="spinner" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="dashboard-empty">
                        <div className="dashboard-empty-icon">📊</div>
                        <h3>No spreadsheets yet</h3>
                        <p>Create your first spreadsheet to get started.</p>
                    </div>
                ) : (
                    <div className="dashboard-grid">
                        {documents.map((doc) => (
                            <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
