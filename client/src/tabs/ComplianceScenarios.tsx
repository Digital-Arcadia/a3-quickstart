import { useState } from 'react';
import { ResultDisplay } from '../ResultDisplay';

interface Scenario {
  id: string;
  name: string;
  description: string;
  badge: string;
  request: Record<string, unknown>;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'coppa-child',
    name: 'COPPA — Child on School Network',
    description: 'Under-13 user on an education IP, no parental consent. Should trigger strict protections.',
    badge: 'COPPA',
    request: {
      os_signal: 'under-13',
      user_country_code: 'US',
      contextual_signals: {
        ip_type: 'education',
        referrer_category: 'direct',
      },
    },
  },
  {
    id: 'ab1043-adult',
    name: 'AB 1043 — Verified Adult',
    description: 'Adult user with a long account history and residential IP. Should return CONSISTENT / 18-plus.',
    badge: 'AB 1043',
    request: {
      os_signal: '18-plus',
      user_country_code: 'US',
      contextual_signals: {
        ip_type: 'residential',
        referrer_category: 'search_engine',
      },
      account_longevity: {
        account_age_days: 730,
      },
    },
  },
  {
    id: 'consent-flow',
    name: 'Parental Consent — Minor Approved',
    description: 'A 13-15 year old whose parent has approved consent via an in-app flow.',
    badge: 'Consent',
    request: {
      os_signal: '13-15',
      user_country_code: 'US',
      parental_consent_status: 'approved',
      consent_source: 'in-app',
    },
  },
  {
    id: 'ambiguous',
    name: 'Ambiguous — Conflicting Signals',
    description: 'OS says 18+ but comes from a parental control referrer with a brand-new account. May trigger REVIEW.',
    badge: 'Edge Case',
    request: {
      os_signal: '18-plus',
      user_country_code: 'US',
      contextual_signals: {
        ip_type: 'residential',
        referrer_category: 'parental_control',
      },
      account_longevity: {
        account_age_days: 1,
      },
    },
  },
  {
    id: 'teen-social',
    name: 'Teen from Social Platform',
    description: 'A 16-17 year old referred from a minor-oriented social platform with no consent.',
    badge: 'Social',
    request: {
      os_signal: '16-17',
      user_country_code: 'US',
      contextual_signals: {
        ip_type: 'residential',
        referrer_category: 'social_minor',
      },
    },
  },
  {
    id: 'web-unknown',
    name: 'Web — No OS Signal',
    description: 'Typical web browser scenario where OS age signal is unavailable. Only contextual signals are sent.',
    badge: 'Web',
    request: {
      os_signal: 'not-available',
      user_country_code: 'US',
      contextual_signals: {
        ip_type: 'residential',
        referrer_category: 'search_engine',
        timezone_offset_delta_minutes: 0,
      },
      account_longevity: {
        account_age_days: 90,
      },
    },
  },
];

export function ComplianceScenarios() {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState<Record<string, unknown> | null>(null);

  async function runScenario(scenario: Scenario) {
    setSelected(scenario.id);
    setError(null);
    setResult(null);
    setLoading(true);
    setLastRequest(scenario.request);

    try {
      const res = await fetch('/api/assess-age-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario.request),
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
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Pre-built scenarios demonstrating real-world regulatory use cases. Click any card
            to send the request and see how the API responds.
          </p>
        </div>
      </div>

      <div className="a3-enter scenario-grid" style={{ '--a3-delay': '100ms' } as React.CSSProperties}>
        {SCENARIOS.map(scenario => (
          <div
            key={scenario.id}
            className={`a3-glass scenario-card ${selected === scenario.id ? 'selected' : ''}`}
            onClick={() => runScenario(scenario)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="a3-badge">{scenario.badge}</span>
            </div>
            <h3>{scenario.name}</h3>
            <p>{scenario.description}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', marginTop: '1rem' }}>
          <span className="spinner" /> Running scenario…
        </div>
      )}

      {error && <div className="error-box">{error}</div>}
      {result && lastRequest && <ResultDisplay result={result} request={lastRequest} />}
    </div>
  );
}
