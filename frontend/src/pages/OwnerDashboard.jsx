import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FOOD_IMAGES, FOOD_EMOJIS, CATEGORY_COLORS } from '../data/foodData';
import Navbar from '../components/Navbar';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const EMPTY_ITEM = {
  name: '',
  base_price: '',
  category: 'snack',
  cuisine_type: 'indian',
  min_temp: 0,
  max_temp: 50,
  image_url: '',
};

export default function OwnerDashboard() {
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ ...EMPTY_ITEM });
  const [recommendations, setRecommendations] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Fetch weather on mount
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

        setWeather({ temp, condition, type, icon, city: data.name, humidity: data.main.humidity });
      } catch {
        setWeather({ temp: 30, condition: 'Clear', type: 'hot', icon: '☀️', city: 'Default', humidity: 50 });
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

  // Fetch menu from db on mount
  const fetchMenu = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/get-menu`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error('Fetch menu error:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Upload image to Cloudinary via Backend
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setNewItem(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  // Add / Update item
  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.base_price) return;

    const item = {
      ...newItem,
      base_price: parseFloat(newItem.base_price),
      min_temp: parseFloat(newItem.min_temp),
      max_temp: parseFloat(newItem.max_temp),
    };

    try {
      const url = editIndex !== null ? '/update-item' : '/add-item';
      const method = editIndex !== null ? 'PUT' : 'POST';
      
      const res = await fetch(`${BACKEND_URL}${url}`, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });

      if (res.ok) {
        await fetchMenu();
        setNewItem({ ...EMPTY_ITEM });
        setEditIndex(null);
      }
    } catch (err) {
      console.error('Error saving item:', err);
    }
  };

  const handleEdit = (index) => {
    setNewItem({ ...menuItems[index], base_price: String(menuItems[index].base_price) });
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    const itemToDelete = menuItems[index];
    try {
      const res = await fetch(`${BACKEND_URL}/delete-item`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: itemToDelete.name })
      });

      if (res.ok) {
        await fetchMenu();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // Get AI recommendations
  const getRecommendations = useCallback(async () => {
    if (menuItems.length === 0 || !weather) return;
    setLoading(true);

    try {
      const now = new Date();
      const hour = now.getHours();
      let season = 'summer';
      if (weather.temp < 18) season = 'winter';
      else if (weather.temp < 28) season = 'monsoon';

      const res = await fetch(`${BACKEND_URL}/custom-menu`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: menuItems,
          scenario: {
            temperature: weather.temp,
            hour,
            is_weekend: (now.getDay() === 0 || now.getDay() === 6) ? 1 : 0,
            is_peak_hour: ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) ? 1 : 0,
            event: 'none',
            season,
          },
          top_n: 5,
        }),
      });

      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error:', err);
      setRecommendations(null);
    } finally {
      setLoading(false);
    }
  }, [menuItems, weather]);

  const getDemandClass = (demand) => {
    if (demand >= 7) return 'demand-high';
    if (demand >= 4) return 'demand-medium';
    return 'demand-low';
  };

  const getDemandLabel = (demand) => {
    if (demand >= 7) return 'High';
    if (demand >= 4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <Navbar />

      {/* WEATHER STRIP */}
      {weather && (
        <div className="owner-weather-strip">
          <span>{weather.icon} {weather.city} · {Math.round(weather.temp)}°C · {weather.condition}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            AI prices are based on current weather & demand
          </span>
        </div>
      )}

      {/* TWO COLUMN LAYOUT */}
      <div className="owner-grid">
        {/* LEFT: Menu Form */}
        <div className="owner-form-section">
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            📝 {editIndex !== null ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>

          <div className="owner-form">
            <div className="owner-form-row">
              <label className="owner-label">Dish Name</label>
              <input
                className="owner-input"
                type="text"
                placeholder="e.g. Butter Chicken"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                id="input-dish-name"
              />
            </div>

            <div className="owner-form-row">
              <label className="owner-label">Base Price (₹)</label>
              <input
                className="owner-input"
                type="number"
                placeholder="e.g. 250"
                value={newItem.base_price}
                onChange={(e) => setNewItem({ ...newItem, base_price: e.target.value })}
                id="input-base-price"
              />
            </div>

            <div className="owner-form-row-half">
              <div>
                <label className="owner-label">Category</label>
                <select
                  className="owner-select"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  id="select-category"
                >
                  <option value="beverage">🥤 Beverage</option>
                  <option value="fast_food">🍔 Fast Food</option>
                  <option value="main_course">🍛 Main Course</option>
                  <option value="snack">🍿 Snack</option>
                </select>
              </div>

              <div>
                <label className="owner-label">Cuisine</label>
                <select
                  className="owner-select"
                  value={newItem.cuisine_type}
                  onChange={(e) => setNewItem({ ...newItem, cuisine_type: e.target.value })}
                  id="select-cuisine"
                >
                  <option value="indian">🇮🇳 Indian</option>
                  <option value="continental">🌍 Continental</option>
                  <option value="italian">🇮🇹 Italian</option>
                  <option value="chinese">🇨🇳 Chinese</option>
                  <option value="american">🇺🇸 American</option>
                </select>
              </div>
            </div>

            <div className="owner-form-row">
              <label className="owner-label">Dish Image</label>
              <div className="image-upload-wrapper">
                {newItem.image_url ? (
                  <div className="image-preview-container">
                    <img src={newItem.image_url} alt="Preview" className="image-preview" />
                    <button className="btn-remove-image" onClick={() => setNewItem({ ...newItem, image_url: '' })}>✕</button>
                  </div>
                ) : (
                  <div className="file-input-container">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="input-dish-image"
                      className="file-input"
                      disabled={uploading}
                    />
                    <label htmlFor="input-dish-image" className="file-input-label">
                      {uploading ? '⌛ Uploading...' : '📁 Choose Food Image'}
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="owner-form-row-half">
              <div>
                <label className="owner-label">Min Temp (°C)</label>
                <input
                  className="owner-input"
                  type="number"
                  value={newItem.min_temp}
                  onChange={(e) => setNewItem({ ...newItem, min_temp: e.target.value })}
                  id="input-min-temp"
                />
              </div>
              <div>
                <label className="owner-label">Max Temp (°C)</label>
                <input
                  className="owner-input"
                  type="number"
                  value={newItem.max_temp}
                  onChange={(e) => setNewItem({ ...newItem, max_temp: e.target.value })}
                  id="input-max-temp"
                />
              </div>
            </div>

            <button className="btn-primary" onClick={handleAddItem} style={{ width: '100%', marginTop: 8 }}>
              {editIndex !== null ? '✏️ Update Item' : '➕ Add to Menu'}
            </button>

            {editIndex !== null && (
              <button
                className="btn-secondary"
                onClick={() => { setEditIndex(null); setNewItem({ ...EMPTY_ITEM }); }}
                style={{ width: '100%', marginTop: 8 }}
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* ITEMS TABLE */}
          <h3 className="section-title" style={{ marginTop: 32, marginBottom: 12 }}>
            📋 Your Menu ({menuItems.length} items)
          </h3>

          {menuItems.length === 0 ? (
            <div className="owner-empty">
              <span style={{ fontSize: 40 }}>🍽️</span>
              <p>No items yet. Add your first dish above!</p>
            </div>
          ) : (
            <div className="owner-table-wrap">
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Temp Range</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item, i) => (
                    <tr key={i}>
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
                      <td>
                        <span className="owner-cat-badge" style={{ borderColor: CATEGORY_COLORS[item.category] }}>
                          {item.category?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{item.min_temp}°C–{item.max_temp}°C</td>
                      <td>
                        <div className="owner-table-actions">
                          <button className="owner-action-btn" onClick={() => handleEdit(i)} title="Edit">✏️</button>
                          <button className="owner-action-btn owner-action-del" onClick={() => handleDelete(i)} title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {menuItems.length > 0 && (
            <button
              className="btn-primary"
              onClick={getRecommendations}
              disabled={loading}
              style={{ width: '100%', marginTop: 20, padding: '14px 20px', fontSize: 16 }}
              id="btn-get-recommendations"
            >
              {loading ? '🔄 Analyzing...' : '🤖 Get AI Recommendations'}
            </button>
          )}
        </div>

        {/* RIGHT: AI Recommendations */}
        <div className="owner-results-section">
          <h2 className="section-title" style={{ marginBottom: 8 }}>
            🤖 AI Recommendations
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 20 }}>
            Based on current weather ({weather ? `${Math.round(weather.temp)}°C` : '...'}) and demand analysis
          </p>

          {!recommendations && !loading && (
            <div className="owner-empty" style={{ minHeight: 300 }}>
              <span style={{ fontSize: 48 }}>🧠</span>
              <p style={{ maxWidth: 300, textAlign: 'center' }}>
                Add menu items on the left and click <strong>"Get AI Recommendations"</strong> to see optimal pricing and top picks.
              </p>
            </div>
          )}

          {loading && (
            <div className="owner-empty" style={{ minHeight: 300 }}>
              <div className="loading-spinner" />
              <p>AI is analyzing your menu...</p>
            </div>
          )}

          {recommendations && !loading && (
            <>
              {/* Top Recommendations */}
              {recommendations.top_recommendations?.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: 12 }}>
                    🏆 Top Dishes to Push Right Now
                  </h3>
                  <div className="owner-rec-cards">
                    {recommendations.top_recommendations.map((item, i) => (
                      <div className="owner-rec-card" key={item.name}>
                        <div className="owner-rec-rank">#{i + 1}</div>
                        <div className="owner-rec-img-wrap">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="owner-rec-img" />
                          ) : FOOD_IMAGES[item.name] ? (
                            <img src={FOOD_IMAGES[item.name]} alt={item.name} className="owner-rec-img" />
                          ) : (
                            <div className="owner-rec-emoji">{FOOD_EMOJIS[item.name] || '🍽️'}</div>
                          )}
                        </div>
                        <div className="owner-rec-info">
                          <div className="owner-rec-name">{item.name}</div>
                          <div className="owner-rec-prices">
                            <span className="owner-rec-optimal">₹{Math.round(item.optimal_price)}</span>
                            <span className="owner-rec-base">₹{item.base_price}</span>
                          </div>
                          <div className="owner-rec-stats">
                            <span>Demand: {getDemandLabel(item.predicted_demand)}</span>
                            <span>Rev: ₹{Math.round(item.expected_revenue)}</span>
                          </div>
                          <div className="demand-gauge" style={{ marginTop: 6 }}>
                            <div
                              className={`demand-gauge-fill ${getDemandClass(item.predicted_demand)}`}
                              style={{ width: `${Math.min(Math.max((item.predicted_demand / 10) * 100, 5), 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Results Table */}
              {recommendations.menu?.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                    📊 Full Pricing Analysis ({recommendations.menu.length} items match current weather)
                  </h3>
                  <div className="owner-table-wrap">
                    <table className="owner-table">
                      <thead>
                        <tr>
                          <th>Dish</th>
                          <th>Base ₹</th>
                          <th>AI Price ₹</th>
                          <th>Change</th>
                          <th>Demand</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendations.menu
                          .sort((a, b) => b.expected_revenue - a.expected_revenue)
                          .map((item) => {
                            const diff = item.optimal_price - item.base_price;
                            const pct = ((diff / item.base_price) * 100).toFixed(0);
                            return (
                              <tr key={item.name}>
                                <td className="owner-table-name">
                                  <span>{FOOD_EMOJIS[item.name] || '🍽️'}</span> {item.name}
                                </td>
                                <td>₹{item.base_price}</td>
                                <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                                  ₹{Math.round(item.optimal_price)}
                                </td>
                                <td>
                                  <span className={`price-badge ${diff > 0 ? 'price-up' : diff < 0 ? 'price-down' : 'price-same'}`}>
                                    {diff > 0 ? '↑' : diff < 0 ? '↓' : '→'} {Math.abs(pct)}%
                                  </span>
                                </td>
                                <td>{item.predicted_demand.toFixed(1)}</td>
                                <td style={{ fontWeight: 600 }}>₹{Math.round(item.expected_revenue)}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {recommendations.menu?.length === 0 && (
                <div className="owner-empty">
                  <span style={{ fontSize: 40 }}>🌡️</span>
                  <p>None of your items match the current temperature range ({weather ? `${Math.round(weather.temp)}°C` : ''}). Try adjusting the temperature ranges on your menu items.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <p className="footer-text">
          Powered by <span>FlavorAI</span> · Owner Dashboard · AI-Driven Dynamic Menu Pricing
        </p>
      </footer>
    </div>
  );
}