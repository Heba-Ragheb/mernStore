import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

function Checkout() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    fullname: user?.name || '',
    phone: '',
    address: '',
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    // Redirect if cart is empty
    if (!user?.cart || user.cart.length === 0) {
      alert('Your cart is empty');
      navigate('/cart');
      return;
    }
    
    fetchCartDetails();
  }, [user]);

  const fetchCartDetails = async () => {
    try {
      if (!user?.cart || user.cart.length === 0) {
        setCartItems([]);
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
              quantity: item.quantity
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
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0)
      .toFixed(2);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/order/addOrder`,
        formData,
        { withCredentials: true }
      );
      
      // Clear cart after successful order
      await checkAuth();
      
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Checkout</h1>
            <p>Complete your order by providing shipping details</p>
          </div>

          {/* Order Summary Section */}
          <div className="order-preview">
            <h2>Order Summary</h2>
            <div className="preview-items">
              {cartItems.map((item) => (
                <div key={item._id} className="preview-item">
                  <img src={item.images?.[0]?.url} alt={item.name} />
                  <div className="preview-item-info">
                    <p className="preview-item-name">{item.name}</p>
                    <p className="preview-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="preview-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="preview-total">
              <span>Total:</span>
              <span className="total-amount">${calculateTotal()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Personal Information
              </h2>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  pattern="^01[0-9]{9}$"
                  title="Please enter a valid Egyptian phone number (01XXXXXXXXX)"
                  required
                />
                <small>Format: 01XXXXXXXXX (11 digits starting with 01)</small>
              </div>
            </div>

            <div className="form-section">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Shipping Address
              </h2>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your complete shipping address (Street, City, Governorate)"
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="btn-back"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="btn-place-order"
              >
                {loading ? 'Placing Order...' : `Place Order ($${calculateTotal()})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;