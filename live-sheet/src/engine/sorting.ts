import type { CellMap } from '@/types';
import { getColumnIndex, getColumnLabel } from '@/constants/grid';

export function sortByColumn(
    cells: CellMap,
    colLabel: string,
    direction: 'asc' | 'desc'
): CellMap {
    // Gather all used rows and columns
    const rowData: Map<number, Record<string, typeof cells[string]>> = new Map();
    let maxRow = 0;
    const usedCols = new Set<string>();

    for (const [cellId, data] of Object.entries(cells)) {
        const match = cellId.match(/^([A-Z]+)(\d+)$/);
        if (!match) continue;
        const col = match[1];
        const row = parseInt(match[2], 10);
        usedCols.add(col);
        maxRow = Math.max(maxRow, row);

        if (!rowData.has(row)) rowData.set(row, {});
        rowData.get(row)![col] = data;
    }

    // Build row entries with sort key
    const rows: { row: number; data: Record<string, typeof cells[string]>; sortKey: string }[] = [];
    for (const [row, data] of rowData.entries()) {
        const sortCell = data[colLabel];
        const sortKey = sortCell?.v || '';
        rows.push({ row, data, sortKey });
    }

    // Sort
    rows.sort((a, b) => {
        const aNum = parseFloat(a.sortKey);
        const bNum = parseFloat(b.sortKey);
        const aIsNum = !isNaN(aNum);
        const bIsNum = !isNaN(bNum);

        let cmp: number;
        if (aIsNum && bIsNum) {
            cmp = aNum - bNum;
        } else {
            cmp = a.sortKey.localeCompare(b.sortKey);
        }

        return direction === 'asc' ? cmp : -cmp;
    });

    // Rebuild cells with new row order
    const newCells: CellMap = {};
    rows.forEach((entry, idx) => {
        const newRow = idx + 1;
        for (const [col, data] of Object.entries(entry.data)) {
            newCells[`${col}${newRow}`] = data;
        }
    });

    return newCells;
}
