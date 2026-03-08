'use client';

import React from 'react';
import type { WriteStatus } from '@/types';

interface WriteStatusIndicatorProps {
    status: WriteStatus;
}

export default function WriteStatusIndicator({ status }: WriteStatusIndicatorProps) {
    if (status === 'idle') return null;

    return (
        <div className={`write-status write-status-${status}`} id="write-status">
            <span className="write-status-dot" />
            <span className="write-status-text">
                {status === 'saving' && 'Saving...'}
                {status === 'saved' && 'Saved'}
                {status === 'error' && 'Error saving'}
            </span>
        </div>
    );
}
