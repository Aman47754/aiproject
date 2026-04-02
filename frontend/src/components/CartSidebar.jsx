export default function CartSidebar({ cart, onClose, onUpdateQty, onRemove }) {
  const total = cart.reduce((sum, item) => sum + item.optimal_price * item.qty, 0);
  const baseTotal = cart.reduce((sum, item) => sum + item.base_price * item.qty, 0);
  const savings = baseTotal - total;

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <aside className="cart-sidebar" id="cart-sidebar">
        <div className="cart-header">
          <h2>🛒 Your Cart</h2>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🍽️</div>
              <p>Your cart is empty</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Add dishes from the AI-powered menu
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.name}>
                <div className="cart-item-info">
                  <div>
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">₹{Math.round(item.optimal_price)} each</div>
                  </div>
                </div>
                <div className="cart-item-qty">
                  <button
                    className="cart-qty-btn"
                    onClick={() => item.qty <= 1 ? onRemove(item.name) : onUpdateQty(item.name, item.qty - 1)}
                  >
                    {item.qty <= 1 ? '🗑' : '−'}
                  </button>
                  <span className="cart-qty-num">{item.qty}</span>
                  <button
                    className="cart-qty-btn"
                    onClick={() => onUpdateQty(item.name, item.qty + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">₹{Math.round(total)}</span>
            </div>
            {savings > 0 && (
              <div className="cart-savings">
                You save ₹{Math.round(savings)} with AI pricing! 🎉
              </div>
            )}
            {savings < 0 && (
              <div className="cart-savings" style={{ color: 'var(--text-muted)' }}>
                Dynamic surge: ₹{Math.round(Math.abs(savings))} (high demand)
              </div>
            )}
            <button className="btn-primary cart-checkout-btn">
              Place Order →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
