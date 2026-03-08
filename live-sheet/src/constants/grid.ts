// Grid constants
export const DEFAULT_COL_COUNT = 26;
export const DEFAULT_ROW_COUNT = 100;
export const DEFAULT_COL_WIDTH = 100;
export const DEFAULT_ROW_HEIGHT = 28;
export const ROW_HEADER_WIDTH = 50;

/**
 * Convert 0-based column index to label (0 → A, 25 → Z, 26 → AA)
 */
export function getColumnLabel(index: number): string {
    let label = '';
    let n = index;
    while (n >= 0) {
        label = String.fromCharCode((n % 26) + 65) + label;
        n = Math.floor(n / 26) - 1;
    }
    return label;
}

/**
 * Convert column label to 0-based index (A → 0, Z → 25, AA → 26)
 */
export function getColumnIndex(label: string): number {
    let index = 0;
    for (let i = 0; i < label.length; i++) {
        index = index * 26 + (label.charCodeAt(i) - 64);
    }
    return index - 1;
}

/**
 * Parse cell ID like "A1" into { col: "A", row: 1, colIndex: 0 }
 */
export function parseCellId(cellId: string): { col: string; row: number; colIndex: number } | null {
    const match = cellId.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    return {
        col: match[1],
        row: parseInt(match[2], 10),
        colIndex: getColumnIndex(match[1]),
    };
}

/**
 * Build cell ID from column index and row number
 */
export function getCellId(colIndex: number, row: number): string {
    return `${getColumnLabel(colIndex)}${row}`;
}
