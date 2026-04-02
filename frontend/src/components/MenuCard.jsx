import { FOOD_IMAGES, CATEGORY_COLORS } from '../data/foodData';

export default function MenuCard({ item, onAddToCart, index = 0, maxDemand = 1 }) {
  const image = item.image_url || FOOD_IMAGES[item.name] || '/images/placeholder.png';
  const category = item.category || 'snack';
  const priceDiff = item.optimal_price - item.base_price;
  const pricePct = ((priceDiff / item.base_price) * 100).toFixed(0);
  const demandPct = maxDemand
  ? (item.predicted_demand / maxDemand) * 100
  : 0;

  const getDemandLevel = (demand, maxDemand) => {
  const ratio = maxDemand ? demand / maxDemand : 0;

  if (ratio >= 0.7) return { level: 'High', className: 'bg-green-500' };
  if (ratio >= 0.4) return { level: 'Medium', className: 'bg-yellow-500' };
  return { level: 'Low', className: 'bg-red-500' };
};

  const getConfidenceLabel = (c) => {
  if (c >= 75) return { text: "🔥 High Confidence", color: "bg-green-500" };
  if (c >= 50) return { text: "⚡ Medium Confidence", color: "bg-yellow-500" };
  return { text: "❄️ Low Confidence", color: "bg-red-500" };
};

const confidenceInfo = getConfidenceLabel(item.confidence || 0);


const demandInfo = getDemandLevel(item.predicted_demand, maxDemand);

  return (
    <div
      className="menu-card"
      id={`menu-card-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="menu-card-image-wrap">
        <img
          src={image}
          alt={item.name}
          className="menu-card-image"
          loading="lazy"
        />
        <span
          className="menu-card-category"
          style={{ borderColor: CATEGORY_COLORS[category] || '#64748b' }}
        >
          {category?.replace('_', ' ')}
        </span>
      </div>

      <div className="menu-card-body">
        <h3 className="menu-card-name">{item.name}</h3>

        <div className="menu-card-prices">
          <div>
            <span className="menu-card-optimal">₹{Math.round(item.optimal_price)}</span>
            <span className="menu-card-base" style={{ marginLeft: 8 }}>₹{item.base_price}</span>
          </div>
          <span className={`price-badge ${priceDiff > 0 ? 'price-up' : priceDiff < 0 ? 'price-down' : 'price-same'}`}>
            {priceDiff > 0 ? '↑' : priceDiff < 0 ? '↓' : '→'} {Math.abs(pricePct)}%
          </span>
        </div>

        <div className="menu-card-demand">
          <div className="menu-card-demand-label">
            <span>Demand</span>
            <span className="menu-card-demand-value">{demandInfo.level} ({item.predicted_demand.toFixed(1)})</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
  <div
    className={`h-full ${demandInfo.className} transition-all duration-500`}
    style={{ width: `${demandPct}%` }}
  />
</div>
        </div>
        <div className="mt-3">
  <div className="flex justify-between text-xs text-gray-600 mb-1">
    <span>AI Confidence</span>
    <span className="font-medium">
      {confidenceInfo.text} ({item.confidence?.toFixed(1)}%)
    </span>
  </div>

  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
    <div
      className={`h-full ${confidenceInfo.color} transition-all duration-300`}
      style={{ width: `${item.confidence || 0}%` }}
    />
  </div>
</div>
        <div className="menu-card-revenue">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--accent-amber)' }}>
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          Expected Revenue: ₹{Math.round(item.expected_revenue)}
        </div>

        <button
          className="btn-primary menu-card-btn"
          onClick={() => onAddToCart(item)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
