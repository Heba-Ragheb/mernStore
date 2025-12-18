import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

function Checkout() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
  });

  const API_URL = process.env.REACT_APP_API_URL;

  // Check for payment callback on component mount
  useEffect(() => {
    const paymentSuccess = searchParams.get('success');
    const paymentId = searchParams.get('id');
    
    if (paymentSuccess === 'true' && paymentId) {
      // Payment was successful, create order
      handlePaymentSuccess();
    }
  }, [searchParams]);

  const handlePaymentSuccess = async () => {
    const pendingData = sessionStorage.getItem('pendingOrderData');
    
    if (pendingData) {
      try {
        setLoading(true);
        const orderData = JSON.parse(pendingData);
        
        const orderResponse = await axios.post(
          `${API_URL}/api/order/addOrder`,
          orderData,
          { withCredentials: true }
        );
        
        sessionStorage.removeItem('pendingOrderData');
        await checkAuth(); // Clear cart
        alert('Payment successful! Your order has been placed.');
        navigate('/orders');
      } catch (error) {
        console.error('Error creating order after payment:', error);
        alert('Payment succeeded but order creation failed. Please contact support.');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!user?.cart || user.cart.length === 0) {
      const hasPendingOrder = sessionStorage.getItem('pendingOrderData');
      if (!hasPendingOrder) {
        alert('Your cart is empty');
        navigate('/cart');
      }
      return;
    }
    
    if (user?.name) {
      const nameParts = user.name.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
      }));
    }
    
    fetchCartDetails();
  }, [user]);

  const fetchCartDetails = async () => {
    try {
      if (!user?.cart || user.cart.length === 0) {
        setCartItems([]);
        return;
      }

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
      .reduce((total, item) => total + (item.finalPrice || 0) * (item.quantity || 1), 0)
      .toFixed(2);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      alert('Please enter your full name');
      return false;
    }
    if (!formData.email || !formData.email.includes('@')) {
      alert('Please enter a valid email');
      return false;
    }
    if (!formData.phone || formData.phone.length < 11) {
      alert('Please enter a valid phone number (11 digits starting with 01)');
      return false;
    }
    if (!formData.address || !formData.city) {
      alert('Please enter your complete address');
      return false;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (paymentMethod === 'Cash') {
        // Cash on Delivery - Create order immediately
        const orderResponse = await axios.post(
          `${API_URL}/api/order/addOrder`,
          {
            fullname: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}`,
            email: formData.email,
            paymentMethod: 'Cash',
            payment: 'notPaid'
          },
          { withCredentials: true }
        );

        // Clear cart and redirect
        await checkAuth();
        alert('Order placed successfully! You will pay cash on delivery.');
        navigate('/orders');
        
      } else {
        // Online Payment - Store data and redirect to Paymob
        // Store order data in sessionStorage
        const orderData = {
          fullname: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}`,
          email: formData.email,
          paymentMethod: 'Online',
          payment: 'Paid'
        };
        
        sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));

        // Initialize Paymob payment
        const paymentResponse = await axios.post(
          `${API_URL}/api/payment/create`,
          {
            amount: parseFloat(calculateTotal()),
            orderId: 'temp_' + Date.now(),
            items: cartItems.map(item => ({
              name: item.name,
              price: item.finalPrice,
              quantity: item.quantity,
              description: item.description || item.name
            })),
            customer: {
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone
            }
          },
          { withCredentials: true }
        );

        if (paymentResponse.data.success) {
          // Redirect to Paymob payment page directly
          window.location.href = paymentResponse.data.iframeUrl;
        } else {
          alert('Failed to initialize payment. Please try again.');
          sessionStorage.removeItem('pendingOrderData');
        }
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
      sessionStorage.removeItem('pendingOrderData');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        gap: '20px'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Processing your order...</p>
      </div>
    );
  }

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
                    {(item.finalPrice * item.quantity).toFixed(2)} EGP
                  </p>
                </div>
              ))}
            </div>
            <div className="preview-total">
              <span>Subtotal:</span>
              <span>{calculateTotal()} EGP</span>
            </div>
            <div className="preview-total">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="preview-total" style={{ borderTop: '2px solid #333', paddingTop: '10px', marginTop: '10px' }}>
              <span><strong>Total:</strong></span>
              <span className="total-amount"><strong>{calculateTotal()} EGP</strong></span>
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
              
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
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
                  maxLength="11"
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
                <label>Street Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your street address"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Cairo, Alexandria, etc."
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h2>💳 Payment Method</h2>
              
              <div className="payment-options">
                {/* Cash on Delivery Option */}
                <div 
                  className={`payment-option ${paymentMethod === 'Cash' ? 'selected' : ''}`}
                  style={{ 
                    padding: '15px', 
                    border: paymentMethod === 'Cash' ? '2px solid #667eea' : '1px solid #ddd', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === 'Cash' ? '#f0f4ff' : 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setPaymentMethod('Cash')}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="radio" 
                      id="cash" 
                      name="payment" 
                      value="Cash"
                      checked={paymentMethod === 'Cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ marginRight: '10px' }}
                    />
                    <label htmlFor="cash" style={{ cursor: 'pointer', flex: 1 }}>
                      <strong>💵 Cash on Delivery</strong>
                      <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#666' }}>
                        Pay when you receive your order
                      </p>
                    </label>
                  </div>
                </div>

                {/* Online Payment Option */}
                <div 
                  className={`payment-option ${paymentMethod === 'Online' ? 'selected' : ''}`}
                  style={{ 
                    padding: '15px', 
                    border: paymentMethod === 'Online' ? '2px solid #667eea' : '1px solid #ddd', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    cursor: 'pointer',
                    backgroundColor: paymentMethod === 'Online' ? '#f0f4ff' : 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setPaymentMethod('Online')}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="radio" 
                      id="online" 
                      name="payment" 
                      value="Online"
                      checked={paymentMethod === 'Online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ marginRight: '10px' }}
                    />
                    <label htmlFor="online" style={{ cursor: 'pointer', flex: 1 }}>
                      <strong>💳 Credit/Debit Card</strong>
                      <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#666' }}>
                        Pay securely with Paymob
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Test Card Info - Only show for Online Payment */}
              {paymentMethod === 'Online' && (
                <div className="test-card-info" style={{ 
                  marginTop: '15px', 
                  padding: '15px', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>🧪 Test Card Details:</h4>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Card Number:</strong> 4987654321098769</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Name:</strong> Test Account</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Expiry:</strong> 12/25</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>CVV:</strong> 123</p>
                  <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#666' }}>
                    💡 After payment, you'll be redirected back automatically
                  </p>
                </div>
              )}
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
                {loading ? 'Processing...' : 
                  paymentMethod === 'Cash' 
                    ? `Place Order (${calculateTotal()} EGP)` 
                    : `Pay Now (${calculateTotal()} EGP)`
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;