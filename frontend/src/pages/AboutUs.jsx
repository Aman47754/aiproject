import Navbar from '../components/Navbar';

export default function AboutUs() {
  return (
    <div className="app-container">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-glow" />
        <div className="about-hero-content">
          <span className="about-hero-badge">🚀 Our Story</span>
          <h1 className="about-hero-title">
            Redefining Restaurant Pricing
            <span className="about-hero-accent"> with AI</span>
          </h1>
          <p className="about-hero-desc">
            FlavorAI Bistro leverages cutting-edge machine learning to dynamically optimize
            menu pricing based on real-time weather, demand patterns, and seasonal trends —
            maximizing revenue while keeping customers delighted.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-section">
        <div className="about-cards-grid">
          <div className="about-card">
            <div className="about-card-icon">🎯</div>
            <h3 className="about-card-title">Our Mission</h3>
            <p className="about-card-text">
              To empower restaurants with intelligent, data-driven pricing strategies that
              adapt in real-time, ensuring optimal revenue and a seamless dining experience
              for every customer.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">🔭</div>
            <h3 className="about-card-title">Our Vision</h3>
            <p className="about-card-text">
              A world where every restaurant — from local eateries to chains — can harness
              the power of AI to make smarter business decisions, reduce food waste, and
              serve the perfect dish at the perfect price.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">💡</div>
            <h3 className="about-card-title">Innovation First</h3>
            <p className="about-card-text">
              We combine weather intelligence, demand forecasting, and behavioral analytics
              into a unified pricing engine that continuously learns and adapts to market
              conditions.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-section">
        <h2 className="about-section-heading">
          <span className="about-section-icon">⚙️</span>
          How It Works
        </h2>
        <div className="about-steps">
          <div className="about-step">
            <div className="about-step-number">01</div>
            <div className="about-step-content">
              <h4 className="about-step-title">Weather Detection</h4>
              <p className="about-step-text">
                Our system automatically detects your local weather using geolocation
                and real-time weather APIs, understanding temperature, conditions, and humidity.
              </p>
            </div>
          </div>

          <div className="about-step">
            <div className="about-step-number">02</div>
            <div className="about-step-content">
              <h4 className="about-step-title">Demand Prediction</h4>
              <p className="about-step-text">
                AI models analyze historical data, weather patterns, time of day, weekends,
                events, and seasonal factors to predict demand for each menu item.
              </p>
            </div>
          </div>

          <div className="about-step">
            <div className="about-step-number">03</div>
            <div className="about-step-content">
              <h4 className="about-step-title">Price Optimization</h4>
              <p className="about-step-text">
                Our proprietary algorithm calculates the optimal price point that maximizes
                expected revenue while maintaining customer satisfaction and fairness.
              </p>
            </div>
          </div>

          <div className="about-step">
            <div className="about-step-number">04</div>
            <div className="about-step-content">
              <h4 className="about-step-title">Real-Time Updates</h4>
              <p className="about-step-text">
                Menu prices update dynamically throughout the day as conditions change,
                ensuring your restaurant always operates at peak efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="about-section">
        <h2 className="about-section-heading">
          <span className="about-section-icon">🛠️</span>
          Powered By
        </h2>
        <div className="about-tech-grid">
          {[
            { icon: '⚛️', name: 'React', desc: 'Frontend Framework' },
            { icon: '🐍', name: 'Python / Flask', desc: 'Backend API' },
            { icon: '🧠', name: 'Scikit-Learn', desc: 'ML Models' },
            { icon: '🌤️', name: 'OpenWeather API', desc: 'Real-time Weather' },
            { icon: '📊', name: 'Pandas / NumPy', desc: 'Data Processing' },
            { icon: '🎨', name: 'Modern CSS', desc: 'Glassmorphism UI' },
          ].map((tech) => (
            <div className="about-tech-card" key={tech.name}>
              <span className="about-tech-icon">{tech.icon}</span>
              <div className="about-tech-name">{tech.name}</div>
              <div className="about-tech-desc">{tech.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <p className="footer-text">
          Powered by <span>FlavorAI</span> · AI-Driven Dynamic Menu Pricing Based on Weather & Demand
        </p>
      </footer>
    </div>
  );
}
