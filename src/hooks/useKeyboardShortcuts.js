import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Ctrl/Cmd + key combinations
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      // Check for Alt + key combinations
      const isAlt = event.altKey;

      // Check for Shift + key combinations
      const isShift = event.shiftKey;

      // Find matching shortcut
      const shortcut = shortcuts.find(s => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!s.ctrl === isCtrlOrCmd;
        const altMatch = !!s.alt === isAlt;
        const shiftMatch = !!s.shift === isShift;

        return keyMatch && ctrlMatch && altMatch && shiftMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};