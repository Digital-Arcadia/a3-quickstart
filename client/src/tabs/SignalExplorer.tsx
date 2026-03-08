import { useState } from 'react';
import { ResultDisplay } from '../ResultDisplay';

type OsSignal = 'under-13' | '13-15' | '16-17' | '18-plus' | 'not-available';
type InteractionMode = 'touch' | 'pointer' | 'hybrid' | '';
type IpType = 'residential' | 'education' | 'datacenter' | 'corporate';
type ReferrerCategory = 'direct' | 'social_minor' | 'social_general' | 'parental_control' | 'search_engine' | 'unknown';
type ConsentStatus = 'pending' | 'approved' | 'denied' | 'revoked';
type ConsentSource = 'os-system' | 'third-party-wallet' | 'in-app';

interface Sections {
  contextual: boolean;
  accountLongevity: boolean;
  parentalConsent: boolean;
}

export function SignalExplorer() {
  // Required fields
  const [osSignal, setOsSignal] = useState<OsSignal>('not-available');
  const [countryCode, setCountryCode] = useState('US');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('');

  // Toggleable sections
  const [sections, setSections] = useState<Sections>({
    contextual: false,
    accountLongevity: false,
    parentalConsent: false,
  });

  // Contextual signals
  const [ipType, setIpType] = useState<IpType>('residential');
  const [timezoneOffset, setTimezoneOffset] = useState(0);
  const [referrerCategory, setReferrerCategory] = useState<ReferrerCategory>('direct');

  // Account longevity
  const [accountAgeDays, setAccountAgeDays] = useState(365);

  // Parental consent
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');
  const [consentSource, setConsentSource] = useState<ConsentSource>('in-app');

  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState<Record<string, unknown> | null>(null);

  function toggleSection(key: keyof Sections) {
    setSections(s => ({ ...s, [key]: !s[key] }));
  }

  function buildRequest(): Record<string, unknown> {
    const req: Record<string, unknown> = {
      os_signal: osSignal,
      user_country_code: countryCode,
    };

    if (interactionMode) {
      req.interaction_mode = interactionMode;
    }

    if (sections.contextual) {
      req.contextual_signals = {
        ip_type: ipType,
        timezone_offset_delta_minutes: timezoneOffset,
        referrer_category: referrerCategory,
      };
    }

    if (sections.accountLongevity) {
      req.account_longevity = {
        account_age_days: accountAgeDays,
      };
    }

    if (sections.parentalConsent) {
      req.parental_consent_status = consentStatus;
      req.consent_source = consentSource;
    }

    return req;
  }

  async function handleAssess() {
    setError(null);
    setResult(null);
    setLoading(true);

    const req = buildRequest();
    setLastRequest(req);

    try {
      const res = await fetch('/api/assess-age-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
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
            Explore every signal the A3 API accepts. Toggle sections on/off to see how
            different signal combinations affect the age assessment verdict.
          </p>
        </div>
      </div>

      {/* Required Fields */}
      <div className="a3-enter" style={{ '--a3-delay': '80ms' } as React.CSSProperties}>
        <div className="a3-glass-static signal-section">
          <div className="signal-section-header">
            <span className="signal-section-title">Required Fields</span>
            <span className="a3-badge-featured a3-badge">Required</span>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">OS Signal</label>
              <select className="form-select" value={osSignal} onChange={e => setOsSignal(e.target.value as OsSignal)}>
                <option value="not-available">not-available</option>
                <option value="under-13">under-13</option>
                <option value="13-15">13-15</option>
                <option value="16-17">16-17</option>
                <option value="18-plus">18-plus</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Country Code</label>
              <input className="form-input" value={countryCode} onChange={e => setCountryCode(e.target.value.toUpperCase())} maxLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Interaction Mode</label>
              <select className="form-select" value={interactionMode} onChange={e => setInteractionMode(e.target.value as InteractionMode)}>
                <option value="">(omit — auto-detect)</option>
                <option value="touch">touch</option>
                <option value="pointer">pointer</option>
                <option value="hybrid">hybrid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Signals */}
      <div className="a3-enter" style={{ '--a3-delay': '160ms' } as React.CSSProperties}>
        <div className={`a3-glass-static signal-section ${sections.contextual ? '' : 'disabled-section'}`}>
          <div className="signal-section-header">
            <span className="signal-section-title">Contextual Signals</span>
            <label className="toggle">
              <input type="checkbox" checked={sections.contextual} onChange={() => toggleSection('contextual')} />
              <span className="toggle-slider" />
            </label>
          </div>
          {sections.contextual && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">IP Type</label>
                  <select className="form-select" value={ipType} onChange={e => setIpType(e.target.value as IpType)}>
                    <option value="residential">residential</option>
                    <option value="education">education</option>
                    <option value="datacenter">datacenter</option>
                    <option value="corporate">corporate</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Referrer Category</label>
                  <select className="form-select" value={referrerCategory} onChange={e => setReferrerCategory(e.target.value as ReferrerCategory)}>
                    <option value="direct">direct</option>
                    <option value="social_minor">social_minor</option>
                    <option value="social_general">social_general</option>
                    <option value="parental_control">parental_control</option>
                    <option value="search_engine">search_engine</option>
                    <option value="unknown">unknown</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Timezone Offset Delta (minutes): {timezoneOffset}</label>
                <input
                  type="range"
                  className="form-input"
                  min={-720}
                  max={720}
                  step={30}
                  value={timezoneOffset}
                  onChange={e => setTimezoneOffset(Number(e.target.value))}
                  style={{ padding: '0.4rem 0', background: 'none', border: 'none' }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Account Longevity */}
      <div className="a3-enter" style={{ '--a3-delay': '240ms' } as React.CSSProperties}>
        <div className={`a3-glass-static signal-section ${sections.accountLongevity ? '' : 'disabled-section'}`}>
          <div className="signal-section-header">
            <span className="signal-section-title">Account Longevity</span>
            <label className="toggle">
              <input type="checkbox" checked={sections.accountLongevity} onChange={() => toggleSection('accountLongevity')} />
              <span className="toggle-slider" />
            </label>
          </div>
          {sections.accountLongevity && (
            <div className="form-group">
              <label className="form-label">Account Age (days)</label>
              <input
                type="number"
                className="form-input"
                value={accountAgeDays}
                onChange={e => setAccountAgeDays(Number(e.target.value))}
                min={0}
                max={10000}
              />
            </div>
          )}
        </div>
      </div>

      {/* Parental Consent */}
      <div className="a3-enter" style={{ '--a3-delay': '320ms' } as React.CSSProperties}>
        <div className={`a3-glass-static signal-section ${sections.parentalConsent ? '' : 'disabled-section'}`}>
          <div className="signal-section-header">
            <span className="signal-section-title">Parental Consent</span>
            <label className="toggle">
              <input type="checkbox" checked={sections.parentalConsent} onChange={() => toggleSection('parentalConsent')} />
              <span className="toggle-slider" />
            </label>
          </div>
          {sections.parentalConsent && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Consent Status</label>
                <select className="form-select" value={consentStatus} onChange={e => setConsentStatus(e.target.value as ConsentStatus)}>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="denied">denied</option>
                  <option value="revoked">revoked</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Consent Source</label>
                <select className="form-select" value={consentSource} onChange={e => setConsentSource(e.target.value as ConsentSource)}>
                  <option value="in-app">in-app</option>
                  <option value="os-system">os-system</option>
                  <option value="third-party-wallet">third-party-wallet</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="a3-enter" style={{ '--a3-delay': '400ms', display: 'flex', gap: '0.75rem', alignItems: 'center' } as React.CSSProperties}>
        <button className="btn btn-primary" onClick={handleAssess} disabled={loading}>
          {loading ? <><span className="spinner" /> Assessing…</> : 'Send Assessment'}
        </button>
        {lastRequest && (
          <button className="btn btn-ghost" onClick={() => { setResult(null); setLastRequest(null); setError(null); }}>
            Clear
          </button>
        )}
      </div>

      {error && <div className="error-box">{error}</div>}
      {result && lastRequest && <ResultDisplay result={result} request={lastRequest} />}
    </div>
  );
}
