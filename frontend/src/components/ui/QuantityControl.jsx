export default function QuantityControl({ value, max, onChange, label = 'Quantity' }) {
  const unavailable = max <= 0;
  return <div className="gh-quantity" role="group" aria-label={label}>
    <button type="button" aria-label={`Decrease ${label.toLowerCase()}`} onClick={() => onChange(value - 1)} disabled={unavailable || value <= 1}>−</button>
    <input type="number" aria-label={label} min="1" max={max} step="1" value={value} disabled={unavailable} onChange={event => { const next = Number(event.target.value); if (Number.isFinite(next)) onChange(Math.max(1, Math.min(max, Math.trunc(next)))); }} />
    <button type="button" aria-label={`Increase ${label.toLowerCase()}`} onClick={() => onChange(value + 1)} disabled={unavailable || value >= max}>+</button>
  </div>;
}
