export default function WeatherHero({ weather }) {
  if (!weather || !weather.temp) return null;

  const getQuote = (type) => {
    if (type === 'hot') return '☀️ Stay cool! Refreshing delights await you';
    if (type === 'cold') return '❄️ Warm up with our cozy comfort dishes';
    if (type === 'rain') return '🌧️ Rainy cravings? We have the perfect picks';
    return '🍜 Perfect weather for something delicious';
  };

  const getSeasonFromTemp = (temp) => {
    if (temp >= 28) return 'Summer';
    if (temp >= 18) return 'Monsoon';
    return 'Winter';
  };

  const now = new Date();
  const hour = now.getHours();
  const isPeakHour = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21);

  return (
    <div className={`weather-hero ${weather.type}`} id="weather-hero">
      <div className="weather-content">
        <div className="weather-left">
          <div className="weather-location">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{weather.city}</span>
          </div>

          <div className="weather-temp-row">
            <span className="weather-icon">{weather.icon}</span>
            <span className="weather-temp">{Math.round(weather.temp)}°C</span>
          </div>

          <p className="weather-condition">
            {weather.condition} · {weather.description}
          </p>

          <div className="weather-quote">
            {getQuote(weather.type)}
          </div>
        </div>

        <div className="weather-right">
          <div className="weather-stat">
            <div className="weather-stat-value">{weather.humidity}%</div>
            <div className="weather-stat-label">Humidity</div>
          </div>
          <div className="weather-stat">
            <div className="weather-stat-value">{weather.wind} m/s</div>
            <div className="weather-stat-label">Wind</div>
          </div>
          <div className="weather-stat">
            <div className="weather-stat-value">{getSeasonFromTemp(weather.temp)}</div>
            <div className="weather-stat-label">Season</div>
          </div>
          <div className="weather-stat">
            <div className="weather-stat-value">{isPeakHour ? '🔥 Peak' : '⏳ Off'}</div>
            <div className="weather-stat-label">Hour</div>
          </div>
        </div>
      </div>
    </div>
  );
}