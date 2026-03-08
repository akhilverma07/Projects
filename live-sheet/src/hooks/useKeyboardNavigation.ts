'use client';

import { useEffect, useCallback } from 'react';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import { getColumnLabel, getColumnIndex, parseCellId, getCellId, DEFAULT_COL_COUNT, DEFAULT_ROW_COUNT } from '../constants/grid';

export function useKeyboardNavigation() {
    const ctx = useSpreadsheet();

    const navigate = useCallback(
        (colDelta: number, rowDelta: number, extend?: boolean) => {
            if (!ctx.selectedCell) return;
            const parsed = parseCellId(ctx.selectedCell);
            if (!parsed) return;

            const newCol = Math.max(0, Math.min(parsed.colIndex + colDelta, DEFAULT_COL_COUNT - 1));
            const newRow = Math.max(1, Math.min(parsed.row + rowDelta, DEFAULT_ROW_COUNT));
            const newId = getCellId(newCol, newRow);

            if (extend) {
                const range = ctx.selectionRange || { start: ctx.selectedCell, end: ctx.selectedCell };
                ctx.setSelectionRange({ start: range.start, end: newId });
            } else {
                ctx.setSelectionRange(null);
            }

            ctx.setSelectedCell(newId);
        },
        [ctx]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't capture keys when typing in non-cell inputs
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT'
            ) {
                // Allow if it's the formula bar or cell input
                if (!target.closest('.formula-bar-input') && !target.closest('.cell-input')) {
                    return;
                }
            }

            const isEditing = ctx.editingCell !== null;

            // Ctrl combinations
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'c':
                        e.preventDefault();
                        ctx.copySelection();
                        return;
                    case 'x':
                        e.preventDefault();
                        ctx.cutSelection();
                        return;
                    case 'v':
                        e.preventDefault();
                        ctx.pasteSelection();
                        return;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            ctx.performRedo();
                        } else {
                            ctx.performUndo();
                        }
                        return;
                    case 'y':
                        e.preventDefault();
                        ctx.performRedo();
                        return;
                }
            }

            if (isEditing) {
                switch (e.key) {
                    case 'Escape':
                        e.preventDefault();
                        ctx.setEditingCell(null);
                        ctx.setEditValue('');
                        return;
                    case 'Enter':
                        e.preventDefault();
                        // Commit current edit
                        if (ctx.editingCell) {
                            const format = ctx.getCellFormat(ctx.editingCell);
                            ctx.onCellChange(ctx.editingCell, ctx.editValue, format);
                            ctx.setEditingCell(null);
                            ctx.setEditValue('');
                            navigate(0, e.shiftKey ? -1 : 1);
                        }
                        return;
                    case 'Tab':
                        e.preventDefault();
                        if (ctx.editingCell) {
                            const format = ctx.getCellFormat(ctx.editingCell);
                            ctx.onCellChange(ctx.editingCell, ctx.editValue, format);
                            ctx.setEditingCell(null);
                            ctx.setEditValue('');
                            navigate(e.shiftKey ? -1 : 1, 0);
                        }
                        return;
                }
                return; // Let other keys pass through to the input
            }

            // Non-editing navigation
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    navigate(0, -1, e.shiftKey);
                    return;
                case 'ArrowDown':
                    e.preventDefault();
                    navigate(0, 1, e.shiftKey);
                    return;
                case 'ArrowLeft':
                    e.preventDefault();
                    navigate(-1, 0, e.shiftKey);
                    return;
                case 'ArrowRight':
                    e.preventDefault();
                    navigate(1, 0, e.shiftKey);
                    return;
                case 'Tab':
                    e.preventDefault();
                    navigate(e.shiftKey ? -1 : 1, 0);
                    return;
                case 'Enter':
                    e.preventDefault();
                    navigate(0, e.shiftKey ? -1 : 1);
                    return;
                case 'F2':
                    e.preventDefault();
                    if (ctx.selectedCell) {
                        ctx.setEditingCell(ctx.selectedCell);
                        ctx.setEditValue(ctx.getCellRawValue(ctx.selectedCell));
                    }
                    return;
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    if (ctx.selectedCell) {
                        ctx.onCellChange(ctx.selectedCell, '');
                    }
                    return;
                case 'Escape':
                    ctx.setSelectionRange(null);
                    return;
            }

            // Start typing in cell — any printable character
            if (
                e.key.length === 1 &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.altKey &&
                ctx.selectedCell
            ) {
                e.preventDefault();
                ctx.setEditingCell(ctx.selectedCell);
                ctx.setEditValue(e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [ctx, navigate]);
}
