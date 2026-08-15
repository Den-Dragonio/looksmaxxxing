import React from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import './Toast.css';

const ToastContainer = () => {
  const { toasts, toastSettings, removeToast } = useAppContext();

  if (!toastSettings.enabled || toasts.length === 0) return null;

  return createPortal(
    <div className={`toast-container ${toastSettings.position}`}>
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-message" onClick={() => removeToast(toast.id)}>
          {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
