'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SpreadsheetDocument } from '@/types';
import { format } from 'date-fns';

interface DocumentCardProps {
    doc: SpreadsheetDocument;
    onDelete: (id: string) => void;
}

export default function DocumentCard({ doc, onDelete }: DocumentCardProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const handleClick = useCallback(() => {
        router.push(`/doc/${doc.id}`);
    }, [router, doc.id]);

    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
                onDelete(doc.id);
            }
        },
        [doc, onDelete]
    );

    const handleShare = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/doc/${doc.id}`;

        const copyFallback = () => {
            const el = document.createElement('textarea');
            el.value = url;
            document.body.appendChild(el);
            el.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(el);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(copyFallback);
        } else {
            copyFallback();
        }
    }, [doc.id]);

    const updatedAt = doc.updatedAt ? format(new Date(doc.updatedAt), 'MMM d, yyyy · h:mm a') : '';

    return (
        <div className="document-card" onClick={handleClick} id={`doc-card-${doc.id}`}>
            <div className="document-card-preview">
                <svg width="100%" height="100%" viewBox="0 0 120 80" fill="none">
                    <rect x="0" y="0" width="120" height="20" fill="var(--color-primary-10)" />
                    <rect x="0" y="20" width="40" height="15" stroke="var(--color-border)" strokeWidth="0.5" fill="none" />
                    <rect x="40" y="20" width="40" height="15" stroke="var(--color-border)" strokeWidth="0.5" fill="none" />
                    <rect x="80" y="20" width="40" height="15" stroke="var(--color-border)" strokeWidth="0.5" fill="none" />
                    <rect x="0" y="35" width="40" height="15" stroke="var(--color-border)" strokeWidth="0.5" fill="none" />
                    <rect x="40" y="35" width="40" height="15" stroke="var(--color-border)" strokeWidth="0.5" fill="none" />
                    <rect x="80" y="35" width="40" height="15" stroke="var(--color-border)" strokeWidth="0.5" fill="none" />
                    <rect x="0" y="50" width="40" height="15" stroke="var(--color-border)" strokeWidth="0.5" fill="none" />
                    <rect x="40" y="50" width="40" height="15" stroke="var(--color-border)" strokeWidth="0.5" fill="none" />
                    <rect x="80" y="50" width="40" height="15" stroke="var(--color-border)" strokeWidth="0.5" fill="none" />
                </svg>
            </div>
            <div className="document-card-info">
                <h3 className="document-card-title">{doc.title || 'Untitled'}</h3>
                <p className="document-card-meta">
                    <span>{doc.createdByName || 'Unknown'}</span>
                    <span className="document-card-dot">·</span>
                    <span>{updatedAt}</span>
                </p>
            </div>
            <button
                className="document-card-share"
                onClick={handleShare}
                title="Copy share link"
            >
                {copied ? '✓' : '🔗'}
            </button>
            <button
                className="document-card-delete"
                onClick={handleDelete}
                title="Delete spreadsheet"
            >
                ×
            </button>
        </div>
    );
}
