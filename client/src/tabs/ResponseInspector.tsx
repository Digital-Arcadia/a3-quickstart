import { useState, useCallback } from 'react';
import { JsonViewer } from '../JsonViewer';

export function ResponseInspector() {
  const [requestJson, setRequestJson] = useState('{\n  "os_signal": "not-available",\n  "user_country_code": "US"\n}');
  const [responseData, setResponseData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleSend = useCallback(async () => {
    setError(null);
    setResponseData(null);
    setParseError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(requestJson);
    } catch {
      setParseError('Invalid JSON — check your syntax.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/assess-age-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setError(body?.message ?? `Server responded ${res.status}`);
        if (body) setResponseData(body);
        return;
      }

      setResponseData(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [requestJson]);

  return (
    <div className="tab-content">
      <div className="a3-enter" style={{ '--a3-delay': '0ms' } as React.CSSProperties}>
        <div className="a3-glass-static" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Raw request/response viewer for debugging your integration. Edit the JSON request directly,
            send it, and inspect the full API response with field annotations.
          </p>
        </div>
      </div>

      <div className="a3-enter inspector-panels" style={{ '--a3-delay': '100ms' } as React.CSSProperties}>
        {/* Request Panel */}
        <div className="inspector-panel">
          <h3>Request</h3>
          <div style={{ position: 'relative' }}>
            <textarea
              className="form-textarea"
              value={requestJson}
              onChange={e => { setRequestJson(e.target.value); setParseError(null); }}
              rows={16}
              style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '0.8rem',
                lineHeight: 1.7,
                borderRadius: '12px',
                resize: 'vertical',
              }}
              spellCheck={false}
            />
          </div>
          {parseError && <div className="error-box" style={{ marginTop: '0.5rem' }}>{parseError}</div>}

          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
              {loading ? <><span className="spinner" /> Sending…</> : 'Send Request'}
            </button>
            <button className="btn btn-ghost" onClick={() => setRequestJson('{\n  "os_signal": "not-available",\n  "user_country_code": "US"\n}')}>
              Reset
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <p className="a3-section-label" style={{ marginBottom: '0.5rem' }}>Quick Templates</p>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => setRequestJson(JSON.stringify({
                os_signal: 'not-available',
                user_country_code: 'US',
              }, null, 2))}>
                Minimal
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => setRequestJson(JSON.stringify({
                os_signal: '18-plus',
                user_country_code: 'US',
                contextual_signals: {
                  ip_type: 'residential',
                  referrer_category: 'search_engine',
                  timezone_offset_delta_minutes: 0,
                },
                account_longevity: {
                  account_age_days: 365,
                },
              }, null, 2))}>
                Full Signals
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => setRequestJson(JSON.stringify({
                os_signal: 'not-available',
                user_country_code: 'US',
                interaction_mode: 'pointer',
                behavioral_metrics: {
                  avg_click_precision: 0.85,
                  mouse_velocity_mean: 650,
                  mouse_path_straightness: 0.78,
                  hover_dwell_time_ms: 420,
                  typing_speed_wpm: 55,
                  keystroke_interval_variance: 0.22,
                  scroll_velocity: 500,
                  form_completion_time_ms: 9500,
                },
                device_context: {
                  os_version: 'Windows 11',
                  is_high_contrast_enabled: false,
                  screen_scale_factor: 1.5,
                },
              }, null, 2))}>
                Pointer Mode
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => setRequestJson(JSON.stringify({
                os_signal: 'under-13',
                user_country_code: 'US',
                parental_consent_status: 'approved',
                consent_source: 'in-app',
              }, null, 2))}>
                With Consent
              </button>
            </div>
          </div>
        </div>

        {/* Response Panel */}
        <div className="inspector-panel">
          <h3>Response</h3>
          {!responseData && !error && (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: '#475569',
                fontSize: '0.85rem',
                border: '1px dashed rgba(255,255,255,0.06)',
                borderRadius: '12px',
              }}
            >
              Send a request to see the response here
            </div>
          )}
          {error && !responseData && <div className="error-box">{error}</div>}
          {responseData && (
            <>
              {error && <div className="error-box" style={{ marginBottom: '0.75rem' }}>{error}</div>}
              <JsonViewer data={responseData} />

              {/* Field annotations */}
              {typeof responseData === 'object' && responseData !== null && 'verdict' in responseData && (
                <div className="a3-glass-static" style={{ padding: '1rem', marginTop: '1rem' }}>
                  <p className="a3-section-label" style={{ marginBottom: '0.75rem' }}>Field Reference</p>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'grid', gap: '0.5rem' }}>
                    <div><strong style={{ color: '#c4b5fd' }}>verdict</strong> — CONSISTENT | OVERRIDE | REVIEW | PROVISIONAL</div>
                    <div><strong style={{ color: '#c4b5fd' }}>assessed_age_bracket</strong> — Final age determination: under-13 | 13-15 | 16-17 | 18-plus | undetermined</div>
                    <div><strong style={{ color: '#c4b5fd' }}>os_signal_age_bracket</strong> — Echo of the input OS signal</div>
                    <div><strong style={{ color: '#c4b5fd' }}>confidence_score</strong> — 0-1 confidence in verdict (Pro/Scale only)</div>
                    <div><strong style={{ color: '#c4b5fd' }}>signal_overridden</strong> — Whether supplementary signals overrode the OS signal</div>
                    <div><strong style={{ color: '#c4b5fd' }}>evidence_tags</strong> — Detailed evidence reasons (Pro/Scale only)</div>
                    <div><strong style={{ color: '#c4b5fd' }}>verification_token</strong> — Unique token for audit logging</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
