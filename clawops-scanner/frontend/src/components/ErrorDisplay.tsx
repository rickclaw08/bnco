interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorDisplay({ message, onRetry }: Props) {
  return (
    <section className="error-section">
      <div className="error-icon">&#9888;&#65039;</div>
      <h3>Scan Failed</h3>
      <p>{message}</p>
      <button onClick={onRetry}>Try Again</button>
    </section>
  );
}
