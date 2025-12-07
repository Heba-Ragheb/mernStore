import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

function Cart() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    if (user) {
      // Cart now contains {productId, quantity} structure
      // Need to populate product details
      fetchCartDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCartDetails = async () => {
    try {
      if (!user?.cart || user.cart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Fetch full product details for each cart item
      const cartWithDetails = await Promise.all(
        user.cart.map(async (item) => {
          try {
            const res = await axios.get(
              `${API_URL}/api/products/show/${item.productId}`
            );
            return {
              ...res.data.product,
              quantity: item.quantity,
              cartProductId: item.productId
            };
          } catch (error) {
            console.error(`Failed to fetch product ${item.productId}:`, error);
            return null;
          }
        })
      );

      setCartItems(cartWithDetails.filter(item => item !== null));
    } catch (error) {
      console.error('Error fetching cart details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await axios.post(
        `${API_URL}/api/products/removeFromCard/${productId}`,
        {},
        { withCredentials: true }
      );
      await checkAuth();
      alert('Product removed from cart');
    } catch (error) {
      console.error(error);
      alert('Failed to remove from cart');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.post(
        `${API_URL}/api/products/updateCartQuantity/${productId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      await checkAuth();
    } catch (error) {
      console.error(error);
      alert('Failed to update quantity');
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + (item.finalPrice || 0) * (item.quantity || 1), 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <p>Your cart is empty</p>
            <a href="/products" className="btn-shop">
              Continue Shopping
            </a>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <img src={item.images?.[0]?.url} alt={item.name} />
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p className="cart-item-description">
                      {item.description?.substring(0, 100)}...
                    </p>
                    <p className="cart-item-price">${item.finalPrice}</p>
                    
                    {/* Quantity Controls */}
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= (item.stock || 999)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>
                    
                    <p className="item-subtotal">
                      Subtotal: ${(item.finalPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item._id)}
                    className="btn-remove"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
              <button onClick={handleCheckout} className="btn-checkout">
                Proceed to Checkout
              </button>
              <button onClick={() => navigate('/orders')} className="btn-view-orders">
                View My Orders
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;