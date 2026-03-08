'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useDocument } from '@/hooks/useDocument';
import { useCells } from '@/hooks/useCells';
import { usePresence } from '@/hooks/usePresence';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { SpreadsheetProvider, useSpreadsheet } from '@/context/SpreadsheetContext';
import SpreadsheetGrid from '@/components/spreadsheet/SpreadsheetGrid';
import FormulaBar from '@/components/spreadsheet/FormulaBar';
import Toolbar from '@/components/spreadsheet/Toolbar';
import PresenceList from '@/components/presence/PresenceList';
import WriteStatusIndicator from '@/components/ui/WriteStatusIndicator';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ChartRenderer from '@/components/spreadsheet/Chart';
import CommentPopover from '@/components/spreadsheet/CommentPopover';
import { updateDocumentTitle } from '@/services/firebase/firestore';
import { exportToCSV } from '@/services/export/csvExport';
import { importCSVFile } from '@/services/import/csvImport';
import type { CellData } from '@/types';

function EditorContent({ docId }: { docId: string }) {
    const { user } = useUser();
    const { document: spreadsheetDoc, loading: docLoading } = useDocument(docId);
    const { cells, updateCell, writeStatus } = useCells(docId);
    const { presenceList, updateSelectedCell } = usePresence(docId, user);
    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [copied, setCopied] = useState(false);

    const spreadsheet = useSpreadsheet();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [commentPopover, setCommentPopover] = useState<{
        cellId: string; x: number; y: number;
    } | null>(null);

    // Sync cells from Firestore to context
    useEffect(() => {
        spreadsheet.setCells(cells);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cells]);

    useEffect(() => {
        spreadsheet.setWriteStatus(writeStatus);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [writeStatus]);

    useEffect(() => {
        spreadsheet.setPresenceList(presenceList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presenceList]);

    useEffect(() => {
        updateSelectedCell(spreadsheet.selectedCell);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spreadsheet.selectedCell]);

    useEffect(() => {
        if (spreadsheetDoc) {
            setTitle(spreadsheetDoc.title);
        }
    }, [spreadsheetDoc]);

    useKeyboardNavigation();

    // Show comment popover
    useEffect(() => {
        if (spreadsheet.selectedCell && spreadsheet.comments[spreadsheet.selectedCell]) {
            const el = document.querySelector(`[data-cell="${spreadsheet.selectedCell}"]`) as HTMLElement;
            if (el) {
                const rect = el.getBoundingClientRect();
                setCommentPopover({
                    cellId: spreadsheet.selectedCell,
                    x: rect.right + 4,
                    y: rect.top,
                });
            }
        } else {
            setCommentPopover(null);
        }
    }, [spreadsheet.selectedCell, spreadsheet.comments]);

    const handleTitleBlur = useCallback(async () => {
        setEditingTitle(false);
        if (title.trim() && title !== spreadsheetDoc?.title) {
            await updateDocumentTitle(docId, title.trim());
        }
    }, [docId, title, spreadsheetDoc?.title]);

    const handleExport = useCallback(() => {
        exportToCSV(cells);
    }, [cells]);

    const handleShare = useCallback(() => {
        const url = window.location.href;

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
    }, []);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImportFile = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                const importedCells = await importCSVFile(file);
                spreadsheet.bulkSetCells(importedCells);
            } catch (err) {
                console.error('CSV import error:', err);
            }

            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        [spreadsheet]
    );

    if (docLoading) {
        return (
            <div className="landing-loading">
                <div className="spinner" />
            </div>
        );
    }

    if (!spreadsheetDoc) {
        return (
            <div className="editor-error">
                <h2>Document not found</h2>
                <p>This document may have been deleted.</p>
                <a href="/dashboard" className="btn btn-primary">Back to Dashboard</a>
            </div>
        );
    }

    return (
        <div className="editor-container">
            <header className="editor-header">
                <div className="editor-header-left">
                    <a href="/dashboard" className="editor-back-btn" title="Back to Dashboard">
                        ←
                    </a>
                    {editingTitle ? (
                        <input
                            className="editor-title-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleBlur}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                            autoFocus
                        />
                    ) : (
                        <h1
                            className="editor-title"
                            onClick={() => setEditingTitle(true)}
                            title="Click to rename"
                        >
                            {title || 'Untitled'}
                        </h1>
                    )}
                    <WriteStatusIndicator status={writeStatus} />
                </div>
                <div className="editor-header-right">
                    <button onClick={handleImportClick} className="btn btn-ghost btn-sm" id="import-csv-btn">
                        📤 Import
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={handleImportFile}
                    />
                    <button onClick={handleExport} className="btn btn-ghost btn-sm" id="export-csv-btn">
                        📥 Export
                    </button>
                    <button onClick={handleShare} className="btn btn-primary btn-sm" id="share-btn">
                        {copied ? '✓ Copied!' : '🔗 Share'}
                    </button>
                    <PresenceList users={presenceList} currentUserId={user?.uid} />
                    <ThemeToggle />
                </div>
            </header>

            <Toolbar />
            <FormulaBar />

            <div className="editor-grid-container" style={{ position: 'relative' }}>
                <SpreadsheetGrid />

                {spreadsheet.charts.map((chart) => (
                    <ChartRenderer
                        key={chart.id}
                        chart={chart}
                        cells={spreadsheet.cells}
                        onRemove={() => spreadsheet.removeChart(chart.id)}
                    />
                ))}

                {commentPopover && spreadsheet.comments[commentPopover.cellId] && (
                    <CommentPopover
                        cellId={commentPopover.cellId}
                        text={spreadsheet.comments[commentPopover.cellId].text}
                        author={spreadsheet.comments[commentPopover.cellId].author}
                        x={commentPopover.x}
                        y={commentPopover.y}
                        onEdit={(text) => spreadsheet.setComment(commentPopover.cellId, text, 'You')}
                        onDelete={() => spreadsheet.deleteComment(commentPopover.cellId)}
                        onClose={() => setCommentPopover(null)}
                    />
                )}
            </div>
        </div>
    );
}

function EditorWithProvider({ docId }: { docId: string }) {
    const { cells, updateCell } = useCells(docId);

    const handleCellUpdate = useCallback(
        async (cellId: string, data: CellData) => {
            await updateCell(cellId, data);
        },
        [updateCell]
    );

    return (
        <SpreadsheetProvider onCellUpdate={handleCellUpdate} initialCells={cells}>
            <EditorContent docId={docId} />
        </SpreadsheetProvider>
    );
}

export default function SpreadsheetEditorPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useUser();
    const docId = params.id as string;

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="landing-loading">
                <div className="spinner" />
            </div>
        );
    }

    return <EditorWithProvider docId={docId} />;
}
