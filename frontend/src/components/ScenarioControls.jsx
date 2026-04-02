export default function ScenarioControls({ scenario, onChange }) {
  const { season, event, is_weekend, is_peak_hour } = scenario;

  return (
    <div className="scenario-bar" id="scenario-controls">
      <span className="scenario-bar-title">⚙️ Scenario</span>

      {/* Season */}
      <select
        className="scenario-select"
        value={season}
        onChange={(e) => onChange({ ...scenario, season: e.target.value })}
        aria-label="Season"
      >
        <option value="summer">☀️ Summer</option>
        <option value="monsoon">🌧️ Monsoon</option>
        <option value="winter">❄️ Winter</option>
      </select>

      {/* Event */}
      <select
        className="scenario-select"
        value={event}
        onChange={(e) => onChange({ ...scenario, event: e.target.value })}
        aria-label="Event"
      >
        <option value="none">📅 No Event</option>
        <option value="festival">🎉 Festival</option>
        <option value="promotion">🏷️ Promotion</option>
      </select>

      {/* Weekend */}
      <button
        className={`scenario-chip ${is_weekend ? 'active' : ''}`}
        onClick={() => onChange({ ...scenario, is_weekend: is_weekend ? 0 : 1 })}
      >
        {is_weekend ? '✓' : ''} Weekend
      </button>

      {/* Peak Hour */}
      <button
        className={`scenario-chip ${is_peak_hour ? 'active' : ''}`}
        onClick={() => onChange({ ...scenario, is_peak_hour: is_peak_hour ? 0 : 1 })}
      >
        {is_peak_hour ? '✓' : ''} Peak Hour
      </button>
    </div>
  );
}
