import toast from 'react-hot-toast';

export const showSuccess = (message) =>
  toast.success(message, {
    style: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    }
  });

export const showError = (message) =>
  toast.error(message, {
    style: {
      background: 'var(--bg-card)',
      color: '#ef4444',
      border: '1px solid rgba(239,68,68,0.3)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    }
  });

export const showWarning = (message) =>
  toast(message, {
    icon: '⚠️',
    style: {
      background: 'var(--bg-card)',
      color: '#f59e0b',
      border: '1px solid rgba(245,158,11,0.3)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    }
  });
