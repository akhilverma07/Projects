'use client';

import React, { useState } from 'react';

interface CommentPopoverProps {
    cellId: string;
    text: string;
    author: string;
    x: number;
    y: number;
    onEdit: (text: string) => void;
    onDelete: () => void;
    onClose: () => void;
}

export default function CommentPopover({
    cellId,
    text,
    author,
    x,
    y,
    onEdit,
    onDelete,
    onClose,
}: CommentPopoverProps) {
    const [editMode, setEditMode] = useState(false);
    const [editText, setEditText] = useState(text);

    return (
        <div
            className="comment-popover"
            style={{ left: x, top: y }}
        >
            <div className="comment-popover-header">
                <span className="comment-popover-cell">{cellId}</span>
                <span className="comment-popover-author">{author}</span>
                <button className="comment-popover-close" onClick={onClose}>×</button>
            </div>
            {editMode ? (
                <div className="comment-popover-edit">
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="comment-popover-textarea"
                        autoFocus
                    />
                    <div className="comment-popover-actions">
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                                onEdit(editText);
                                setEditMode(false);
                            }}
                        >
                            Save
                        </button>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setEditMode(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="comment-popover-body">
                    <p>{text}</p>
                    <div className="comment-popover-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => setEditMode(true)}>
                            Edit
                        </button>
                        <button className="btn btn-sm btn-ghost" onClick={onDelete}>
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
