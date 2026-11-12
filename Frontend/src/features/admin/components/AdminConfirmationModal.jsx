import React from 'react';
import { ConfirmationModal } from '../../../shared/components/ui/ConfirmationModal.jsx';

/**
 * Feature Component: AdminConfirmationModal
 * Layer: features/admin/components/
 * Responsibility: Destructive action modal ensuring safety before deleting or deactivating users, projects, or tasks.
 * Delegates to canonical ConfirmationModal.
 */
export const AdminConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete Permanently',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      confirmVariant={confirmVariant}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onClose={onClose}
      showAuditNotice={true}
    />
  );
};

export default AdminConfirmationModal;
