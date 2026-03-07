interface Props {
  step: number;
}

const STEPS = [
  'Finding your business on Google Maps...',
  'Analyzing your Maps profile health...',
  'Testing AI visibility across queries...',
  'Comparing against local competitors...',
];

export function Loading({ step }: Props) {
  return (
    <section className="loading-section">
      <div className="spinner" />
      <p>Running your scan</p>
      <div className="loading-steps">
        {STEPS.map((text, i) => (
          <div
            key={i}
            className={`loading-step ${i === step ? 'active' : i < step ? 'done' : ''}`}
          >
            <span>{i < step ? '✓' : i === step ? '▸' : '○'}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
