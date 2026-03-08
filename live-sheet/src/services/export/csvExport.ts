import type { CellMap } from '@/types';
import { getColumnLabel, parseCellId } from '@/constants/grid';

export function exportToCSV(cells: CellMap): void {
    if (Object.keys(cells).length === 0) return;

    // Find grid bounds
    let maxRow = 0;
    let maxCol = 0;

    for (const cellId of Object.keys(cells)) {
        const parsed = parseCellId(cellId);
        if (!parsed) continue;
        maxRow = Math.max(maxRow, parsed.row);
        maxCol = Math.max(maxCol, parsed.colIndex);
    }

    const rows: string[] = [];
    for (let r = 1; r <= maxRow; r++) {
        const cols: string[] = [];
        for (let c = 0; c <= maxCol; c++) {
            const id = `${getColumnLabel(c)}${r}`;
            const val = cells[id]?.v || '';
            // Escape CSV values
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                cols.push(`"${val.replace(/"/g, '""')}"`);
            } else {
                cols.push(val);
            }
        }
        rows.push(cols.join(','));
    }

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spreadsheet.csv';
    link.click();
    URL.revokeObjectURL(url);
}
