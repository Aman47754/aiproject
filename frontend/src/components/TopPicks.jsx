import { useMemo } from 'react';
import { FOOD_IMAGES } from '../data/foodData';

export default function TopPicks({ items, onAddToCart }) {
  if (!items || items.length === 0) return null;

  // ✅ Remove duplicates + keep best revenue + ensure top 3
  const filteredTopPicks = useMemo(() => {
    const map = {};

    // Step 1: Deduplicate (keep highest revenue item per name)
    items.forEach((item) => {
      if (
        !map[item.name] ||
        item.expected_revenue > map[item.name].expected_revenue
      ) {
        map[item.name] = item;
      }
    });

    let unique = Object.values(map).sort(
      (a, b) => b.expected_revenue - a.expected_revenue
    );

    // Step 2: Fill if less than 3 items
    if (unique.length < 3) {
      const remaining = items
        .sort((a, b) => b.expected_revenue - a.expected_revenue)
        .filter((item) => !unique.find((u) => u.name === item.name));

      unique = [...unique, ...remaining];
    }

    // Step 3: Return top 3
    return unique.slice(0, 3);
  }, [items]);

  return (
    <section className="top-picks-section" id="top-picks">
      <div className="top-picks-header">
        <span className="top-picks-icon">🏆</span>
        <div>
          <h2 className="section-title">AI Top Recommendations</h2>
          <p className="section-subtitle">
            Highest revenue potential based on current weather & demand
          </p>
        </div>
      </div>

      <div className="top-picks-grid">
        {filteredTopPicks.map((item, index) => {
          const image =
            item.image_url || FOOD_IMAGES[item.name] || '/images/placeholder.png';

          return (
            <div
              className="top-pick-card"
              key={item.name}
              onClick={() => onAddToCart(item)}
              style={{ cursor: 'pointer' }}
            >
              <span className="top-pick-badge">
                #{index + 1} Top Pick
              </span>

              <img
                src={image}
                alt={item.name}
                className="top-pick-image"
                loading="lazy"
              />

              <div className="top-pick-info">
                <h3 className="top-pick-name">{item.name}</h3>

                <div className="top-pick-prices">
                  <span className="top-pick-optimal">
                    ₹{Math.round(item.optimal_price)}
                  </span>
                  <span className="top-pick-base">
                    ₹{item.base_price}
                  </span>
                </div>

                <div className="top-pick-revenue">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>

                  Revenue: ₹{Math.round(item.expected_revenue)} · Demand:{' '}
                  {item.predicted_demand.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}