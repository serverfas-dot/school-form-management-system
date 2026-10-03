import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>Something went wrong</h1>
          <div style={{ background: '#fee', padding: '20px', borderRadius: '8px', border: '1px solid #fcc' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Error Details:</h2>
            <pre style={{
              background: '#fff',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '14px',
              border: '1px solid #ddd'
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <details style={{ marginTop: '15px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Stack Trace</summary>
              <pre style={{
                marginTop: '10px',
                background: '#fff',
                padding: '15px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                border: '1px solid #ddd'
              }}>
                {this.state.error?.stack || 'No stack trace available'}
              </pre>
            </details>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
