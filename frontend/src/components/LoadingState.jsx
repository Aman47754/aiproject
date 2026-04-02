export default function LoadingState() {
  return (
    <div className="loading-container" id="loading-state">
      <div className="loading-spinner" />
      <p className="loading-text">AI is analyzing weather & demand...</p>
      <p className="loading-subtext">Optimizing menu prices for you</p>

      <div className="skeleton-grid">
        {[...Array(6)].map((_, i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton skeleton-image" />
            <div className="skeleton-body">
              <div className="skeleton skeleton-line medium" />
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-btn" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
