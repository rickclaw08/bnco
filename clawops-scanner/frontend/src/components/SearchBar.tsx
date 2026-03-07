import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';

interface Prediction {
  placeId: string;
  name: string;
  address: string;
  description: string;
  types: string[];
}

interface Props {
  onScan: (query: string, placeId?: string) => void;
  disabled?: boolean;
  apiUrl: string;
}

export function SearchBar({ onScan, disabled, apiUrl }: Props) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/api/places/autocomplete?input=${encodeURIComponent(input)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.predictions || []);
        setShowDropdown((data.predictions || []).length > 0);
        setHighlightIdx(-1);
      }
    } catch {
      // Silently fail - user can still type manually
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  function handleInputChange(value: string) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPredictions(value);
    }, 300);
  }

  function handleSelect(prediction: Prediction) {
    setQuery(prediction.name);
    setShowDropdown(false);
    setPredictions([]);
    onScan(prediction.name, prediction.placeId);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed && !disabled) {
      setShowDropdown(false);
      onScan(trimmed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || predictions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => Math.min(prev + 1, predictions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(predictions[highlightIdx]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }

  return (
    <section className="search-section" ref={wrapperRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search your business name and location..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          disabled={disabled}
          autoFocus
          autoComplete="off"
        />
        <button type="submit" disabled={disabled || !query.trim()}>
          {disabled ? 'Scanning...' : 'Scan'}
        </button>
      </form>

      {showDropdown && (
        <div className="autocomplete-dropdown">
          {loading && <div className="autocomplete-loading">Searching...</div>}
          {predictions.map((p, i) => (
            <div
              key={p.placeId}
              className={`autocomplete-item${i === highlightIdx ? ' highlighted' : ''}`}
              onMouseDown={() => handleSelect(p)}
              onMouseEnter={() => setHighlightIdx(i)}
            >
              <div className="ac-icon">📍</div>
              <div className="ac-text">
                <div className="ac-name">{p.name}</div>
                <div className="ac-address">{p.address}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
