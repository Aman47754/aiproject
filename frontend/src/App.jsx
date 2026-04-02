import { useState, useEffect, useCallback } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import WeatherHero from './components/WeatherHero';
import MenuCard from './components/MenuCard';
import TopPicks from './components/TopPicks';
import CartSidebar from './components/CartSidebar';
import ScenarioControls from './components/ScenarioControls';
import LoadingState from './components/LoadingState';
import { ITEM_CATEGORIES } from './data/foodData';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

function App() {
  const [weather, setWeather] = useState(null);
  const [menu, setMenu] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const currentHour = now.getHours();
  const isCurrentlyWeekend = now.getDay() === 0 || now.getDay() === 6;
  const isCurrentlyPeakHour = (currentHour >= 12 && currentHour <= 14) || (currentHour >= 19 && currentHour <= 21);

  const [scenario, setScenario] = useState({
    season: 'summer',
    event: 'none',
    is_weekend: isCurrentlyWeekend ? 1 : 0,
    is_peak_hour: isCurrentlyPeakHour ? 1 : 0,
  });
  const maxDemand = Math.max(...menu.map(item => item.predicted_demand || 0), 1);
  // ——— Fetch Weather via Geolocation ———
  useEffect(() => {
    const fetchWeatherByCoords = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();
        processWeatherData(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        fetchWeatherByCity('Lucknow');
      }
    };

    const fetchWeatherByCity = async (city) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();
        processWeatherData(data);
      } catch (err) {
        console.error('Fallback weather error:', err);
        setError('Unable to fetch weather data. Please check your connection.');
        setLoading(false);
      }
    };

    const processWeatherData = (data) => {
      const temp = data.main.temp;
      const condition = data.weather[0].main;
      const description = data.weather[0].description;
      const humidity = data.main.humidity;
      const wind = data.wind.speed;

      let type = 'hot';
      let icon = '☀️';

      if (condition.includes('Rain') || condition.includes('Drizzle') || condition.includes('Thunderstorm')) {
        type = 'rain'; icon = '🌧️';
      } else if (temp < 18) {
        type = 'cold'; icon = '❄️';
      } else if (temp < 28) {
        icon = '🌤️';
      }

      let autoSeason = 'summer';
      if (temp < 18) autoSeason = 'winter';
      else if (temp < 28) autoSeason = 'monsoon';

      setWeather({ temp, condition, description, type, icon, city: data.name, humidity, wind: wind.toFixed(1) });
      setScenario((prev) => ({ ...prev, season: autoSeason }));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeatherByCoords(position.coords.latitude, position.coords.longitude),
        () => fetchWeatherByCity('Lucknow'),
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else {
      fetchWeatherByCity('Lucknow');
    }
  }, []);

  // ——— Fetch Menu from Backend ———
  const fetchMenu = useCallback(async () => {
    if (!weather) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarios: [{
            temperature: weather.temp,
            hour: new Date().getHours(),
            is_weekend: scenario.is_weekend,
            is_peak_hour: scenario.is_peak_hour,
            event: scenario.event,
            season: scenario.season,
          }],
          top_n: 10,
          min_demand_threshold: 1,
        }),
      });

      if (!res.ok) throw new Error('Backend API error');
      const data = await res.json();

      if (data && data.length > 0) {
        const enrichedMenu = (data[0].menu || []).map((item) => ({
          ...item,
          category: item.category ?? ITEM_CATEGORIES[item.name] ?? 'snack',
        }));
        const enrichedTopPicks = (data[0].top_recommendations || []).map((item) => ({
          ...item,
          category: item.category || ITEM_CATEGORIES[item.name] || 'snack',
        }));

        setMenu(enrichedMenu);
        setTopPicks(enrichedTopPicks);
      }
    } catch (err) {
      console.error('Menu fetch error:', err);
      setError('Unable to connect to the AI pricing engine. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, [weather, scenario]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // ——— Cart Actions ———
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === item.name);
      if (existing) return prev.map((c) => c.name === item.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };
  const uniqueMenu = Object.values(
  menu.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = item;
    }
    return acc;
  }, {})
  );

  const updateCartQty = (name, qty) => setCart((prev) => prev.map((c) => c.name === name ? { ...c, qty } : c));
  const removeFromCart = (name) => setCart((prev) => prev.filter((c) => c.name !== name));

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.optimal_price * item.qty, 0);

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <Navbar cartCount={cartCount} cartTotal={cartTotal} onCartOpen={() => setCartOpen(true)} />

      {/* WEATHER HERO */}
      <WeatherHero weather={weather} />

      {/* SCENARIO CONTROLS */}
      <ScenarioControls scenario={scenario} onChange={setScenario} />

      {/* CONTENT */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="error-container" id="error-state">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button className="btn-primary" onClick={fetchMenu}>Try Again</button>
        </div>
      ) : (
        <>
          <TopPicks items={topPicks} onAddToCart={addToCart} />

          <section className="menu-section" id="menu-section">
            <div className="menu-header">
              <div className="menu-header-left">
                <span style={{ fontSize: '24px' }}>🔥</span>
                <div>
                  <h2 className="section-title">Full AI-Optimized Menu</h2>
                  <p className="section-subtitle">Prices dynamically adjusted based on weather, demand & season</p>
                </div>
              </div>
              <span className="menu-count">{menu.length} items available</span>
            </div>

            <div className="menu-grid">
  {uniqueMenu.map((item, index) => (
    <MenuCard 
      key={item.name} 
      item={item} 
      index={index} 
      onAddToCart={addToCart} 
      maxDemand={maxDemand}
    />
  ))}
</div>
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer className="app-footer">
        <p className="footer-text">
          Powered by <span>FlavorAI</span> · AI-Driven Dynamic Menu Pricing Based on Weather & Demand
        </p>
      </footer>

      {/* CART SIDEBAR */}
      {cartOpen && (
        <CartSidebar cart={cart} onClose={() => setCartOpen(false)} onUpdateQty={updateCartQty} onRemove={removeFromCart} />
      )}
    </div>
  );
}

export default App;