import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon/Icon.jsx';
import './Modal.css';

// Accessible portal dialog: Escape/backdrop close, scroll-lock, focus handling.
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const dialogRef = useRef(null);
  const lastFocused = useRef(null);
  const onCloseRef = useRef(onClose);

  // Keep the latest callback without restarting the focus effect on every render.
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    lastFocused.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    // Focus the dialog container once mounted.
    requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      lastFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const titleId = title ? 'modal-title' : undefined;

  return createPortal(
      <div className="modal__backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
        <div
            className={`modal modal--${size}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={dialogRef}
            tabIndex={-1}
        >
          <div className="modal__header">
            {title && <h2 className="modal__title" id={titleId}>{title}</h2>}
            <button type="button" className="modal__close" onClick={onClose} aria-label="Close dialog">
              <Icon name="close" />
            </button>
          </div>
          <div className="modal__body">{children}</div>
          {footer && <div className="modal__footer">{footer}</div>}
        </div>
      </div>,
      document.body,
  );
}
