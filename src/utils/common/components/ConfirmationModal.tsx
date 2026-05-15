import Modal from '@mui/material/Modal';
import type { JSX } from 'react/jsx-runtime';
import type { ConfirmationModalProps } from '@/types/common';

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = 'Confirm',
  confirmButtonColor = 'red',
  cancelButtonText = 'Cancel',
  cancelButtonColor,
  disableCancelButton = false,
  disableConfirmButton = false,
}: ConfirmationModalProps): JSX.Element {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto text-center">
          <h2 id="confirmation-modal-title" className="text-xl font-bold mb-4">
            {title}
          </h2>
          {typeof description === 'string' ? (
            <p id="confirmation-modal-description" className="mb-6">
              {description}
            </p>
          ) : (
            description
          )}
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              disabled={disableCancelButton}
              className={`px-4 cursor-pointer py-2 bg-${cancelButtonColor ? cancelButtonColor : 'white'}-300 text-black rounded-md border border-black transition-colors 
    ${cancelButtonColor ? `hover:bg-${cancelButtonColor}-500 hover:border-${cancelButtonColor}-700` : 'hover:bg-gray-200 hover:border-gray-700'}`}
            >
              {cancelButtonText}
            </button>
            <button
              onClick={onConfirm}
              disabled={disableConfirmButton}
              className={`px-4 cursor-pointer py-2 bg-${confirmButtonColor}-500 text-white rounded-md hover:bg-${confirmButtonColor}-700 transition-colors`}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
