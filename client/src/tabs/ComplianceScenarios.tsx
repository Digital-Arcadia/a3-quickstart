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
    description: 'Under-13 on a school iPad with child-like behavioral patterns — imprecise touch, rapid scrolling, heavy autocorrect. Education IP, no consent.',
    badge: 'COPPA',
    request: {
      os_signal: 'under-13',
      user_country_code: 'US',
      behavioral_metrics: {
        avg_touch_precision: 0.28,
        scroll_velocity: 3800,
        form_completion_time_ms: 2200,
        is_autofill_detected: false,
        touch_pressure_variance: 0.78,
        multi_touch_frequency: 8.5,
      },
      device_context: {
        os_version: 'iPadOS 17.4',
        device_model: 'iPad (10th gen)',
        is_high_contrast_enabled: false,
        screen_scale_factor: 2.0,
      },
      contextual_signals: {
        ip_type: 'education',
        timezone_offset_delta_minutes: -300,
        referrer_category: 'direct',
      },
      input_complexity: {
        keyboard_autocorrect_rate: 0.52,
        average_word_complexity_score: 0.18,
      },
    },
  },
  {
    id: 'ab1043-adult',
    name: 'AB 1043 — Verified Adult',
    description: 'Adult with a 2-year account, precise touch, slow form completion, sophisticated vocabulary, and facial estimation confirming 25-35.',
    badge: 'AB 1043',
    request: {
      os_signal: '18-plus',
      user_country_code: 'US',
      behavioral_metrics: {
        avg_touch_precision: 0.91,
        scroll_velocity: 550,
        form_completion_time_ms: 14000,
        is_autofill_detected: true,
        touch_pressure_variance: 0.09,
        multi_touch_frequency: 0.3,
        face_estimation_result: {
          estimation_provider: 'yoti',
          estimated_age_lower: 25,
          estimated_age_upper: 35,
          confidence: 0.92,
        },
      },
      device_context: {
        os_version: 'iOS 18.2',
        device_model: 'iPhone 16 Pro',
        is_high_contrast_enabled: false,
        screen_scale_factor: 3.0,
      },
      contextual_signals: {
        ip_type: 'residential',
        timezone_offset_delta_minutes: 0,
        referrer_category: 'search_engine',
      },
      account_longevity: {
        account_age_days: 730,
      },
      input_complexity: {
        keyboard_autocorrect_rate: 0.04,
        average_word_complexity_score: 0.74,
      },
    },
  },
  {
    id: 'consent-flow',
    name: 'Parental Consent — Minor Approved',
    description: '13-15 year old on Android with parent-approved in-app consent. Teen-typical behavioral metrics and a 45-day-old account.',
    badge: 'Consent',
    request: {
      os_signal: '13-15',
      user_country_code: 'US',
      behavioral_metrics: {
        avg_touch_precision: 0.48,
        scroll_velocity: 2800,
        form_completion_time_ms: 3500,
        is_autofill_detected: false,
        touch_pressure_variance: 0.55,
        multi_touch_frequency: 5.2,
      },
      device_context: {
        os_version: 'Android 14',
        device_model: 'Pixel 8',
        is_high_contrast_enabled: false,
        screen_scale_factor: 2.625,
      },
      contextual_signals: {
        ip_type: 'residential',
        timezone_offset_delta_minutes: -480,
        referrer_category: 'direct',
      },
      account_longevity: {
        account_age_days: 45,
      },
      input_complexity: {
        keyboard_autocorrect_rate: 0.31,
        average_word_complexity_score: 0.35,
      },
      parental_consent_status: 'approved',
      consent_source: 'in-app',
    },
  },
  {
    id: 'ambiguous',
    name: 'Conflicting Signals',
    description: 'OS says 18+ but face estimation reads 14-19, referrer is a parental control app, account is 1 day old, and typing patterns are mixed.',
    badge: 'Edge Case',
    request: {
      os_signal: '18-plus',
      user_country_code: 'US',
      behavioral_metrics: {
        avg_touch_precision: 0.52,
        scroll_velocity: 2200,
        form_completion_time_ms: 4500,
        is_autofill_detected: false,
        touch_pressure_variance: 0.48,
        multi_touch_frequency: 4.8,
        face_estimation_result: {
          estimation_provider: 'privado',
          estimated_age_lower: 14,
          estimated_age_upper: 19,
          confidence: 0.58,
        },
      },
      device_context: {
        os_version: 'iOS 16.0',
        device_model: 'iPhone 13',
        is_high_contrast_enabled: true,
        screen_scale_factor: 3.0,
      },
      contextual_signals: {
        ip_type: 'residential',
        timezone_offset_delta_minutes: 180,
        referrer_category: 'parental_control',
      },
      account_longevity: {
        account_age_days: 1,
      },
      input_complexity: {
        keyboard_autocorrect_rate: 0.35,
        average_word_complexity_score: 0.29,
      },
    },
  },
  {
    id: 'teen-social',
    name: 'Teen from Social Platform',
    description: '16-17 year old on Android referred from a minor-oriented social platform. Fast, imprecise taps and moderate vocabulary. No consent on file.',
    badge: 'Social',
    request: {
      os_signal: '16-17',
      user_country_code: 'US',
      behavioral_metrics: {
        avg_touch_precision: 0.42,
        scroll_velocity: 3200,
        form_completion_time_ms: 2800,
        is_autofill_detected: false,
        touch_pressure_variance: 0.62,
        multi_touch_frequency: 6.7,
      },
      device_context: {
        os_version: 'Android 15',
        device_model: 'Samsung Galaxy S24',
        is_high_contrast_enabled: false,
        screen_scale_factor: 3.0,
      },
      contextual_signals: {
        ip_type: 'residential',
        timezone_offset_delta_minutes: -360,
        referrer_category: 'social_minor',
      },
      account_longevity: {
        account_age_days: 18,
      },
      input_complexity: {
        keyboard_autocorrect_rate: 0.27,
        average_word_complexity_score: 0.38,
      },
    },
  },
  {
    id: 'web-desktop',
    name: 'Web — Desktop Browser',
    description: 'Desktop browser with no OS age signal. Adult-like mouse precision, deliberate cursor paths, and steady typing rhythm. Uses pointer-mode signals.',
    badge: 'Web',
    request: {
      os_signal: 'not-available',
      user_country_code: 'US',
      interaction_mode: 'pointer',
      behavioral_metrics: {
        avg_click_precision: 0.87,
        mouse_velocity_mean: 650,
        mouse_path_straightness: 0.82,
        hover_dwell_time_ms: 420,
        typing_speed_wpm: 62,
        keystroke_interval_variance: 0.18,
        scroll_velocity: 500,
        form_completion_time_ms: 9500,
        is_autofill_detected: true,
      },
      device_context: {
        os_version: 'Windows 11',
        is_high_contrast_enabled: false,
        screen_scale_factor: 1.5,
      },
      contextual_signals: {
        ip_type: 'residential',
        timezone_offset_delta_minutes: 0,
        referrer_category: 'search_engine',
      },
      account_longevity: {
        account_age_days: 210,
      },
      input_complexity: {
        keyboard_autocorrect_rate: 0.02,
        average_word_complexity_score: 0.68,
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
