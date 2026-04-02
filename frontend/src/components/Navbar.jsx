import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ cartCount = 0, cartTotal = 0, onCartOpen }) {
  const { user, token, logout } = useAuth();

  return (
    <nav className="main-navbar" id="main-navbar">
      <div className="main-navbar-inner">
        {/* Brand */}
        <NavLink to="/" className="main-navbar-brand" style={{ textDecoration: 'none' }}>
          <span className="main-navbar-logo">👨‍🍳🍴</span>
          <div>
            <div className="main-navbar-title">FlavorAI Bistro</div>
            <div className="main-navbar-subtitle">
              {user ? (
                <div className="restaurant-badge">
                  {user.restaurant_name}
                </div>
              ) : (
                "AI-Driven Dynamic Menu Pricing"
              )}
            </div>
          </div>
        </NavLink>

        {/* Nav Links */}
        <div className="main-navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `main-nav-link ${isActive ? 'active' : ''}`}
            id="nav-menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3z" /><path d="M3 9h18" /><path d="M9 21V9" />
            </svg>
            Menu
          </NavLink>

          {token && (
            <>
              <NavLink
                to="/analytics"
                className={({ isActive }) => `main-nav-link ${isActive ? 'active' : ''}`}
                id="nav-analytics"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                </svg>
                Analytics
              </NavLink>

              <NavLink
                to="/owner"
                className={({ isActive }) => `main-nav-link ${isActive ? 'active' : ''}`}
                id="nav-owner-dashboard"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
                Owner Dashboard
              </NavLink>
            </>
          )}

          <NavLink
            to="/about"
            className={({ isActive }) => `main-nav-link ${isActive ? 'active' : ''}`}
            id="nav-about"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
            About Us
          </NavLink>
        </div>

        {/* Right Actions */}
        <div className="main-navbar-actions">
          {token ? (
            <div className="auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <NavLink to="/profile" className="main-nav-link" title="Restaurant Profile" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <span className="hide-on-mobile">{user?.email}</span>
              </NavLink>
              <button className="btn-secondary" onClick={logout} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-actions flex items-center gap-4">
              <NavLink
                to="/login"
                className="main-nav-link flex items-center"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="btn-primary flex items-center justify-center"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: 'white',
                  textDecoration: 'none'
                }}
              >
                Register
              </NavLink>
            </div>
          )}
          {onCartOpen && (
            <button className="cart-button" onClick={onCartOpen} id="cart-toggle" style={{ marginLeft: '10px' }}>
              🛒 ₹{Math.round(cartTotal)}
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
