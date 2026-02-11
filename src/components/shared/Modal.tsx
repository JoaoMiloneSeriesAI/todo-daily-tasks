import { ReactNode, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  /** Optional custom header content rendered instead of the default title text */
  headerContent?: ReactNode;
  /** Optional color bar rendered at the very top of the modal above the header */
  headerColor?: string;
  /** When true, the modal fills the entire viewport (useful on mobile) */
  fullScreen?: boolean;
}

/// <summary>
/// Accessible modal dialog with focus trap, ARIA attributes, body scroll lock,
/// Escape key close, and Framer Motion animations.
/// </summary>
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  headerContent,
  headerColor,
  fullScreen = false,
}: ModalProps) {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Store the previously focused element to restore focus on close
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-focus first non-input focusable element (button, link) so that
  // opening a modal doesn't immediately activate an editable field.
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        // Fallback: focus the modal container itself
        modalRef.current.focus();
      }
    } else if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap: keep Tab cycling within the modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — use onMouseDown to prevent drag-to-select from closing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
            className="fixed inset-0 bg-[var(--color-overlay)] z-40"
            aria-hidden="true"
          />

          {/* Modal wrapper — only close if mousedown directly on the wrapper, not bubbled from children */}
          <div className={`fixed inset-0 z-50 flex items-center justify-center ${fullScreen ? 'p-0' : 'p-4'}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              tabIndex={-1}
              className={`bg-[var(--color-surface)] shadow-xl w-full overflow-hidden flex flex-col outline-none ${
                fullScreen
                  ? 'h-full max-h-full rounded-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
                  : `rounded-xl ${sizeStyles[size]} max-h-[90vh]`
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Color bar (optional) */}
              {headerColor && (
                <div className="h-2 w-full flex-shrink-0" style={{ backgroundColor: headerColor }} />
              )}

              {/* Header */}
              <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between gap-3">
                {headerContent ? (
                  <div id={titleId} className="flex-1 min-w-0">
                    {headerContent}
                  </div>
                ) : (
                  <h2 id={titleId} className="text-xl font-bold text-[var(--color-text-primary)] truncate">{title}</h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors flex-shrink-0"
                    aria-label="Close"
                  >
                    <X size={20} className="text-[var(--color-text-secondary)]" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
