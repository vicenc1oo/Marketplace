import Modal from './Modal.jsx';
import Button from '../Button/Button.jsx';

// Confirmation prompt for destructive actions, built on Modal.
export default function ConfirmDialog({
  open,
  onConfirm,
  onClose,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ color: 'var(--color-text-muted)' }}>{message}</p>
    </Modal>
  );
}
