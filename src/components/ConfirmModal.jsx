import Modal from './Modal'
import StatusGlyph from './StatusGlyph'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '# Confirm Action',
  message,
  children,
  confirmLabel = 'confirm',
  cancelLabel = 'cancel',
  isDestructive = true,
  loading = false,
  status = 'error',
  size = 'sm',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      role="alertdialog"
      size={size}
      showCloseButton={!loading}
      closeOnOutsideClick={!loading}
      closeOnEsc={!loading}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center border border-line-strong bg-transparent px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              isDestructive
                ? 'inline-flex h-10 items-center justify-center border border-dashed border-line-strong bg-surface-2 px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3 disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50'
                : 'inline-flex h-10 items-center justify-center border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm active:translate-x-0 active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:bg-hatch disabled:opacity-50'
            }
          >
            {loading ? '… working' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {status ? (
          <div className="border border-dashed border-line-strong p-3 bg-surface-2">
            <StatusGlyph status={status} label={isDestructive ? 'warning' : 'notice'} />
          </div>
        ) : null}

        {message ? (
          <p className="text-sm leading-6 text-fg">{message}</p>
        ) : null}

        {children}
      </div>
    </Modal>
  )
}
