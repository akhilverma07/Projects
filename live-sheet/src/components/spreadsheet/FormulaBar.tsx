'use client';

import React, { useCallback } from 'react';
import { useSpreadsheet } from '@/context/SpreadsheetContext';

export default function FormulaBar() {
    const ctx = useSpreadsheet();

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            ctx.setEditValue(e.target.value);
        },
        [ctx]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (ctx.editingCell) {
                    const format = ctx.getCellFormat(ctx.editingCell);
                    ctx.onCellChange(ctx.editingCell, ctx.editValue, format);
                    ctx.setEditingCell(null);
                    ctx.setEditValue('');
                } else if (ctx.selectedCell) {
                    ctx.setEditingCell(ctx.selectedCell);
                    ctx.setEditValue(ctx.getCellRawValue(ctx.selectedCell));
                }
            } else if (e.key === 'Escape') {
                ctx.setEditingCell(null);
                ctx.setEditValue('');
            }
        },
        [ctx]
    );

    const handleFocus = useCallback(() => {
        if (ctx.selectedCell && !ctx.editingCell) {
            ctx.setEditingCell(ctx.selectedCell);
            ctx.setEditValue(ctx.getCellRawValue(ctx.selectedCell));
        }
    }, [ctx]);

    const displayRef = ctx.selectedCell || '';
    const displayValue = ctx.editingCell
        ? ctx.editValue
        : ctx.selectedCell
            ? ctx.getCellRawValue(ctx.selectedCell)
            : '';

    return (
        <div className="formula-bar" id="formula-bar">
            <div className="formula-bar-ref">
                {displayRef}
            </div>
            <div className="formula-bar-separator">
                <span className="formula-bar-fx">fx</span>
            </div>
            <input
                className="formula-bar-input"
                value={displayValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                placeholder="Enter a value or formula"
                id="formula-input"
            />
        </div>
    );
}
