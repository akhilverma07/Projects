import type { CellMap } from '@/types';
import { getColumnLabel } from '@/constants/grid';

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (inQuotes) {
            if (ch === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                current += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                result.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
    }

    result.push(current);
    return result;
}

export async function importCSVFile(file: File): Promise<CellMap> {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    const cells: CellMap = {};

    lines.forEach((line, rowIndex) => {
        const values = parseCSVLine(line);
        values.forEach((value, colIndex) => {
            if (value.trim()) {
                const cellId = `${getColumnLabel(colIndex)}${rowIndex + 1}`;
                cells[cellId] = { v: value };
            }
        });
    });

    return cells;
}
