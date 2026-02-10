import { useRef, useEffect, useCallback } from 'react';
import { renderFormattedDescription } from '../../utils/richText';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  onCursorChange?: () => void;
  className?: string;
  autoFocus?: boolean;
}

/// <summary>
/// WYSIWYG-style rich text editor that overlays formatted text on top of a transparent textarea.
/// The textarea handles all native input, selection, cursor, undo/redo, and IME.
/// The overlay renders the parsed markdown-style formatting visually.
/// Both layers share identical font, padding, and line-height for perfect alignment.
/// </summary>
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 6,
  textareaRef: externalRef,
  onKeyDown,
  onCursorChange,
  className = '',
  autoFocus = false,
}: RichTextEditorProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const taRef = externalRef || internalRef;

  // Sync overlay scroll with textarea scroll
  const handleScroll = useCallback(() => {
    if (overlayRef.current && taRef.current) {
      overlayRef.current.scrollTop = taRef.current.scrollTop;
      overlayRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  }, [taRef]);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && taRef.current) {
      taRef.current.focus();
    }
  }, [autoFocus, taRef]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    onCursorChange?.();
  };

  const handleKeyUp = () => onCursorChange?.();
  const handleClick = () => onCursorChange?.();
  const handleSelect = () => onCursorChange?.();

  // Shared text styles for perfect alignment between textarea and overlay
  const sharedTextClass = 'text-sm leading-relaxed font-mono';
  const sharedPadding = 'px-3 py-2';

  return (
    <div className={`relative rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] overflow-hidden ${className}`}>
      {/* Formatted overlay — renders behind the textarea, no pointer events */}
      <div
        ref={overlayRef}
        className={`wysiwyg-overlay ${sharedTextClass} ${sharedPadding} text-[var(--color-text-secondary)]`}
        style={{ minHeight: `${rows * 1.625}rem` }}
        aria-hidden="true"
      >
        {value ? (
          renderFormattedDescription(value, true)
        ) : (
          <span className="text-[var(--color-text-tertiary)]">{placeholder}</span>
        )}
      </div>

      {/* Textarea — invisible text, visible caret, handles all input natively */}
      <textarea
        ref={taRef}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        onSelect={handleSelect}
        onScroll={handleScroll}
        onBlur={onBlur}
        placeholder=""
        rows={rows}
        className={`wysiwyg-textarea ${sharedTextClass} ${sharedPadding} w-full resize-none outline-none card-description`}
        style={{ minHeight: `${rows * 1.625}rem` }}
      />
    </div>
  );
}
