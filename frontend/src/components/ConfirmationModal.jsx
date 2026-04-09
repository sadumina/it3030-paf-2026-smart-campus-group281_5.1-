import React from 'react';

/**
 * Confirmation Modal - Replaces browser's window.confirm()
 * 
 * Provides a nice, styled confirmation dialog that matches the app design
 * 
 * Usage:
 * <ConfirmationModal
 *   isOpen={showConfirm}
 *   title="Delete User?"
 *   message="This action cannot be undone."
 *   confirmLabel="Delete"
 *   cancelLabel="Cancel"
 *   confirmColor="red"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 */
export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'blue', // blue, red, orange, green
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmColors = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
  };

  return (
    <>
      {/* Backdrop - click to cancel */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full transform transition-all animate-in zoom-in-95">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 rounded-b-lg flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${confirmColors[confirmColor]}`}
            >
              {isLoading && (
                <span className="inline-block animate-spin">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"
                    />
                  </svg>
                </span>
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
