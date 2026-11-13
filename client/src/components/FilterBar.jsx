const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Open' },
  { id: 'completed', label: 'Done' },
];

export default function FilterBar({ value, onChange, counts }) {
  return (
    <div className="filter-bar" role="tablist" aria-label="Filter tasks">
      {FILTERS.map((f) => {
        const count = counts?.[f.id];
        const active = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`filter-btn${active ? ' is-active' : ''}`}
            onClick={() => onChange(f.id)}
          >
            <span>{f.label}</span>
            {typeof count === 'number' ? <span className="filter-count">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
