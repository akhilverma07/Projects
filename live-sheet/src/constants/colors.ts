// Presence colors — assigned deterministically by hashing uid
const PRESENCE_COLORS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#14b8a6', // teal
    '#6366f1', // indigo
];

export function getPresenceColor(uid: string): string {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = (hash * 31 + uid.charCodeAt(i)) | 0;
    }
    return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
}

export const TEXT_COLORS = [
    { value: '#000000', name: 'Black' },
    { value: '#374151', name: 'Dark Gray' },
    { value: '#9ca3af', name: 'Gray' },
    { value: '#d1d5db', name: 'Light Gray' },
    { value: '#ffffff', name: 'White' },

    { value: '#ef4444', name: 'Red' },
    { value: '#f97316', name: 'Orange' },
    { value: '#f59e0b', name: 'Yellow' },
    { value: '#84cc16', name: 'Lime' },
    { value: '#10b981', name: 'Green' },

    { value: '#14b8a6', name: 'Teal' },
    { value: '#06b6d4', name: 'Cyan' },
    { value: '#0ea5e9', name: 'Light Blue' },
    { value: '#3b82f6', name: 'Blue' },
    { value: '#6366f1', name: 'Indigo' },

    { value: '#8b5cf6', name: 'Purple' },
    { value: '#d946ef', name: 'Fuchsia' },
    { value: '#ec4899', name: 'Pink' },
    { value: '#f43f5e', name: 'Rose' },
    { value: '#78716c', name: 'Stone' },
];

export const BG_COLORS = [
    { value: 'transparent', name: 'None' },
    { value: '#000000', name: 'Black' },
    { value: '#374151', name: 'Dark Gray' },
    { value: '#9ca3af', name: 'Gray' },
    { value: '#ffffff', name: 'White' },

    { value: '#ef4444', name: 'Red' },
    { value: '#f97316', name: 'Orange' },
    { value: '#f59e0b', name: 'Yellow' },
    { value: '#84cc16', name: 'Lime' },
    { value: '#10b981', name: 'Green' },

    { value: '#14b8a6', name: 'Teal' },
    { value: '#06b6d4', name: 'Cyan' },
    { value: '#0ea5e9', name: 'Light Blue' },
    { value: '#3b82f6', name: 'Blue' },
    { value: '#6366f1', name: 'Indigo' },

    { value: '#8b5cf6', name: 'Purple' },
    { value: '#d946ef', name: 'Fuchsia' },
    { value: '#ec4899', name: 'Pink' },
    { value: '#f43f5e', name: 'Rose' },
    { value: '#fef3c7', name: 'Pale Yellow' },
];

export const FONT_FAMILIES = [
    'Inter', 'Arial', 'Courier New', 'Georgia',
    'Times New Roman', 'Verdana', 'Trebuchet MS',
];

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36];
