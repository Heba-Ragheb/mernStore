import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

function Cart() {
  const { user, checkAuth } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    if (user) {
      setCartItems(user.card || []);
      setLoading(false);
    }
  }, [user]);

  const handleRemoveFromCart = async (productId) => {
    try {
      await axios.post(
        `${API_URL}/api/products/removeFromCard/${productId}`,
        {},
        { withCredentials: true }
      );
      await checkAuth(); // Refresh user data
      alert('Product removed from cart');
    } catch (error) {
      console.error(error);
      alert('Failed to remove from cart');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0), 0).toFixed(2);
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
                    <p className="cart-item-price">${item.price}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item._id)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h2>Cart Summary</h2>
              <div className="summary-row">
                <span>Total Items:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
              <button className="btn-checkout">Proceed to Checkout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;