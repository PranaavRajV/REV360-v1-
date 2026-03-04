import { useState, useEffect, useCallback } from 'react';
import './Toast.css';

// ── Toast context (singleton via module-level queue) ──────
let addToastFn = null;

export function toast(message, type = 'info', duration = 4000) {
  if (addToastFn) addToastFn({ message, type, duration, id: Date.now() + Math.random() });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((t) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, t.duration);
  }, []);

  useEffect(() => {
    addToastFn = add;
    return () => { addToastFn = null; };
  }, [add]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}>×</button>
        </div>
      ))}
    </div>
  );
}
