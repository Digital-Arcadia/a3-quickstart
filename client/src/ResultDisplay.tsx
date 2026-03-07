import { JsonViewer } from './JsonViewer';

interface Props {
  result: Record<string, unknown>;
  request?: Record<string, unknown>;
}

const VERDICT_CLASS: Record<string, string> = {
  CONSISTENT: 'verdict-consistent',
  OVERRIDE: 'verdict-override',
  REVIEW: 'verdict-review',
  PROVISIONAL: 'verdict-provisional',
};

export function ResultDisplay({ result, request }: Props) {
  const verdict = String(result.verdict ?? '');
  const evidenceTags = Array.isArray(result.evidence_tags) ? result.evidence_tags : [];
  const confidenceScore = typeof result.confidence_score === 'number' ? result.confidence_score : null;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="a3-divider" style={{ marginBottom: '1.5rem' }}>
        <div className="a3-divider-dot" />
      </div>

      <div className="a3-glass-featured" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <h3 className="a3-heading" style={{ fontSize: '1.1rem' }}>Assessment Result</h3>
          <span className={`a3-badge ${verdict === 'CONSISTENT' ? 'a3-badge-featured' : ''}`}>
            {verdict}
          </span>
        </div>

        <table className="result-table">
          <tbody>
            <tr>
              <td>Verdict</td>
              <td className={VERDICT_CLASS[verdict] ?? ''}>{verdict}</td>
            </tr>
            <tr>
              <td>Assessed Bracket</td>
              <td>{String(result.assessed_age_bracket ?? 'N/A')}</td>
            </tr>
            <tr>
              <td>OS Signal Bracket</td>
              <td>{String(result.os_signal_age_bracket ?? 'N/A')}</td>
            </tr>
            {confidenceScore !== null && (
              <tr>
                <td>Confidence</td>
                <td>
                  <span style={{ color: '#a78bfa', fontWeight: 600 }}>
                    {(confidenceScore * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            )}
            <tr>
              <td>Signal Overridden</td>
              <td>{String(result.signal_overridden ?? 'N/A')}</td>
            </tr>
            <tr>
              <td>Internal Evidence Only</td>
              <td>{String(result.internal_evidence_only ?? 'N/A')}</td>
            </tr>
            {result.parental_consent_status != null && (
              <tr>
                <td>Consent Status</td>
                <td>{`${result.parental_consent_status}`}</td>
              </tr>
            )}
            {result.consent_source != null && (
              <tr>
                <td>Consent Source</td>
                <td>{`${result.consent_source}`}</td>
              </tr>
            )}
            {result.verification_token != null && (
              <tr>
                <td>Verification Token</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', wordBreak: 'break-all' }}>
                  {`${result.verification_token}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {evidenceTags.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <p className="a3-section-label" style={{ marginBottom: '0.5rem' }}>Evidence Tags</p>
            <div>
              {evidenceTags.map((tag: string) => (
                <span key={tag} className="evidence-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {confidenceScore === null && (
          <div className="info-box" style={{ marginTop: '1rem' }}>
            <strong>Sandbox plan:</strong> Confidence score and evidence tags are only
            included on Pro and Scale plans.{' '}
            <a href="https://portal.a3api.io" target="_blank" rel="noopener noreferrer">
              Upgrade
            </a>{' '}
            to see the full response.
          </div>
        )}
      </div>

      {request && (
        <details style={{ marginTop: '1rem' }}>
          <summary
            style={{
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            View Raw Request / Response
          </summary>
          <div className="inspector-panels" style={{ marginTop: '0.75rem' }}>
            <div>
              <p className="a3-section-label" style={{ marginBottom: '0.5rem' }}>Request</p>
              <JsonViewer data={request} />
            </div>
            <div>
              <p className="a3-section-label" style={{ marginBottom: '0.5rem' }}>Response</p>
              <JsonViewer data={result} />
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
