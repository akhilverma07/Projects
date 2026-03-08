'use client';

import React, { useEffect, useState } from 'react';

export default function ThemeToggle({ className }: { className?: string }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const preferred = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(preferred);
        document.documentElement.setAttribute('data-theme', preferred);
    }, []);

    const toggle = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    return (
        <button
            onClick={toggle}
            className={`theme-toggle ${className || ''}`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            id="theme-toggle-btn"
        >
            <span className="theme-toggle-icon">
                {theme === 'light' ? '🌙' : '☀️'}
            </span>
        </button>
    );
}
