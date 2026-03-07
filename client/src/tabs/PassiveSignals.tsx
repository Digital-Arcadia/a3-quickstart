import { useState } from 'react';
import { useSignalCollector } from '@a3api/signals/react';
import { ResultDisplay } from '../ResultDisplay';

export function PassiveSignals() {
  const { getSignals, isReady } = useSignalCollector();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAssess() {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const signals = getSignals();
      if (!signals) {
        setError('Signals not ready yet — interact with the page first.');
        return;
      }

      const res = await fetch('/api/assess-age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signals),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? `Server responded ${res.status}`);
        return;
      }

      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-content">
      <div className="a3-enter" style={{ '--a3-delay': '0ms' } as React.CSSProperties}>
        <div className="a3-glass-static" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            The <code style={{ color: '#c4b5fd' }}>@a3api/signals</code> SDK passively collects behavioral
            signals as you interact with this page. Scroll, type, and click around, then hit the button below.
          </p>

          <div className="sdk-status">
            <span className={`sdk-status-dot ${isReady ? 'ready' : ''}`} />
            {isReady ? 'SDK ready — signals collecting' : 'SDK initializing…'}
          </div>
        </div>
      </div>

      <div className="a3-enter" style={{ '--a3-delay': '100ms' } as React.CSSProperties}>
        <div className="a3-glass-static signal-section">
          <div className="signal-section-header">
            <span className="signal-section-title">Sample Form (generates signals)</span>
            <span className="a3-badge">Passive</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" placeholder="Type something…" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="user@example.com" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" rows={3} placeholder="Write a sentence or two…" />
          </div>
        </div>
      </div>

      <div className="a3-enter" style={{ '--a3-delay': '200ms' } as React.CSSProperties}>
        <button className="btn btn-primary" onClick={handleAssess} disabled={!isReady || loading}>
          {loading ? <><span className="spinner" /> Assessing…</> : 'Assess Age'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}
      {result && <ResultDisplay result={result} />}
    </div>
  );
}
