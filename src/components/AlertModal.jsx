import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info', onConfirm }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            {getIcon()}
          </div>
          
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {title}
            </h3>
          )}
          
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-6 py-2 text-white rounded-lg font-medium transition-colors ${getButtonColor()}`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

