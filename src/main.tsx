import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

console.log('Application initializing...');
console.log('Environment:', {
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found in DOM');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found</div>';
} else {
  console.log('Root element found, starting React app...');
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    console.log('React app rendered successfully');
  } catch (error) {
    console.error('Application failed to start:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1 style="color: red;">Application Error</h1>
        <p>The application failed to start. Please check the console for details.</p>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        ${error instanceof Error && error.stack ? `<details><summary>Stack Trace</summary><pre style="background: #f5f5f5; padding: 10px; overflow: auto; font-size: 12px;">${error.stack}</pre></details>` : ''}
      </div>
    `;
  }
}
