import { useState, useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiExclamation, HiInformationCircle, HiX } from 'react-icons/hi';

const icons = {
  success: HiCheckCircle,
  error: HiXCircle,
  warning: HiExclamation,
  info: HiInformationCircle,
};

const styles = {
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    text: 'text-emerald-300',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    text: 'text-red-300',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    text: 'text-amber-300',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    text: 'text-blue-300',
  },
};

export default function Toast({ message, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = icons[type] || icons.info;
  const style = styles[type] || styles.info;

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  return (
    <div
      className={`
        pointer-events-auto
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
        ${style.bg} ${style.border}
        transform transition-all duration-200 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <Icon className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
      <p className={`flex-1 text-sm ${style.text}`}>{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <HiX className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}
