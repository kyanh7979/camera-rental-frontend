import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorId: Date.now().toString(36) };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <FiAlertTriangle className="text-4xl" style={{ color: '#ef4444' }} />
            </div>

            {/* Title */}
            <h1 className="mb-2 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Đã xảy ra lỗi
            </h1>

            {/* Message */}
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Rất tiếc, đã có lỗi không mong muốn xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục.
            </p>

            {/* Error ID (for debugging) */}
            <div className="mb-6 rounded-lg border p-3" style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--border-color)' 
            }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Mã lỗi: <code className="font-mono">{this.state.errorId}</code>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: 'var(--gold)',
                  color: '#0f172a'
                }}
              >
                <FiRefreshCw size={18} />
                Tải lại trang
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                <FiHome size={18} />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
