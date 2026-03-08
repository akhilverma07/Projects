'use client';

import React from 'react';
import type { UserPresence } from '@/types';

interface PresenceListProps {
    users: UserPresence[];
    currentUserId?: string;
}

export default function PresenceList({ users, currentUserId }: PresenceListProps) {
    const otherUsers = users.filter((u) => u.uid !== currentUserId);

    if (otherUsers.length === 0) return null;

    return (
        <div className="presence-list" id="presence-list">
            {otherUsers.map((user) => (
                <div
                    key={user.uid}
                    className="presence-avatar"
                    style={{ backgroundColor: user.color }}
                    title={user.displayName}
                >
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="presence-avatar-img" />
                    ) : (
                        <span className="presence-avatar-initial">
                            {user.displayName.charAt(0).toUpperCase()}
                        </span>
                    )}
                    <span className="presence-dot" />
                </div>
            ))}
            <span className="presence-count">
                {otherUsers.length} {otherUsers.length === 1 ? 'collaborator' : 'collaborators'}
            </span>
        </div>
    );
}
