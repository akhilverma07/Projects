'use client';

import React, { useEffect, useRef } from 'react';
import type { ContextMenuItem } from '@/types';

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Adjust position to stay in viewport
    const adjustedX = Math.min(x, window.innerWidth - 220);
    const adjustedY = Math.min(y, window.innerHeight - items.length * 36 - 20);

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{ left: adjustedX, top: adjustedY }}
            id="context-menu"
        >
            {items.map((item, i) => (
                <React.Fragment key={i}>
                    {item.divider && <div className="context-menu-divider" />}
                    <button
                        className="context-menu-item"
                        onClick={() => {
                            item.action();
                            onClose();
                        }}
                        disabled={item.disabled}
                    >
                        {item.icon && <span className="context-menu-icon">{item.icon}</span>}
                        <span>{item.label}</span>
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
}
