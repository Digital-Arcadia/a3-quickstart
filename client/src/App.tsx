import { useState } from 'react';
import { useSignalCollector } from '@a3api/signals/react';

interface AssessmentResult {
  confidence_score?: number;
  verdict: string;
  os_signal_age_bracket: string;
  assessed_age_bracket: string;
  signal_overridden: boolean;
  internal_evidence_only: boolean;
  evidence_tags?: string[];
}

export function App() {
  const { getSignals, isReady } = useSignalCollector();
  const [result, setResult] = useState<AssessmentResult | null>(null);
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
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '0 auto', padding: 32 }}>
      <h1>A3 Quickstart</h1>
      <p>
        Interact with this page (scroll, type, click around) to let the SDK
        collect behavioral signals, then click the button to send them to A3.
      </p>

      {/* Dummy form so the SDK can collect input complexity + form timing */}
      <fieldset style={{ marginBottom: 24, padding: 16 }}>
        <legend>Sample form (generates signals)</legend>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Name
          <input type="text" placeholder="Type something…" style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Email
          <input type="email" placeholder="user@example.com" style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label style={{ display: 'block' }}>
          Message
          <textarea rows={3} placeholder="Write a sentence or two…" style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </label>
      </fieldset>

      <button onClick={handleAssess} disabled={!isReady || loading} style={{ padding: '12px 24px', fontSize: 16, cursor: 'pointer' }}>
        {loading ? 'Assessing…' : 'Assess Age'}
      </button>

      {!isReady && <p style={{ color: '#888' }}>SDK initializing…</p>}

      {error && (
        <pre style={{ background: '#fee', color: '#c00', padding: 16, borderRadius: 8, marginTop: 16 }}>
          {error}
        </pre>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Result</h2>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <Row label="Verdict" value={result.verdict} />
              <Row label="Assessed Bracket" value={result.assessed_age_bracket} />
              <Row label="OS Signal Bracket" value={result.os_signal_age_bracket} />
              {result.confidence_score != null && (
                <Row label="Confidence" value={`${(result.confidence_score * 100).toFixed(1)}%`} />
              )}
              <Row label="Signal Overridden" value={String(result.signal_overridden)} />
              <Row label="Internal Evidence Only" value={String(result.internal_evidence_only)} />
            </tbody>
          </table>

          {result.evidence_tags && result.evidence_tags.length > 0 ? (
            <>
              <h3>Evidence Tags</h3>
              <ul>
                {result.evidence_tags.map((tag) => (
                  <li key={tag}><code>{tag}</code></li>
                ))}
              </ul>
            </>
          ) : result.confidence_score == null ? (
            <p style={{ background: '#eff6ff', color: '#1e40af', padding: 12, borderRadius: 8, marginTop: 16, fontSize: 14 }}>
              <strong>Sandbox plan:</strong> Confidence score and evidence tags are
              only included on Pro and Scale plans.{' '}
              <a href="https://portal.a3api.io" target="_blank" rel="noopener noreferrer">Upgrade</a> to
              see the full response.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid #eee' }}>{label}</td>
      <td style={{ padding: '6px 12px', borderBottom: '1px solid #eee' }}>{value}</td>
    </tr>
  );
}
