import { useState } from 'react';
import { PassiveSignals } from './tabs/PassiveSignals';
import { SignalExplorer } from './tabs/SignalExplorer';
import { ComplianceScenarios } from './tabs/ComplianceScenarios';
import { ResponseInspector } from './tabs/ResponseInspector';

const TABS = [
  { id: 'passive', label: 'Passive Signals' },
  { id: 'explorer', label: 'Signal Explorer' },
  { id: 'scenarios', label: 'Compliance Scenarios' },
  { id: 'inspector', label: 'Response Inspector' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('passive');

  return (
    <div className="app-container">
      {/* Header */}
      <div className="a3-enter" style={{ '--a3-delay': '0ms' } as React.CSSProperties}>
        <div className="app-header">
          <img src="/a3-logo-dark.svg" alt="A3" />
          <h1 className="a3-heading">
            <span className="a3-gradient-text">Quickstart</span>
          </h1>
        </div>
        <p className="app-subtitle">
          Explore the Arcadia Age API — from passive signal collection to full
          compliance scenarios. Each tab demonstrates a different integration pattern.
        </p>
      </div>

      {/* Tabs */}
      <div className="a3-enter" style={{ '--a3-delay': '100ms' } as React.CSSProperties}>
        <nav className="tab-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div key={activeTab}>
        {activeTab === 'passive' && <PassiveSignals />}
        {activeTab === 'explorer' && <SignalExplorer />}
        {activeTab === 'scenarios' && <ComplianceScenarios />}
        {activeTab === 'inspector' && <ResponseInspector />}
      </div>
    </div>
  );
}
