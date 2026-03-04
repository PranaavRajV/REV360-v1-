import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from '../components/Toast';
import './Marketplace.css';

export default function Marketplace() {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => { loadAccessories(); }, [category]);

  const loadAccessories = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    api.getAccessories(params.toString()).then(setAccessories).catch(() => { }).finally(() => setLoading(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAccessories();
  };

  const addToCart = (acc) => {
    const existing = cart.find((c) => c._id === acc._id);
    if (existing) {
      setCart(cart.map((c) => c._id === acc._id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...acc, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((c) => c._id !== id));
  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const placeOrder = async () => {
    try {
      await api.createOrder({
        items: cart.map((c) => ({ accessory: c._id, quantity: c.qty, price: c.price })),
        totalAmount: cartTotal,
        paymentMethod: 'card',
      });
      setCart([]);
      setShowCart(false);
      toast('Order placed successfully!', 'success');
    } catch (err) { toast(err.message, 'error'); }
  };

  const categoryIcon = (c) => ({ maintenance: '🔧', cleaning: '🧽', protection: '🛡️', performance: '⚡', cosmetic: '✨', tools: '🧰' }[c] || '📦');
  const categories = ['maintenance', 'cleaning', 'protection', 'performance', 'cosmetic', 'tools'];

  return (
    <div className="page-active container">
      <div className="page-header">
        <div>
          <h1>Marketplace</h1>
          <p>Accessories, tools, and maintenance products</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCart(!showCart)}>
          🛒 Cart ({cart.reduce((s, c) => s + c.qty, 0)})
        </button>
      </div>

      <div className="marketplace-filters">
        <div className="category-tabs">
          <button className={`cat-tab ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>All</button>
          {categories.map((c) => (
            <button key={c} className={`cat-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {categoryIcon(c)} {c}
            </button>
          ))}
        </div>
        <form className="search-bar" onSubmit={handleSearch}>
          <input className="form-control" placeholder="Search accessories..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
      </div>

      {showCart && (
        <div className="cart-panel glass-card">
          <h3>Shopping Cart</h3>
          {cart.length === 0 ? <p className="cart-empty">Cart is empty</p> : (
            <>
              {cart.map((item) => (
                <div key={item._id} className="cart-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>₹{item.price} × {item.qty}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>₹{(item.price * item.qty).toLocaleString()}</span>
                    <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(item._id)}>✕</button>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <strong>Total: ₹{cartTotal.toLocaleString()}</strong>
                <button className="btn btn-primary" onClick={placeOrder}>Place Order</button>
              </div>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="product-grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '16px' }}></div>)}</div>
      ) : accessories.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
          <h2>No Products Found</h2>
          <p style={{ color: 'var(--text-muted)' }}>We couldn't find any accessories matching your criteria. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="product-grid">
          {accessories.map((a) => (
            <div key={a._id} className="product-card glass-card">
              <div className="product-icon">{categoryIcon(a.category)}</div>
              <div className="product-info">
                <h3>{a.name}</h3>
                <p className="product-brand">{a.brand}</p>
                <p className="product-desc">{a.description}</p>
                <div className="product-meta">
                  <span className="product-price">₹{a.price.toLocaleString()}</span>
                  <span className="product-rating">⭐ {a.rating}</span>
                </div>
                <div className="product-compat">
                  {a.compatibleVehicleTypes?.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => addToCart(a)} style={{ width: '100%', marginTop: '12px' }}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
