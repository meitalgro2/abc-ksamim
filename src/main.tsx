import { Component, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fredoka';
import './styles.css';
import App from './App';

try {
  navigator.storage?.persist?.();
} catch {
  /* optional */
}

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="app">
        <div className="card center-text">
          <h2>אופס, משהו השתבש</h2>
          <p>ההתקדמות שמורה. אפשר לפתוח שוב.</p>
          <button className="btn btn-primary" onClick={() => location.reload()}>לפתוח שוב</button>
        </div>
      </main>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
