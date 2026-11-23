import { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-5xl',
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  role = 'dialog',
  showCloseButton = true,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  initialFocusRef,
  className = '',
}) {
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const descId = `${generatedId}-desc`
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Handle focus lock, escape key, and body scroll lock
  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus the initial element or the first focusable element inside the modal
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else if (dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        if (focusable.length > 0) {
          focusable[0].focus()
        } else {
          dialogRef.current.focus()
        }
      }
    }, 0)

    function handleKeyDown(event) {
      if (event.key === 'Escape' && closeOnEsc) {
        event.preventDefault()
        event.stopPropagation()
        onClose?.()
        return
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
          (el) => el.offsetParent !== null,
        )

        if (focusables.length === 0) {
          event.preventDefault()
          return
        }

        const first = focusables[0]
        const last = focusables[focusables.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === first || document.activeElement === dialogRef.current) {
            event.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      if (previousFocusRef.current?.focus) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, closeOnEsc, onClose, initialFocusRef])

  if (!isOpen) return null

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && closeOnOutsideClick) {
      onClose?.()
    }
  }

  const maxWidthClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  return createPortal(
    <div
      role="presentation"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        ref={dialogRef}
        role={role}
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={`relative flex w-full flex-col border border-line-strong bg-surface-1 text-fg shadow-hard outline-none ${maxWidthClass} ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line px-4 md:px-6">
            <div className="min-w-0 flex-1">
              {title && (
                typeof title === 'string' ? (
                  <h2 id={titleId} className="truncate text-sm font-bold uppercase tracking-wider text-fg">
                    {title}
                  </h2>
                ) : (
                  <div id={titleId}>{title}</div>
                )
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="inline-flex h-8 w-8 items-center justify-center border border-line-strong text-fg-muted hover:bg-surface-3 hover:text-fg focus-visible:outline-2"
              >
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
          </header>
        )}

        {/* Optional Description / Subtitle */}
        {description && (
          <div id={descId} className="border-b border-dashed border-line px-4 py-2 text-xs text-fg-muted md:px-6">
            {description}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto p-4 text-sm leading-6 md:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-dashed border-line px-4 py-3 md:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

// Subcomponents for custom composability
Modal.Header = function ModalHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-6 ${className}`}>
      {children}
    </div>
  )
}

Modal.Body = function ModalBody({ children, className = '' }) {
  return (
    <div className={`max-h-[calc(100vh-14rem)] overflow-y-auto p-4 text-sm leading-6 md:p-6 ${className}`}>
      {children}
    </div>
  )
}

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-3 border-t border-dashed border-line px-4 py-3 md:px-6 ${className}`}>
      {children}
    </div>
  )
}
