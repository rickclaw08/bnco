import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { Loading } from './components/Loading';
import { Results } from './components/Results';
import { ErrorDisplay } from './components/ErrorDisplay';

const API_URL = import.meta.env.VITE_API_URL || 'https://clawops-scanner.fly.dev';

// ClawOps lobster SVG (exact match from theclawops.com)
const CLAW_SVG = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="60" cy="58" rx="22" ry="30" fill="url(#claw-grad)"/>
  <ellipse cx="60" cy="30" rx="18" ry="16" fill="url(#claw-grad)"/>
  <path d="M42 50 Q60 47 78 50" stroke="rgba(0,80,30,0.25)" stroke-width="1" fill="none"/>
  <path d="M40 60 Q60 57 80 60" stroke="rgba(0,80,30,0.20)" stroke-width="1" fill="none"/>
  <path d="M41 70 Q60 67 79 70" stroke="rgba(0,80,30,0.15)" stroke-width="1" fill="none"/>
  <ellipse cx="52" cy="96" rx="8" ry="5" fill="url(#claw-grad)" transform="rotate(-15 52 96)"/>
  <ellipse cx="60" cy="98" rx="8" ry="5" fill="url(#claw-grad)"/>
  <ellipse cx="68" cy="96" rx="8" ry="5" fill="url(#claw-grad)" transform="rotate(15 68 96)"/>
  <path d="M60 88 L60 93" stroke="rgba(0,80,30,0.20)" stroke-width="1"/>
  <path d="M30 30 C18 22 8 28 10 38 C12 48 22 46 28 38 C32 32 30 30 30 30Z" fill="url(#claw-grad)"/>
  <path d="M14 32 Q18 36 14 40" stroke="rgba(0,80,30,0.25)" stroke-width="1" fill="none"/>
  <path d="M90 30 C102 22 112 28 110 38 C108 48 98 46 92 38 C88 32 90 30 90 30Z" fill="url(#claw-grad)"/>
  <path d="M106 32 Q102 36 106 40" stroke="rgba(0,80,30,0.25)" stroke-width="1" fill="none"/>
  <path d="M50 18 Q40 4 28 2" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>
  <path d="M70 18 Q80 4 92 2" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>
  <line x1="40" y1="48" x2="32" y2="52" stroke="url(#claw-grad)" stroke-width="2" stroke-linecap="round"/>
  <line x1="80" y1="48" x2="88" y2="52" stroke="url(#claw-grad)" stroke-width="2" stroke-linecap="round"/>
  <line x1="39" y1="56" x2="30" y2="60" stroke="url(#claw-grad)" stroke-width="2" stroke-linecap="round"/>
  <line x1="81" y1="56" x2="90" y2="60" stroke="url(#claw-grad)" stroke-width="2" stroke-linecap="round"/>
  <line x1="39" y1="64" x2="31" y2="68" stroke="url(#claw-grad)" stroke-width="2" stroke-linecap="round"/>
  <line x1="81" y1="64" x2="89" y2="68" stroke="url(#claw-grad)" stroke-width="2" stroke-linecap="round"/>
  <line x1="40" y1="72" x2="33" y2="76" stroke="url(#claw-grad)" stroke-width="2" stroke-linecap="round"/>
  <line x1="80" y1="72" x2="87" y2="76" stroke="url(#claw-grad)" stroke-width="2" stroke-linecap="round"/>
  <circle cx="51" cy="28" r="5" fill="#050810"/>
  <circle cx="69" cy="28" r="5" fill="#050810"/>
  <circle cx="52" cy="27" r="2" fill="#00e5cc"/>
  <circle cx="70" cy="27" r="2" fill="#00e5cc"/>
  <defs><linearGradient id="claw-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#166534"/></linearGradient></defs>
</svg>`;

interface ScanData {
  business: {
    name: string;
    address: string;
    phone: string;
    website: string | null;
    placeId: string;
    category: string;
    rating: number;
    reviewCount: number;
  };
  scores: {
    meo: {
      score: number;
      grade: string;
      confidence: string;
      why: string[];
      deficiencies: string[];
      bonuses: string[];
      optimizationTips: string[];
      marketContext: {
        marketPosition: string;
        competitorsAnalyzed: number;
      };
    };
    geo: {
      score: number;
      grade: string;
      confidence: string;
      mentionRate: number;
      avgRank: number | null;
      insights: string[];
      results: Array<{
        query: string;
        mentioned: boolean;
        rank: number | null;
        snippet: string | null;
      }>;
    };
    combined: {
      score: number;
      formula: string;
    };
  };
  timing: {
    totalMs: number;
  };
}

type AppState = 'idle' | 'loading' | 'results' | 'error';

export function App() {
  const [state, setState] = useState<AppState>('idle');
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleScan(query: string, placeId?: string) {
    setState('loading');
    setLoadingStep(0);
    setError('');

    const stepTimers = [
      setTimeout(() => setLoadingStep(1), 2000),
      setTimeout(() => setLoadingStep(2), 5000),
      setTimeout(() => setLoadingStep(3), 10000),
    ];

    try {
      const body: Record<string, string> = {};
      if (placeId) {
        body.placeId = placeId;
        body.query = query;
      } else {
        body.query = query;
      }

      const res = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      stepTimers.forEach(clearTimeout);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || err.message || `HTTP ${res.status}`);
      }

      const result = await res.json();
      setData(result);
      setState('results');
    } catch (err: any) {
      stepTimers.forEach(clearTimeout);
      setError(err.message || 'Something went wrong');
      setState('error');
    }
  }

  function handleReset() {
    setState('idle');
    setData(null);
    setError('');
  }

  function toggleMobileMenu() {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  return (
    <div className="scanner-page">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="https://theclawops.com" className="nav-brand">
            <span dangerouslySetInnerHTML={{ __html: CLAW_SVG }} />
            <span>ClawOps</span>
          </a>
          <ul className="nav-links">
            <li><a href="https://theclawops.com/#services">Services</a></li>
            <li><a href="https://theclawops.com/#verticals">Industries</a></li>
            <li><a href="https://theclawops.com/#pricing">Pricing</a></li>
            <li><a href="https://theclawops.com/demo/">Demo</a></li>
            <li><a href="https://theclawops.com/blog/">Blog</a></li>
            <li><a href="/scanner/geo/" className="active" style={{ color: '#4ade80', fontWeight: 600 }}>&#128270; GEO Scanner</a></li>
          </ul>
          <a href="https://theclawops.com/#pricing" className="nav-cta">Get Started</a>
          <button
            className={`hamburger${mobileMenuOpen ? ' active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${mobileMenuOpen ? ' active' : ''}`}>
        <a href="https://theclawops.com/#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
        <a href="https://theclawops.com/#verticals" onClick={() => setMobileMenuOpen(false)}>Industries</a>
        <a href="https://theclawops.com/#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
        <a href="https://theclawops.com/demo/" onClick={() => setMobileMenuOpen(false)}>Demo</a>
        <a href="https://theclawops.com/blog/" onClick={() => setMobileMenuOpen(false)}>Blog</a>
        <a href="/scanner/geo/" style={{ color: '#4ade80', fontWeight: 600 }} onClick={() => setMobileMenuOpen(false)}>GEO Scanner</a>
        <a href="https://theclawops.com/#pricing" style={{ color: '#22c55e', fontWeight: 700 }} onClick={() => setMobileMenuOpen(false)}>Get Started</a>
      </div>

      <div className="container">
        <header className="scanner-header">
          <div className="badge">FREE VISIBILITY SCANNER</div>
          <h1>
            See How <span className="accent">AI and Maps</span> Find Your Business
          </h1>
          <p>
            Get your free visibility score. We check Google Maps health, AI assistant
            mentions, and local competitive standing in seconds.
          </p>
        </header>

        {(state === 'idle' || state === 'loading') && (
          <SearchBar onScan={handleScan} disabled={state === 'loading'} apiUrl={API_URL} />
        )}

        {state === 'loading' && <Loading step={loadingStep} />}

        {state === 'results' && data && (
          <Results data={data} onReset={handleReset} />
        )}

        {state === 'error' && (
          <ErrorDisplay message={error} onRetry={handleReset} />
        )}
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-brand">
          <span dangerouslySetInnerHTML={{ __html: CLAW_SVG.replace(/claw-grad/g, 'ft-grad') }} />
          <span>ClawOps</span>
        </div>
        <div className="footer-links">
          <a href="https://theclawops.com/contractors/">AI for Contractors</a>
          <a href="https://theclawops.com/legal/">AI for Law Firms</a>
          <a href="https://theclawops.com/healthcare/">AI for Healthcare</a>
          <a href="https://theclawops.com/demo/">AI Receptionist Demo</a>
          <a href="/scanner/geo/" style={{ color: '#4ade80', fontWeight: 600 }}>&#128270; GEO Scanner</a>
        </div>
        <div className="footer-legal">
          <a href="https://theclawops.com/privacy/">Privacy Policy</a>
          <a href="https://theclawops.com/terms/">Terms of Service</a>
          <a href="https://theclawops.com/acceptable-use/">Acceptable Use Policy</a>
        </div>
        <p className="footer-copy">&copy; 2026 ClawOps. All rights reserved.</p>
      </footer>
    </div>
  );
}
