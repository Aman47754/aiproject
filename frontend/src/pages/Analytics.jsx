import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FOOD_IMAGES, FOOD_EMOJIS } from '../data/foodData';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// Remove duplicates by name
const getUniqueMenuData = (data) => {
  const map = new Map();

  data.forEach(item => {
    if (!map.has(item.name)) {
      map.set(item.name, item);
    } else {
      const existing = map.get(item.name);
      if ((item.predicted_demand || 0) > (existing.predicted_demand || 0)) {
        map.set(item.name, item);
      }
    }
  });

  return Array.from(map.values());
};

export default function Analytics() {
  const { token } = useAuth();
  const [weather, setWeather] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const url = lat !== undefined
          ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          : `https://api.openweathermap.org/data/2.5/weather?q=Lucknow&appid=${API_KEY}&units=metric`;
        const res = await fetch(url);
        const data = await res.json();
        const temp = data.main.temp;
        const condition = data.weather[0].main;
        let type = 'hot', icon = '☀️';
        if (condition.includes('Rain') || condition.includes('Drizzle')) { type = 'rain'; icon = '🌧️'; }
        else if (temp < 18) { type = 'cold'; icon = '❄️'; }
        else if (temp < 28) { icon = '🌤️'; }
        setWeather({ temp, condition, type, icon, city: data.name, humidity: data.main.humidity, wind: data.wind.speed });
      } catch {
        setWeather({ temp: 30, condition: 'Clear', type: 'hot', icon: '☀️', city: 'Default', humidity: 50, wind: 5 });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(),
        { timeout: 8000 }
      );
    } else {
      fetchWeather();
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    if (!weather) return;
    setLoading(true);
    try {
      const now = new Date();
      const hour = now.getHours();
      let season = 'summer';
      if (weather.temp < 18) season = 'winter';
      else if (weather.temp < 28) season = 'monsoon';

      const res = await fetch(`${BACKEND_URL}/menu`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          scenarios: [{
            temperature: weather.temp,
            hour,
            is_weekend: (now.getDay() === 0 || now.getDay() === 6) ? 1 : 0,
            is_peak_hour: ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) ? 1 : 0,
            event: 'none',
            season,
          }],
          top_n: 10,
          min_demand_threshold: 1,
        }),
      });

      const data = await res.json();

      if (data && data.length > 0) {
        const rawMenu = data[0].menu || [];
        const uniqueMenu = getUniqueMenuData(rawMenu);
        setMenuData(uniqueMenu);
      }
    } catch (err) {
      console.error('Menu fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [weather]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const uniqueMenu = getUniqueMenuData(menuData);

  const totalItems = uniqueMenu.length;
  const avgDemand = totalItems > 0 ? (uniqueMenu.reduce((s, i) => s + (i.predicted_demand || 0), 0) / totalItems) : 0;
  const totalRevenue = uniqueMenu.reduce((s, i) => s + (i.expected_revenue || 0), 0);
  const avgPriceChange = totalItems > 0
    ? (uniqueMenu.reduce((s, i) => s + ((i.optimal_price - i.base_price) / i.base_price) * 100, 0) / totalItems)
    : 0;

  const topByDemand = [...uniqueMenu].sort((a, b) => (b.predicted_demand || 0) - (a.predicted_demand || 0)).slice(0, 5);
  const topByRevenue = [...uniqueMenu].sort((a, b) => (b.expected_revenue || 0) - (a.expected_revenue || 0)).slice(0, 5);

  const priceUpCount = uniqueMenu.filter(i => i.optimal_price > i.base_price).length;
  const priceDownCount = uniqueMenu.filter(i => i.optimal_price < i.base_price).length;
  const priceSameCount = uniqueMenu.filter(i => i.optimal_price === i.base_price).length;

  const categoryMap = {};
  uniqueMenu.forEach(item => {
    const cat = item.category || 'other';
    if (!categoryMap[cat]) categoryMap[cat] = { count: 0, revenue: 0, demand: 0 };
    categoryMap[cat].count++;
    categoryMap[cat].revenue += item.expected_revenue || 0;
    categoryMap[cat].demand += item.predicted_demand || 0;
  });

  const maxRevenue = Math.max(...uniqueMenu.map(i => i.expected_revenue || 0), 1);
  const maxDemand = Math.max(...uniqueMenu.map(i => i.predicted_demand || 0), 1);

  return (
    <div className="app-container">
      <Navbar />

      <section className="analytics-header">
        <div>
          <h1 className="analytics-page-title">📊 Analytics Dashboard</h1>
          <p className="analytics-page-subtitle">
            Real-time insights into your AI-optimized menu performance
          </p>
        </div>
        {weather && (
          <div className="analytics-weather-pill">
            {weather.icon} {weather.city} · {Math.round(weather.temp)}°C · {weather.condition}
          </div>
        )}
      </section>

      {loading ? (
        <div className="owner-empty" style={{ minHeight: 400 }}>
          <div className="loading-spinner" />
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          <div className="analytics-kpi-grid">
            <div className="analytics-kpi-card kpi-orange">
              <div className="kpi-icon">📦</div>
              <div className="kpi-value">{totalItems}</div>
              <div className="kpi-label">Total Menu Items</div>
            </div>
            <div className="analytics-kpi-card kpi-emerald">
              <div className="kpi-icon">💰</div>
              <div className="kpi-value">₹{Math.round(totalRevenue).toLocaleString()}</div>
              <div className="kpi-label">Projected Revenue</div>
            </div>
            <div className="analytics-kpi-card kpi-cyan">
              <div className="kpi-icon">📈</div>
              <div className="kpi-value">{avgDemand.toFixed(1)}</div>
              <div className="kpi-label">Avg Demand Score</div>
            </div>
            <div className="analytics-kpi-card kpi-violet">
              <div className="kpi-icon">{avgPriceChange >= 0 ? '↗️' : '↘️'}</div>
              <div className="kpi-value">{avgPriceChange >= 0 ? '+' : ''}{avgPriceChange.toFixed(1)}%</div>
              <div className="kpi-label">Avg Price Adjustment</div>
            </div>
          </div>

          <div className="analytics-row">
            <div className="analytics-panel">
              <h3 className="analytics-panel-title">🔄 Price Adjustment Distribution</h3>
              <div className="analytics-price-dist">
                <div className="dist-bar-group">
                  <div className="dist-label">Price Increase</div>
                  <div className="dist-bar-track">
                    <div className="dist-bar-fill dist-up" style={{ width: `${totalItems > 0 ? (priceUpCount / totalItems) * 100 : 0}%` }} />
                  </div>
                  <div className="dist-count">{priceUpCount} items</div>
                </div>
                <div className="dist-bar-group">
                  <div className="dist-label">Price Decrease</div>
                  <div className="dist-bar-track">
                    <div className="dist-bar-fill dist-down" style={{ width: `${totalItems > 0 ? (priceDownCount / totalItems) * 100 : 0}%` }} />
                  </div>
                  <div className="dist-count">{priceDownCount} items</div>
                </div>
                <div className="dist-bar-group">
                  <div className="dist-label">No Change</div>
                  <div className="dist-bar-track">
                    <div className="dist-bar-fill dist-same" style={{ width: `${totalItems > 0 ? (priceSameCount / totalItems) * 100 : 0}%` }} />
                  </div>
                  <div className="dist-count">{priceSameCount} items</div>
                </div>
              </div>
            </div>

            <div className="analytics-panel">
              <h3 className="analytics-panel-title">🏷️ Category Breakdown</h3>
              <div className="analytics-cat-list">
                {Object.entries(categoryMap).map(([cat, data]) => (
                  <div className="analytics-cat-row" key={cat}>
                    <div className="cat-name">{cat.replace('_', ' ')}</div>
                    <div className="cat-stats">
                      <span>{data.count} items</span>
                      <span>₹{Math.round(data.revenue)}</span>
                    </div>
                    <div className="dist-bar-track" style={{ flex: 1 }}>
                      <div className="dist-bar-fill dist-cat" style={{ width: `${(data.revenue / totalRevenue) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analytics-row">
            <div className="analytics-panel">
              <h3 className="analytics-panel-title">🔥 Top 5 by Demand</h3>
              <div className="analytics-rank-list">
                {topByDemand.map((item, i) => (
                  <div className="analytics-rank-item" key={item.name}>
                    <span className="rank-num">#{i + 1}</span>
                    <div className="rank-info">
                      <span className="rank-name">{item.name}</span>
                      <div className="rank-bar-track">
                        <div className="rank-bar-fill demand-high" style={{ width: `${((item.predicted_demand || 0) / maxDemand) * 100}%` }} />
                      </div>
                    </div>
                    <span className="rank-value">{(item.predicted_demand || 0).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-panel">
              <h3 className="analytics-panel-title">💎 Top 5 by Revenue</h3>
              <div className="analytics-rank-list">
                {topByRevenue.map((item, i) => (
                  <div className="analytics-rank-item" key={item.name}>
                    <span className="rank-num">#{i + 1}</span>
                    <div className="rank-info">
                      <span className="rank-name">{item.name}</span>
                      <div className="rank-bar-track">
                        <div className="rank-bar-fill" style={{ width: `${((item.expected_revenue || 0) / maxRevenue) * 100}%`, background: 'linear-gradient(90deg, var(--accent-amber), var(--accent-orange))' }} />
                      </div>
                    </div>
                    <span className="rank-value">₹{Math.round(item.expected_revenue || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analytics-panel" style={{ marginTop: 0 }}>
            <h3 className="analytics-panel-title">📋 Complete Pricing Analysis</h3>
            <div className="owner-table-wrap">
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Base ₹</th>
                    <th>AI Price ₹</th>
                    <th>Change</th>
                    <th>Demand</th>
                    <th>Revenue ₹</th>
                  </tr>
                </thead>
                <tbody>
                  {[...uniqueMenu]
                    .sort((a, b) => (b.expected_revenue || 0) - (a.expected_revenue || 0))
                    .map((item) => {
                      const diff = item.optimal_price - item.base_price;
                      const pct = ((diff / item.base_price) * 100).toFixed(0);
                      return (
                        <tr key={item.name}>
                          <td className="owner-table-name">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="owner-table-img" />
                              ) : (
                                <span className="owner-table-emoji">{FOOD_EMOJIS[item.name] || '🍽️'}</span>
                              )}
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td>₹{item.base_price}</td>
                          <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>₹{Math.round(item.optimal_price)}</td>
                          <td>
                            <span className={`price-badge ${diff > 0 ? 'price-up' : diff < 0 ? 'price-down' : 'price-same'}`}>
                              {diff > 0 ? '↑' : diff < 0 ? '↓' : '→'} {Math.abs(pct)}%
                            </span>
                          </td>
                          <td>{(item.predicted_demand || 0).toFixed(1)}</td>
                          <td style={{ fontWeight: 600 }}>₹{Math.round(item.expected_revenue || 0)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <footer className="app-footer">
        <p className="footer-text">
          Powered by <span>FlavorAI</span> · AI-Driven Dynamic Menu Pricing Based on Weather & Demand
        </p>
      </footer>
    </div>
  );
}