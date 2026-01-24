import { HiExclamation, HiTrash, HiX } from 'react-icons/hi';

const variants = {
  danger: {
    icon: HiTrash,
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    confirmBtn: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: HiExclamation,
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700',
  },
  info: {
    icon: HiExclamation,
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    confirmBtn: 'bg-blue-600 hover:bg-blue-700',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  if (!isOpen) return null;

  const style = variants[variant] || variants.danger;
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
      <div
        className="bg-[#0f0f14] rounded-2xl max-w-md w-full border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${style.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
              <p className="text-gray-400 text-sm">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${style.confirmBtn}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
