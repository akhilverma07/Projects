'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useSpreadsheet } from '@/context/SpreadsheetContext';
import { TEXT_COLORS, BG_COLORS, FONT_FAMILIES, FONT_SIZES } from '@/constants/colors';
import type { CellFormat, NumberFormatType } from '@/types';

export default function Toolbar() {
    const ctx = useSpreadsheet();
    const [showFontFamily, setShowFontFamily] = useState(false);
    const [showFontSize, setShowFontSize] = useState(false);
    const [showTextColor, setShowTextColor] = useState(false);
    const [showBgColor, setShowBgColor] = useState(false);
    const [showNumberFormat, setShowNumberFormat] = useState(false);
    const [showZoom, setShowZoom] = useState(false);

    const closeAll = useCallback(() => {
        setShowFontFamily(false);
        setShowFontSize(false);
        setShowTextColor(false);
        setShowBgColor(false);
        setShowNumberFormat(false);
        setShowZoom(false);
    }, []);

    const currentFormat = ctx.selectedCell ? ctx.getCellFormat(ctx.selectedCell) : undefined;

    const updateFormat = useCallback(
        (updates: Partial<CellFormat>) => {
            if (!ctx.selectedCell) return;
            const existing = ctx.getCellFormat(ctx.selectedCell) || {};
            const newFormat = { ...existing, ...updates };
            const rawValue = ctx.getCellRawValue(ctx.selectedCell);
            ctx.onCellChange(ctx.selectedCell, rawValue, newFormat);
            closeAll();
        },
        [ctx, closeAll]
    );

    const toggleBold = () => updateFormat({ bold: !currentFormat?.bold });
    const toggleItalic = () => updateFormat({ italic: !currentFormat?.italic });
    const toggleUnderline = () => updateFormat({ underline: !currentFormat?.underline });

    const setAlign = (align: 'left' | 'center' | 'right') => updateFormat({ textAlign: align });

    return (
        <div className="toolbar" id="toolbar">
            {/* Undo / Redo */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={ctx.performUndo}
                    disabled={!ctx.canUndo}
                    title="Undo (Ctrl+Z)"
                    id="undo-btn"
                >
                    ↩
                </button>
                <button
                    className="toolbar-btn"
                    onClick={ctx.performRedo}
                    disabled={!ctx.canRedo}
                    title="Redo (Ctrl+Y)"
                    id="redo-btn"
                >
                    ↪
                </button>
            </div>

            <div className="toolbar-divider" />

            {/* Font Family */}
            <div className="toolbar-dropdown-wrapper">
                <button
                    className="toolbar-btn toolbar-btn-wide"
                    onClick={() => { closeAll(); setShowFontFamily(!showFontFamily); }}
                    title="Font family"
                    id="font-family-btn"
                >
                    {currentFormat?.fontFamily || 'Inter'}
                    <span className="toolbar-arrow">▾</span>
                </button>
                {showFontFamily && (
                    <div className="toolbar-dropdown">
                        {FONT_FAMILIES.map((f) => (
                            <button
                                key={f}
                                className="toolbar-dropdown-item"
                                style={{ fontFamily: f }}
                                onClick={() => updateFormat({ fontFamily: f })}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Font Size */}
            <div className="toolbar-dropdown-wrapper">
                <button
                    className="toolbar-btn toolbar-btn-narrow"
                    onClick={() => { closeAll(); setShowFontSize(!showFontSize); }}
                    title="Font size"
                    id="font-size-btn"
                >
                    {currentFormat?.fontSize || 13}
                    <span className="toolbar-arrow">▾</span>
                </button>
                {showFontSize && (
                    <div className="toolbar-dropdown">
                        {FONT_SIZES.map((s) => (
                            <button
                                key={s}
                                className="toolbar-dropdown-item"
                                onClick={() => updateFormat({ fontSize: s })}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="toolbar-divider" />

            {/* Bold / Italic / Underline */}
            <div className="toolbar-group">
                <button
                    className={`toolbar-btn ${currentFormat?.bold ? 'toolbar-btn-active' : ''}`}
                    onClick={toggleBold}
                    title="Bold (Ctrl+B)"
                    id="bold-btn"
                >
                    <strong>B</strong>
                </button>
                <button
                    className={`toolbar-btn ${currentFormat?.italic ? 'toolbar-btn-active' : ''}`}
                    onClick={toggleItalic}
                    title="Italic (Ctrl+I)"
                    id="italic-btn"
                >
                    <em>I</em>
                </button>
                <button
                    className={`toolbar-btn ${currentFormat?.underline ? 'toolbar-btn-active' : ''}`}
                    onClick={toggleUnderline}
                    title="Underline (Ctrl+U)"
                    id="underline-btn"
                >
                    <u>U</u>
                </button>
            </div>

            <div className="toolbar-divider" />

            {/* Text Color */}
            <div className="toolbar-dropdown-wrapper">
                <button
                    className="toolbar-btn"
                    onClick={() => { closeAll(); setShowTextColor(!showTextColor); }}
                    title="Text color"
                    id="text-color-btn"
                >
                    <span style={{ color: currentFormat?.textColor || '#000' }}>A</span>
                    <span className="toolbar-color-bar" style={{ backgroundColor: currentFormat?.textColor || '#000' }} />
                </button>
                {showTextColor && (
                    <div className="toolbar-dropdown toolbar-color-grid">
                        {TEXT_COLORS.map((c) => (
                            <button
                                key={c.value}
                                className="toolbar-color-swatch"
                                style={{ backgroundColor: c.value }}
                                onClick={() => updateFormat({ textColor: c.value })}
                                title={c.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Background Color */}
            <div className="toolbar-dropdown-wrapper">
                <button
                    className="toolbar-btn"
                    onClick={() => { closeAll(); setShowBgColor(!showBgColor); }}
                    title="Background color"
                    id="bg-color-btn"
                >
                    🎨
                </button>
                {showBgColor && (
                    <div className="toolbar-dropdown toolbar-color-grid">
                        {BG_COLORS.map((c) => (
                            <button
                                key={c.value}
                                className="toolbar-color-swatch"
                                style={{
                                    backgroundColor: c.value,
                                    border: c.value === 'transparent' ? '1px solid var(--color-border)' : '1px solid var(--color-border)',
                                    backgroundImage: c.value === 'transparent' ? 'linear-gradient(to top left, transparent calc(50% - 1px), #ef4444 calc(50% - 1px), #ef4444 calc(50% + 1px), transparent calc(50% + 1px))' : 'none'
                                }}
                                onClick={() => updateFormat({ bgColor: c.value })}
                                title={c.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="toolbar-divider" />

            {/* Alignment */}
            <div className="toolbar-group">
                <button
                    className={`toolbar-btn ${currentFormat?.textAlign === 'left' || !currentFormat?.textAlign ? 'toolbar-btn-active' : ''}`}
                    onClick={() => setAlign('left')}
                    title="Align left"
                    id="align-left-btn"
                >
                    ≡
                </button>
                <button
                    className={`toolbar-btn ${currentFormat?.textAlign === 'center' ? 'toolbar-btn-active' : ''}`}
                    onClick={() => setAlign('center')}
                    title="Align center"
                    id="align-center-btn"
                >
                    ≡
                </button>
                <button
                    className={`toolbar-btn ${currentFormat?.textAlign === 'right' ? 'toolbar-btn-active' : ''}`}
                    onClick={() => setAlign('right')}
                    title="Align right"
                    id="align-right-btn"
                >
                    ≡
                </button>
            </div>

            <div className="toolbar-divider" />

            {/* Number Format */}
            <div className="toolbar-dropdown-wrapper">
                <button
                    className="toolbar-btn toolbar-btn-wide"
                    onClick={() => { closeAll(); setShowNumberFormat(!showNumberFormat); }}
                    title="Number format"
                    id="number-format-btn"
                >
                    {currentFormat?.numberFormat || 'Auto'}
                    <span className="toolbar-arrow">▾</span>
                </button>
                {showNumberFormat && (
                    <div className="toolbar-dropdown">
                        {(['text', 'number', 'currency', 'percent', 'date'] as NumberFormatType[]).map((f) => (
                            <button
                                key={f}
                                className="toolbar-dropdown-item"
                                onClick={() => updateFormat({ numberFormat: f })}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="toolbar-divider" />

            {/* Gridlines toggle */}
            <button
                className={`toolbar-btn ${ctx.showGridlines ? 'toolbar-btn-active' : ''}`}
                onClick={() => ctx.setShowGridlines(!ctx.showGridlines)}
                title="Toggle gridlines"
                id="gridlines-btn"
            >
                ▦
            </button>

            {/* Zoom */}
            <div className="toolbar-dropdown-wrapper">
                <button
                    className="toolbar-btn toolbar-btn-narrow"
                    onClick={() => { closeAll(); setShowZoom(!showZoom); }}
                    title="Zoom level"
                    id="zoom-btn"
                >
                    {ctx.zoom}%
                    <span className="toolbar-arrow">▾</span>
                </button>
                {showZoom && (
                    <div className="toolbar-dropdown">
                        {[50, 75, 100, 125, 150, 200].map((z) => (
                            <button
                                key={z}
                                className="toolbar-dropdown-item"
                                onClick={() => { ctx.setZoom(z); closeAll(); }}
                            >
                                {z}%
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
