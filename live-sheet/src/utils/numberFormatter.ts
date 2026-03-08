import type { NumberFormatType } from '@/types';

export function formatCellValue(value: string, format: NumberFormatType): string {
    if (!value || format === 'text') return value;

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    switch (format) {
        case 'number':
            return num.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });
        case 'currency':
            return num.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            });
        case 'percent':
            return (num * 100).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
            }) + '%';
        case 'date': {
            const date = new Date(num);
            if (isNaN(date.getTime())) return value;
            return date.toLocaleDateString('en-US');
        }
        default:
            return value;
    }
}
