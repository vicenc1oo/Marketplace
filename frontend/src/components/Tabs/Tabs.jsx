import './Tabs.css';

// Accessible, controlled tab strip with arrow-key navigation.
export default function Tabs({ tabs, active, onChange, className = '' }) {
  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight') onChange(tabs[(i + 1) % tabs.length].id);
    if (e.key === 'ArrowLeft') onChange(tabs[(i - 1 + tabs.length) % tabs.length].id);
  };

  return (
    <div className={`tabs ${className}`} role="tablist" onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={`tabs__tab ${selected ? 'tabs__tab--active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {tab.count != null && <span className="tabs__count">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
