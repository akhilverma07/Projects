'use client';

import { useCallback, useRef, useState } from 'react';

interface EditCommand {
    cellId: string;
    oldValue: string;
    newValue: string;
}

export function useUndoRedo(applyCellValue: (cellId: string, value: string) => void) {
    const undoStack = useRef<EditCommand[]>([]);
    const redoStack = useRef<EditCommand[]>([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const updateFlags = useCallback(() => {
        setCanUndo(undoStack.current.length > 0);
        setCanRedo(redoStack.current.length > 0);
    }, []);

    const pushEdit = useCallback(
        (cellId: string, oldValue: string, newValue: string) => {
            if (oldValue === newValue) return;
            undoStack.current.push({ cellId, oldValue, newValue });
            redoStack.current = []; // Clear redo stack on new edit
            updateFlags();
        },
        [updateFlags]
    );

    const performUndo = useCallback(() => {
        const cmd = undoStack.current.pop();
        if (!cmd) return;
        redoStack.current.push(cmd);
        applyCellValue(cmd.cellId, cmd.oldValue);
        updateFlags();
    }, [applyCellValue, updateFlags]);

    const performRedo = useCallback(() => {
        const cmd = redoStack.current.pop();
        if (!cmd) return;
        undoStack.current.push(cmd);
        applyCellValue(cmd.cellId, cmd.newValue);
        updateFlags();
    }, [applyCellValue, updateFlags]);

    return { pushEdit, performUndo, performRedo, canUndo, canRedo };
}
