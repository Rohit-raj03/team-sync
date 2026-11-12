import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Shared Canonical UI Primitive: Modal
 * Layer: shared/components/ui/
 * Responsibility: Accessible dialog shell with backdrop, Escape key listener, body scroll lock,
 * responsive sizing, and ARIA dialog semantics.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-md',
  headerClassName = '',
  bodyClassName = '',
  customHeader = null,
  showHeader = true,
  ariaLabel,
}) => {
  const modalRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const getFocusableElements = () => {
      if (!modalRef.current) return [];
      const focusableSelector =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(modalRef.current.querySelectorAll(focusableSelector)).filter(
        (el) => el.offsetParent !== null
      );
    };

    // Auto-focus the first element or dialog container
    const timer = setTimeout(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        try {
          previouslyFocusedElementRef.current.focus();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || (typeof title === 'string' ? title : 'Modal Dialog')}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`bg-white w-full ${maxWidth} max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-auto animate-in zoom-in-95 duration-150 focus:outline-none`}
      >
        {showHeader &&
          (customHeader || (
            <div
              className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/60 ${headerClassName}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {icon && <div className="shrink-0">{icon}</div>}
                <div className="min-w-0">
                  {title && (
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-3"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        <div
          className={`p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain ${bodyClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
