import React from 'react';
import { createRoot } from 'react-dom/client';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';

// Custom alert function that uses the modal component
export const showAlert = (message, type = 'info', title = null) => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const handleClose = () => {
      root.unmount();
      document.body.removeChild(container);
      resolve();
    };

    const handleConfirm = () => {
      resolve();
    };

    root.render(
      <AlertModal
        isOpen={true}
        onClose={handleClose}
        title={title}
        message={message}
        type={type}
        onConfirm={handleConfirm}
      />
    );
  });
};

// Custom confirm function that uses the confirmation modal component
export const showConfirm = (message, type = 'warning', title = null, confirmText = 'Yes', cancelText = 'Cancel') => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const handleClose = (confirmed) => {
      root.unmount();
      document.body.removeChild(container);
      resolve(confirmed);
    };

    const handleConfirm = () => {
      handleClose(true);
    };

    root.render(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        title={title}
        message={message}
        type={type}
        onConfirm={handleConfirm}
        confirmText={confirmText}
        cancelText={cancelText}
      />
    );
  });
};

// Convenience functions
export const alertSuccess = (message, title = 'Success') => {
  return showAlert(message, 'success', title);
};

export const alertError = (message, title = 'Error') => {
  return showAlert(message, 'error', title);
};

export const alertWarning = (message, title = 'Warning') => {
  return showAlert(message, 'warning', title);
};

export const alertInfo = (message, title = 'Info') => {
  return showAlert(message, 'info', title);
};

// Replace default alert
export const alert = (message, type = 'info') => {
  return showAlert(message, type);
};

// Replace window.confirm
export const confirm = (message, title = 'Confirm', type = 'warning') => {
  return showConfirm(message, type, title);
};

