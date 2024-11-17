import { useEffect, useRef } from 'react';

export const useSearchShortcuts = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Focus search on Ctrl/Cmd + F or /
      if (
        (event.key === 'f' && (event.ctrlKey || event.metaKey)) ||
        (event.key === '/' && !event.ctrlKey && !event.metaKey)
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return searchInputRef;
};