'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import type {
    CellData, CellMap, CellFormat, WriteStatus, SelectionRange,
    UserPresence, ClipboardBuffer, CellComment, ConditionalFormatRule,
    DataValidationRule, ChartConfig,
} from '@/types';
import { evaluateCell, DependencyGraph, isFormula } from '@/engine/formula/formulaParser';
import { formatCellValue } from '@/utils/numberFormatter';
import { evaluateConditionalFormats } from '@/engine/conditionalFormatting';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { getColumnLabel, getColumnIndex } from '@/constants/grid';

interface SpreadsheetContextValue {
    cells: CellMap;
    setCells: (cells: CellMap) => void;
    selectedCell: string | null;
    setSelectedCell: (cell: string | null) => void;
    editingCell: string | null;
    setEditingCell: (cell: string | null) => void;
    editValue: string;
    setEditValue: (val: string) => void;
    getCellDisplayValue: (cellId: string) => string;
    getCellRawValue: (cellId: string) => string;
    getCellFormat: (cellId: string) => CellFormat | undefined;
    onCellChange: (cellId: string, value: string, format?: CellFormat) => void;
    writeStatus: WriteStatus;
    setWriteStatus: (status: WriteStatus) => void;
    columnWidths: Record<number, number>;
    setColumnWidth: (col: number, width: number) => void;
    rowHeights: Record<number, number>;
    setRowHeight: (row: number, height: number) => void;
    columnOrder: number[];
    setColumnOrder: (order: number[]) => void;
    presenceList: UserPresence[];
    setPresenceList: (list: UserPresence[]) => void;
    performUndo: () => void;
    performRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    selectionRange: SelectionRange | null;
    setSelectionRange: (range: SelectionRange | null) => void;
    clipboard: ClipboardBuffer | null;
    copySelection: () => void;
    cutSelection: () => void;
    pasteSelection: (valuesOnly?: boolean) => void;
    comments: Record<string, CellComment>;
    setComment: (cellId: string, text: string, author: string) => void;
    deleteComment: (cellId: string) => void;
    conditionalFormats: ConditionalFormatRule[];
    addConditionalFormat: (rule: ConditionalFormatRule) => void;
    removeConditionalFormat: (id: string) => void;
    getCellConditionalStyle: (cellId: string) => { textColor?: string; bgColor?: string } | undefined;
    validationRules: Record<string, DataValidationRule>;
    setValidationRule: (cellId: string, rule: DataValidationRule) => void;
    removeValidationRule: (cellId: string) => void;
    charts: ChartConfig[];
    addChart: (chart: ChartConfig) => void;
    removeChart: (id: string) => void;
    insertRow: (afterRow: number) => void;
    deleteRow: (row: number) => void;
    insertColumn: (afterCol: number) => void;
    deleteColumn: (col: number) => void;
    showGridlines: boolean;
    setShowGridlines: (v: boolean) => void;
    zoom: number;
    setZoom: (v: number) => void;
    frozenRows: number;
    setFrozenRows: (v: number) => void;
    frozenCols: number;
    setFrozenCols: (v: number) => void;
    hiddenRows: Set<number>;
    setHiddenRows: (rows: Set<number>) => void;
    sortColumn: (colLabel: string, direction: 'asc' | 'desc') => void;
    bulkSetCells: (newCells: CellMap) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextValue | null>(null);

interface SpreadsheetProviderProps {
    children: React.ReactNode;
    onCellUpdate?: (cellId: string, data: CellData) => Promise<void>;
    initialCells?: CellMap;
}

function expandRange(start: string, end: string): string[] {
    const startMatch = start.match(/^([A-Z]+)(\d+)$/);
    const endMatch = end.match(/^([A-Z]+)(\d+)$/);
    if (!startMatch || !endMatch) return [];

    const startCol = getColumnIndex(startMatch[1]);
    const endCol = getColumnIndex(endMatch[1]);
    const startRow = parseInt(startMatch[2], 10);
    const endRow = parseInt(endMatch[2], 10);

    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    const cells: string[] = [];
    for (let c = minCol; c <= maxCol; c++) {
        for (let r = minRow; r <= maxRow; r++) {
            cells.push(`${getColumnLabel(c)}${r}`);
        }
    }
    return cells;
}

export function SpreadsheetProvider({
    children,
    onCellUpdate,
    initialCells = {},
}: SpreadsheetProviderProps) {
    const [cells, setCells] = useState<CellMap>(initialCells);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [writeStatus, setWriteStatus] = useState<WriteStatus>('idle');
    const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
    const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
    const [columnOrder, setColumnOrder] = useState<number[]>([]);
    const [presenceList, setPresenceList] = useState<UserPresence[]>([]);
    const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
    const [clipboard, setClipboard] = useState<ClipboardBuffer | null>(null);
    const [comments, setComments] = useState<Record<string, CellComment>>({});
    const [conditionalFormats, setConditionalFormats] = useState<ConditionalFormatRule[]>([]);
    const [validationRules, setValidationRules] = useState<Record<string, DataValidationRule>>({});
    const [charts, setCharts] = useState<ChartConfig[]>([]);
    const [showGridlines, setShowGridlines] = useState(true);
    const [zoom, setZoom] = useState(100);
    const [frozenRows, setFrozenRows] = useState(0);
    const [frozenCols, setFrozenCols] = useState(0);
    const [hiddenRows, setHiddenRows] = useState<Set<number>>(new Set());

    const depGraphRef = useRef(new DependencyGraph());

    const { pushEdit, performUndo, performRedo, canUndo, canRedo } = useUndoRedo((cellId, val) => {
        const prevFormat = cells[cellId]?.s;
        const cellData: CellData = { v: val };
        if (prevFormat) cellData.s = prevFormat;
        depGraphRef.current.updateDependencies(cellId, val);
        setCells((prev) => ({ ...prev, [cellId]: cellData }));
        onCellUpdate?.(cellId, cellData);
    });

    const getCellDisplayValue = useCallback(
        (cellId: string): string => {
            const cell = cells[cellId];
            if (!cell) return '';
            let displayVal: string;
            if (isFormula(cell.v)) {
                displayVal = evaluateCell(cellId, cells);
            } else {
                displayVal = cell.v;
            }
            if (cell.s?.numberFormat) {
                displayVal = formatCellValue(displayVal, cell.s.numberFormat);
            }
            return displayVal;
        },
        [cells]
    );

    const getCellRawValue = useCallback(
        (cellId: string): string => {
            return cells[cellId]?.v || '';
        },
        [cells]
    );

    const getCellFormat = useCallback(
        (cellId: string): CellFormat | undefined => {
            return cells[cellId]?.s;
        },
        [cells]
    );

    const getCellConditionalStyle = useCallback(
        (cellId: string): { textColor?: string; bgColor?: string } | undefined => {
            if (conditionalFormats.length === 0) return undefined;
            const cell = cells[cellId];
            if (!cell) return undefined;
            const displayVal = isFormula(cell.v) ? evaluateCell(cellId, cells) : cell.v;
            return evaluateConditionalFormats(cellId, displayVal, conditionalFormats);
        },
        [cells, conditionalFormats]
    );

    const setColumnWidth = useCallback((col: number, width: number) => {
        setColumnWidths((prev) => ({ ...prev, [col]: width }));
    }, []);

    const setRowHeight = useCallback((row: number, height: number) => {
        setRowHeights((prev) => ({ ...prev, [row]: height }));
    }, []);

    const onCellChange = useCallback(
        (cellId: string, value: string, format?: CellFormat) => {
            const oldValue = getCellRawValue(cellId);
            pushEdit(cellId, oldValue, value);

            const cellData: CellData = { v: value };
            if (format) cellData.s = format;

            depGraphRef.current.updateDependencies(cellId, value);
            setCells((prev) => ({ ...prev, [cellId]: cellData }));
            onCellUpdate?.(cellId, cellData);
        },
        [onCellUpdate, pushEdit, getCellRawValue]
    );

    // ── Clipboard Operations ──

    const copySelection = useCallback(() => {
        const range = selectionRange || (selectedCell ? { start: selectedCell, end: selectedCell } : null);
        if (!range) return;

        const cellIds = expandRange(range.start, range.end);
        const copiedCells: CellMap = {};
        cellIds.forEach((id) => {
            if (cells[id]) copiedCells[id] = { ...cells[id] };
        });

        setClipboard({ range, cells: copiedCells, isCut: false });
    }, [selectionRange, selectedCell, cells]);

    const cutSelection = useCallback(() => {
        const range = selectionRange || (selectedCell ? { start: selectedCell, end: selectedCell } : null);
        if (!range) return;

        const cellIds = expandRange(range.start, range.end);
        const copiedCells: CellMap = {};
        cellIds.forEach((id) => {
            if (cells[id]) copiedCells[id] = { ...cells[id] };
        });

        setClipboard({ range, cells: copiedCells, isCut: true });
    }, [selectionRange, selectedCell, cells]);

    const pasteSelection = useCallback(
        (valuesOnly: boolean = false) => {
            if (!clipboard || !selectedCell) return;

            const srcStart = clipboard.range.start.match(/^([A-Z]+)(\d+)$/);
            const srcEnd = clipboard.range.end.match(/^([A-Z]+)(\d+)$/);
            const dstMatch = selectedCell.match(/^([A-Z]+)(\d+)$/);
            if (!srcStart || !srcEnd || !dstMatch) return;

            const srcMinCol = Math.min(getColumnIndex(srcStart[1]), getColumnIndex(srcEnd[1]));
            const srcMinRow = Math.min(parseInt(srcStart[2], 10), parseInt(srcEnd[2], 10));
            const dstCol = getColumnIndex(dstMatch[1]);
            const dstRow = parseInt(dstMatch[2], 10);

            const colOffset = dstCol - srcMinCol;
            const rowOffset = dstRow - srcMinRow;

            const updates: CellMap = {};
            for (const [srcId, srcData] of Object.entries(clipboard.cells)) {
                const m = srcId.match(/^([A-Z]+)(\d+)$/);
                if (!m) continue;
                const newCol = getColumnIndex(m[1]) + colOffset;
                const newRow = parseInt(m[2], 10) + rowOffset;
                if (newCol < 0 || newRow < 1) continue;
                const newId = `${getColumnLabel(newCol)}${newRow}`;

                if (valuesOnly) {
                    updates[newId] = { v: srcData.v };
                } else {
                    updates[newId] = { ...srcData };
                }
            }

            if (clipboard.isCut) {
                for (const srcId of Object.keys(clipboard.cells)) {
                    if (!updates[srcId]) {
                        updates[srcId] = { v: '' };
                    }
                }
                setClipboard(null);
            }

            setCells((prev) => {
                const next = { ...prev };
                for (const [id, data] of Object.entries(updates)) {
                    next[id] = data;
                    onCellUpdate?.(id, data);
                }
                return next;
            });
        },
        [clipboard, selectedCell, onCellUpdate]
    );

    // ── Comments ──

    const setComment = useCallback((cellId: string, text: string, author: string) => {
        setComments((prev) => ({
            ...prev,
            [cellId]: { text, author, createdAt: Date.now() },
        }));
    }, []);

    const deleteComment = useCallback((cellId: string) => {
        setComments((prev) => {
            const next = { ...prev };
            delete next[cellId];
            return next;
        });
    }, []);

    // ── Conditional Formatting ──

    const addConditionalFormat = useCallback((rule: ConditionalFormatRule) => {
        setConditionalFormats((prev) => [...prev, rule]);
    }, []);

    const removeConditionalFormat = useCallback((id: string) => {
        setConditionalFormats((prev) => prev.filter((r) => r.id !== id));
    }, []);

    // ── Data Validation ──

    const setValidationRule = useCallback((cellId: string, rule: DataValidationRule) => {
        setValidationRules((prev) => ({ ...prev, [cellId]: rule }));
    }, []);

    const removeValidationRule = useCallback((cellId: string) => {
        setValidationRules((prev) => {
            const next = { ...prev };
            delete next[cellId];
            return next;
        });
    }, []);

    // ── Charts ──

    const addChart = useCallback((chart: ChartConfig) => {
        setCharts((prev) => [...prev, chart]);
    }, []);

    const removeChart = useCallback((id: string) => {
        setCharts((prev) => prev.filter((c) => c.id !== id));
    }, []);

    // ── Row/Column Operations ──

    const insertRow = useCallback((afterRow: number) => {
        setCells((prev) => {
            const newCells: CellMap = {};
            for (const [cellId, data] of Object.entries(prev)) {
                const m = cellId.match(/^([A-Z]+)(\d+)$/);
                if (!m) continue;
                const row = parseInt(m[2], 10);
                if (row > afterRow) {
                    newCells[`${m[1]}${row + 1}`] = data;
                } else {
                    newCells[cellId] = data;
                }
            }
            return newCells;
        });
    }, []);

    const deleteRow = useCallback((row: number) => {
        setCells((prev) => {
            const newCells: CellMap = {};
            for (const [cellId, data] of Object.entries(prev)) {
                const m = cellId.match(/^([A-Z]+)(\d+)$/);
                if (!m) continue;
                const r = parseInt(m[2], 10);
                if (r === row) continue;
                if (r > row) {
                    newCells[`${m[1]}${r - 1}`] = data;
                } else {
                    newCells[cellId] = data;
                }
            }
            return newCells;
        });
    }, []);

    const insertColumn = useCallback((afterCol: number) => {
        setCells((prev) => {
            const newCells: CellMap = {};
            for (const [cellId, data] of Object.entries(prev)) {
                const m = cellId.match(/^([A-Z]+)(\d+)$/);
                if (!m) continue;
                const col = getColumnIndex(m[1]);
                if (col > afterCol) {
                    newCells[`${getColumnLabel(col + 1)}${m[2]}`] = data;
                } else {
                    newCells[cellId] = data;
                }
            }
            return newCells;
        });
    }, []);

    const deleteColumn = useCallback((col: number) => {
        setCells((prev) => {
            const newCells: CellMap = {};
            for (const [cellId, data] of Object.entries(prev)) {
                const m = cellId.match(/^([A-Z]+)(\d+)$/);
                if (!m) continue;
                const c = getColumnIndex(m[1]);
                if (c === col) continue;
                if (c > col) {
                    newCells[`${getColumnLabel(c - 1)}${m[2]}`] = data;
                } else {
                    newCells[cellId] = data;
                }
            }
            return newCells;
        });
    }, []);

    // ── Sort ──

    const sortColumn = useCallback((colLabel: string, direction: 'asc' | 'desc') => {
        import('@/engine/sorting').then(({ sortByColumn }) => {
            setCells((prev) => sortByColumn(prev, colLabel, direction));
        });
    }, []);

    // ── Bulk Set Cells (CSV Import) ──

    const bulkSetCells = useCallback(
        (newCells: CellMap) => {
            setCells((prev) => ({ ...prev, ...newCells }));
            for (const [id, data] of Object.entries(newCells)) {
                onCellUpdate?.(id, data);
            }
        },
        [onCellUpdate]
    );

    const value = useMemo(
        () => ({
            cells, setCells,
            selectedCell, setSelectedCell,
            editingCell, setEditingCell,
            editValue, setEditValue,
            getCellDisplayValue, getCellRawValue, getCellFormat,
            onCellChange,
            writeStatus, setWriteStatus,
            columnWidths, setColumnWidth,
            rowHeights, setRowHeight,
            columnOrder, setColumnOrder,
            presenceList, setPresenceList,
            performUndo, performRedo, canUndo, canRedo,
            selectionRange, setSelectionRange,
            clipboard, copySelection, cutSelection, pasteSelection,
            comments, setComment, deleteComment,
            conditionalFormats, addConditionalFormat, removeConditionalFormat,
            getCellConditionalStyle,
            validationRules, setValidationRule, removeValidationRule,
            charts, addChart, removeChart,
            insertRow, deleteRow, insertColumn, deleteColumn,
            showGridlines, setShowGridlines,
            zoom, setZoom,
            frozenRows, setFrozenRows,
            frozenCols, setFrozenCols,
            hiddenRows, setHiddenRows,
            sortColumn,
            bulkSetCells,
        }),
        [
            cells, selectedCell, editingCell, editValue,
            getCellDisplayValue, getCellRawValue, getCellFormat,
            onCellChange, writeStatus, columnWidths, setColumnWidth,
            rowHeights, setRowHeight, columnOrder, presenceList,
            performUndo, performRedo, canUndo, canRedo,
            selectionRange, clipboard, copySelection, cutSelection, pasteSelection,
            comments, setComment, deleteComment,
            conditionalFormats, addConditionalFormat, removeConditionalFormat,
            getCellConditionalStyle,
            validationRules, setValidationRule, removeValidationRule,
            charts, addChart, removeChart,
            insertRow, deleteRow, insertColumn, deleteColumn,
            showGridlines, zoom, frozenRows, frozenCols,
            hiddenRows, sortColumn, bulkSetCells,
        ]
    );

    return (
        <SpreadsheetContext.Provider value={value}>
            {children}
        </SpreadsheetContext.Provider>
    );
}

export function useSpreadsheet(): SpreadsheetContextValue {
    const ctx = useContext(SpreadsheetContext);
    if (!ctx) throw new Error('useSpreadsheet must be used within SpreadsheetProvider');
    return ctx;
}
