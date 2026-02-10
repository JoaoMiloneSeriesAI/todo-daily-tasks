import { useState, useRef, ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

/// <summary>
/// Custom tooltip component that shows styled hover hints.
/// Works reliably in Electron where native title tooltips may be suppressed.
/// </summary>
export function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 400);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  return (
    <div className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 text-xs font-medium whitespace-nowrap rounded-md bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-lg z-50 pointer-events-none">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[var(--color-text-primary)]" />
          {text}
        </div>
      )}
    </div>
  );
}
