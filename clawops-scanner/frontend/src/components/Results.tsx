interface ResultsProps {
  data: {
    business: {
      name: string;
      address: string;
      phone: string;
      website: string | null;
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
  };
  onReset: () => void;
}

function getInsightIcon(item: string): string {
  if (
    item.startsWith('Excellent') ||
    item.startsWith('Strong') ||
    item.startsWith('Good') ||
    item.includes('completeness is strong') ||
    item.includes('Top') ||
    item.includes('Franchise visibility')
  ) {
    return '✅';
  }
  if (item.startsWith('Reliability cap') || item.includes('cap')) {
    return '🔒';
  }
  return '⚠️';
}

export function Results({ data, onReset }: ResultsProps) {
  const { business, scores, timing } = data;

  return (
    <div>
      {/* Scan Again Button */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button onClick={onReset} className="scan-again-btn">
          &#8592; Scan Another Business
        </button>
      </div>

      {/* Business Info */}
      <div className="business-info glass-card">
        <div className="icon">🏢</div>
        <div className="details">
          <h3>{business.name}</h3>
          <p>{business.address}</p>
          <p className="scan-meta">
            {business.category} // Scanned in {(timing.totalMs / 1000).toFixed(1)}s
          </p>
        </div>
        <div className="meta">
          <div className="rating">&#9733; {business.rating?.toFixed(1) || 'N/A'}</div>
          <div>{business.reviewCount || 0} reviews</div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="scores-grid">
        <div className="score-card meo">
          <div className="label">Maps Health (MEO)</div>
          <div className="score">{scores.meo.score}</div>
          <div className="grade">{scores.meo.grade}</div>
          <div className="sublabel">Google Business Profile strength</div>
        </div>
        <div className="score-card geo">
          <div className="label">AI Visibility (GEO)</div>
          <div className="score">{scores.geo.score}</div>
          <div className="grade">{scores.geo.grade}</div>
          <div className="sublabel">How often AI recommends you</div>
        </div>
        <div className="score-card combined">
          <div className="label">Overall Score</div>
          <div className="score">{scores.combined.score}</div>
          <div className="grade">{scores.combined.formula}</div>
          <div className="sublabel">Combined digital visibility</div>
        </div>
      </div>

      {/* MEO Insights */}
      <section className="insights-section">
        <h2>Maps Profile Insights</h2>
        <p className="methodology">
          MEO Score: Based on Google Business Profile completeness, rating quality, review volume, photos, engagement signals, and competitive positioning against {scores.meo.marketContext.competitorsAnalyzed} local businesses.
        </p>
        <div className="insight-list">
          {scores.meo.why.map((item, i) => (
            <div key={i} className="insight-item">
              <span className="icon">{getInsightIcon(item)}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* GEO Query Results */}
      {scores.geo.results && scores.geo.results.length > 0 && (
        <section className="geo-results">
          <h2>AI Visibility Test Results</h2>
          <p className="methodology">
            GEO Score: We queried AI assistants (GPT-4) with industry-specific prompts to check if and where your business appears. Mention rate: {(scores.geo.mentionRate * 100).toFixed(0)}%.
          </p>
          {scores.geo.results.map((r, i) => (
            <div key={i} className="query-result">
              <span className="query">"{r.query}"</span>
              <span className={`status ${r.mentioned ? 'mentioned' : 'not-mentioned'}`}>
                {r.mentioned
                  ? r.rank ? `#${r.rank}` : 'Mentioned'
                  : 'Not Found'}
              </span>
            </div>
          ))}
          {scores.geo.insights.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              {scores.geo.insights.map((insight, i) => (
                <div key={i} className="insight-item" style={{ marginBottom: '0.5rem' }}>
                  <span className="icon">💡</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Optimization Tips */}
      {scores.meo.optimizationTips.length > 0 && (
        <section className="insights-section">
          <h2>What to Fix</h2>
          <div className="insight-list">
            {scores.meo.optimizationTips.map((tip, i) => (
              <div key={i} className="insight-item">
                <span className="icon">🔧</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Market Position */}
      <section className="insights-section">
        <h2>Competitive Position</h2>
        <div className="insight-item">
          <span className="icon">📊</span>
          <span>
            {scores.meo.marketContext.marketPosition} (analyzed against{' '}
            {scores.meo.marketContext.competitorsAnalyzed} local competitors)
          </span>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Want to Improve These Scores?</h2>
        <p>
          ClawOps can help your business rank higher on Maps and AI assistants.
          Our team optimizes your Maps profile, boosts your AI visibility, and
          gets you more customers.
        </p>
        <p className="cta-subtitle">Free strategy call. No commitment.</p>
        <a
          href="https://link.gohighlevel.com/widget/bookings/clawops-demo-call"
          className="cta-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a Free Strategy Call
        </a>
      </section>
    </div>
  );
}
