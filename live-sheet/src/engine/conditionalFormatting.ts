import type { ConditionalFormatRule } from '@/types';
import { getColumnIndex, getColumnLabel } from '@/constants/grid';

function isCellInRange(cellId: string, start: string, end: string): boolean {
    const cellMatch = cellId.match(/^([A-Z]+)(\d+)$/);
    const startMatch = start.match(/^([A-Z]+)(\d+)$/);
    const endMatch = end.match(/^([A-Z]+)(\d+)$/);
    if (!cellMatch || !startMatch || !endMatch) return false;

    const col = getColumnIndex(cellMatch[1]);
    const row = parseInt(cellMatch[2], 10);
    const minCol = Math.min(getColumnIndex(startMatch[1]), getColumnIndex(endMatch[1]));
    const maxCol = Math.max(getColumnIndex(startMatch[1]), getColumnIndex(endMatch[1]));
    const minRow = Math.min(parseInt(startMatch[2], 10), parseInt(endMatch[2], 10));
    const maxRow = Math.max(parseInt(startMatch[2], 10), parseInt(endMatch[2], 10));

    return col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;
}

export function evaluateConditionalFormats(
    cellId: string,
    displayValue: string,
    rules: ConditionalFormatRule[]
): { textColor?: string; bgColor?: string } | undefined {
    const numVal = parseFloat(displayValue);

    for (const rule of rules) {
        if (!isCellInRange(cellId, rule.range.start, rule.range.end)) continue;

        let matches = false;

        switch (rule.operator) {
            case 'gt':
                matches = !isNaN(numVal) && numVal > parseFloat(rule.value1);
                break;
            case 'lt':
                matches = !isNaN(numVal) && numVal < parseFloat(rule.value1);
                break;
            case 'eq':
                matches = displayValue === rule.value1 || (!isNaN(numVal) && numVal === parseFloat(rule.value1));
                break;
            case 'gte':
                matches = !isNaN(numVal) && numVal >= parseFloat(rule.value1);
                break;
            case 'lte':
                matches = !isNaN(numVal) && numVal <= parseFloat(rule.value1);
                break;
            case 'between':
                matches = !isNaN(numVal) && numVal >= parseFloat(rule.value1) && numVal <= parseFloat(rule.value2 || '0');
                break;
            case 'contains':
                matches = displayValue.toLowerCase().includes(rule.value1.toLowerCase());
                break;
        }

        if (matches) {
            return rule.style;
        }
    }

    return undefined;
}

// Re-export for convenience
export { getColumnLabel };
