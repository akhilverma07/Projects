'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { useSpreadsheet } from '@/context/SpreadsheetContext';
import type { CellFormat } from '@/types';

interface SheetCellProps {
    cellId: string;
    style: React.CSSProperties;
}

export default function SheetCell({ cellId, style }: SheetCellProps) {
    const ctx = useSpreadsheet();
    const inputRef = useRef<HTMLInputElement>(null);

    const isSelected = ctx.selectedCell === cellId;
    const isEditing = ctx.editingCell === cellId;
    const displayValue = ctx.getCellDisplayValue(cellId);
    const rawValue = ctx.getCellRawValue(cellId);
    const format = ctx.getCellFormat(cellId);
    const hasComment = !!ctx.comments[cellId];
    const conditionalStyle = ctx.getCellConditionalStyle(cellId);

    // Presence: check if another user has selected this cell
    const presenceUser = ctx.presenceList.find(
        (u) => u.selectedCell === cellId
    );

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(
                inputRef.current.value.length,
                inputRef.current.value.length
            );
        }
    }, [isEditing]);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.shiftKey && ctx.selectedCell) {
                ctx.setSelectionRange({
                    start: ctx.selectedCell,
                    end: cellId,
                });
            } else {
                ctx.setSelectedCell(cellId);
                ctx.setSelectionRange(null);
                if (ctx.editingCell && ctx.editingCell !== cellId) {
                    // Commit previous edit
                    const prevFormat = ctx.getCellFormat(ctx.editingCell);
                    ctx.onCellChange(ctx.editingCell, ctx.editValue, prevFormat);
                    ctx.setEditingCell(null);
                    ctx.setEditValue('');
                }
            }
        },
        [ctx, cellId]
    );

    const handleDoubleClick = useCallback(() => {
        ctx.setEditingCell(cellId);
        ctx.setEditValue(rawValue);
    }, [ctx, cellId, rawValue]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button !== 0) return; // Only left click
            if (!e.shiftKey) {
                ctx.setSelectedCell(cellId);
            }
        },
        [ctx, cellId]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            ctx.setEditValue(e.target.value);
        },
        [ctx]
    );

    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            ctx.setSelectedCell(cellId);
        },
        [ctx, cellId]
    );

    // Build cell styles from format
    const cellStyle: React.CSSProperties = {
        ...style,
        fontWeight: format?.bold ? 700 : undefined,
        fontStyle: format?.italic ? 'italic' : undefined,
        textDecoration: format?.underline ? 'underline' : undefined,
        fontSize: format?.fontSize ? `${format.fontSize}px` : undefined,
        fontFamily: format?.fontFamily || undefined,
        textAlign: format?.textAlign || 'left',
        color: conditionalStyle?.textColor || format?.textColor || undefined,
        backgroundColor: conditionalStyle?.bgColor || format?.bgColor || undefined,
    };

    const className = [
        'sheet-cell',
        isSelected ? 'sheet-cell-selected' : '',
        isEditing ? 'sheet-cell-editing' : '',
        presenceUser ? 'sheet-cell-presence' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={className}
            style={cellStyle}
            data-cell={cellId}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
            title={hasComment ? `💬 ${ctx.comments[cellId].text}` : undefined}
        >
            {hasComment && <span className="cell-comment-indicator" />}
            {presenceUser && (
                <span
                    className="cell-presence-border"
                    style={{ borderColor: presenceUser.color }}
                />
            )}
            {isEditing ? (
                <input
                    ref={inputRef}
                    className="cell-input"
                    value={ctx.editValue}
                    onChange={handleInputChange}
                    autoFocus
                />
            ) : (
                <span className="cell-value">{displayValue}</span>
            )}
        </div>
    );
}
