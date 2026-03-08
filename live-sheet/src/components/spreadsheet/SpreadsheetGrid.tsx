'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useSpreadsheet } from '@/context/SpreadsheetContext';
import SheetCell from './SheetCell';
import ContextMenu from './ContextMenu';
import {
    DEFAULT_COL_COUNT,
    DEFAULT_ROW_COUNT,
    DEFAULT_COL_WIDTH,
    DEFAULT_ROW_HEIGHT,
    ROW_HEADER_WIDTH,
    getColumnLabel,
    parseCellId,
    getCellId,
    getColumnIndex,
} from '@/constants/grid';
import type { ContextMenuItem } from '@/types';

export default function SpreadsheetGrid() {
    const ctx = useSpreadsheet();
    const gridRef = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        items: ContextMenuItem[];
    } | null>(null);

    // Column resize state
    const [resizingCol, setResizingCol] = useState<number | null>(null);
    const resizeStartX = useRef(0);
    const resizeStartWidth = useRef(0);

    // Row resize state
    const [resizingRow, setResizingRow] = useState<number | null>(null);
    const resizeStartY = useRef(0);
    const resizeStartHeight = useRef(0);

    const getColWidth = useCallback(
        (col: number) => ctx.columnWidths[col] || DEFAULT_COL_WIDTH,
        [ctx.columnWidths]
    );

    const getRowHeight = useCallback(
        (row: number) => ctx.rowHeights[row] || DEFAULT_ROW_HEIGHT,
        [ctx.rowHeights]
    );

    // Column resize handlers
    const handleColResizeStart = useCallback(
        (col: number, e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setResizingCol(col);
            resizeStartX.current = e.clientX;
            resizeStartWidth.current = getColWidth(col);

            const handleMove = (moveEvent: MouseEvent) => {
                const delta = moveEvent.clientX - resizeStartX.current;
                const newWidth = Math.max(40, resizeStartWidth.current + delta);
                ctx.setColumnWidth(col, newWidth);
            };

            const handleUp = () => {
                setResizingCol(null);
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
            };

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
        },
        [ctx, getColWidth]
    );

    // Row resize handlers
    const handleRowResizeStart = useCallback(
        (row: number, e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setResizingRow(row);
            resizeStartY.current = e.clientY;
            resizeStartHeight.current = getRowHeight(row);

            const handleMove = (moveEvent: MouseEvent) => {
                const delta = moveEvent.clientY - resizeStartY.current;
                const newHeight = Math.max(20, resizeStartHeight.current + delta);
                ctx.setRowHeight(row, newHeight);
            };

            const handleUp = () => {
                setResizingRow(null);
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
            };

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
        },
        [ctx, getRowHeight]
    );

    // Context menu
    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            if (!ctx.selectedCell) return;

            const parsed = parseCellId(ctx.selectedCell);
            if (!parsed) return;

            const items: ContextMenuItem[] = [
                { label: 'Cut', icon: '✂️', action: () => ctx.cutSelection() },
                { label: 'Copy', icon: '📋', action: () => ctx.copySelection() },
                { label: 'Paste', icon: '📌', action: () => ctx.pasteSelection() },
                { label: '', icon: '', action: () => { }, divider: true },
                { label: 'Insert Row Above', icon: '↑', action: () => ctx.insertRow(parsed.row - 1) },
                { label: 'Insert Row Below', icon: '↓', action: () => ctx.insertRow(parsed.row) },
                { label: 'Delete Row', icon: '🗑', action: () => ctx.deleteRow(parsed.row) },
                { label: '', icon: '', action: () => { }, divider: true },
                { label: 'Insert Column Left', icon: '←', action: () => ctx.insertColumn(parsed.colIndex - 1) },
                { label: 'Insert Column Right', icon: '→', action: () => ctx.insertColumn(parsed.colIndex) },
                { label: 'Delete Column', icon: '🗑', action: () => ctx.deleteColumn(parsed.colIndex) },
                { label: '', icon: '', action: () => { }, divider: true },
                { label: 'Sort A → Z', icon: '🔤', action: () => ctx.sortColumn(parsed.col, 'asc') },
                { label: 'Sort Z → A', icon: '🔤', action: () => ctx.sortColumn(parsed.col, 'desc') },
                { label: '', icon: '', action: () => { }, divider: true },
                {
                    label: ctx.comments[ctx.selectedCell] ? 'Edit Comment' : 'Add Comment',
                    icon: '💬',
                    action: () => {
                        const text = prompt('Enter comment:', ctx.comments[ctx.selectedCell!]?.text || '');
                        if (text !== null) {
                            ctx.setComment(ctx.selectedCell!, text, 'You');
                        }
                    },
                },
            ];

            setContextMenu({ x: e.clientX, y: e.clientY, items });
        },
        [ctx]
    );

    // Check if a cell is in selection range
    const isCellInSelection = useCallback(
        (cellId: string): boolean => {
            if (!ctx.selectionRange) return false;
            const s = parseCellId(ctx.selectionRange.start);
            const e = parseCellId(ctx.selectionRange.end);
            const c = parseCellId(cellId);
            if (!s || !e || !c) return false;

            const minCol = Math.min(s.colIndex, e.colIndex);
            const maxCol = Math.max(s.colIndex, e.colIndex);
            const minRow = Math.min(s.row, e.row);
            const maxRow = Math.max(s.row, e.row);

            return c.colIndex >= minCol && c.colIndex <= maxCol && c.row >= minRow && c.row <= maxRow;
        },
        [ctx.selectionRange]
    );

    const zoomScale = ctx.zoom / 100;

    return (
        <div
            className="spreadsheet-grid-wrapper"
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top left' }}
        >
            <div
                ref={gridRef}
                className={`spreadsheet-grid ${!ctx.showGridlines ? 'no-gridlines' : ''}`}
                onContextMenu={handleContextMenu}
                id="spreadsheet-grid"
            >
                {/* Corner cell */}
                <div
                    className="grid-corner"
                    style={{ width: ROW_HEADER_WIDTH, height: DEFAULT_ROW_HEIGHT }}
                />

                {/* Column headers */}
                {Array.from({ length: DEFAULT_COL_COUNT }, (_, colIndex) => (
                    <div
                        key={`col-${colIndex}`}
                        className="column-header"
                        style={{
                            width: getColWidth(colIndex),
                            height: DEFAULT_ROW_HEIGHT,
                            left: ROW_HEADER_WIDTH + Array.from({ length: colIndex }, (__, i) => getColWidth(i)).reduce((a, b) => a + b, 0),
                        }}
                    >
                        <span>{getColumnLabel(colIndex)}</span>
                        <div
                            className="col-resize-handle"
                            onMouseDown={(e) => handleColResizeStart(colIndex, e)}
                        />
                    </div>
                ))}

                {/* Rows */}
                {Array.from({ length: DEFAULT_ROW_COUNT }, (_, rowIdx) => {
                    const row = rowIdx + 1;
                    if (ctx.hiddenRows.has(row)) return null;
                    const rowTop = DEFAULT_ROW_HEIGHT + Array.from({ length: rowIdx }, (__, i) => getRowHeight(i + 1)).reduce((a, b) => a + b, 0);

                    return (
                        <React.Fragment key={`row-${row}`}>
                            {/* Row header */}
                            <div
                                className="row-header"
                                style={{
                                    width: ROW_HEADER_WIDTH,
                                    height: getRowHeight(row),
                                    top: rowTop,
                                }}
                            >
                                <span>{row}</span>
                                <div
                                    className="row-resize-handle"
                                    onMouseDown={(e) => handleRowResizeStart(row, e)}
                                />
                            </div>

                            {/* Cells */}
                            {Array.from({ length: DEFAULT_COL_COUNT }, (__, colIndex) => {
                                const cellId = getCellId(colIndex, row);
                                const cellLeft = ROW_HEADER_WIDTH + Array.from({ length: colIndex }, (___, i) => getColWidth(i)).reduce((a, b) => a + b, 0);
                                const inSelection = isCellInSelection(cellId);

                                return (
                                    <div
                                        key={cellId}
                                        className={inSelection ? 'cell-selection-highlight' : ''}
                                        style={{
                                            position: 'absolute',
                                            left: cellLeft,
                                            top: rowTop,
                                            width: getColWidth(colIndex),
                                            height: getRowHeight(row),
                                        }}
                                    >
                                        <SheetCell
                                            cellId={cellId}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={contextMenu.items}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
