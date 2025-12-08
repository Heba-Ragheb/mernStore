import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL ;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/order/`, {
        withCredentials: true,
      });
      setOrders(res.data.orders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await axios.delete(`${API_URL}/api/order/delete/${orderId}`, {
        withCredentials: true,
      });
      alert('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert('Failed to cancel order');
    }
  };

  const calculateTotal = (products) => {
    return products.reduce((total, item) => total + (item.price || 0), 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>View and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet</p>
            <Link to="/products" className="btn-shop-now">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="btn-cancel"
                  >
                    Cancel Order
                  </button>
                </div>

                <div className="order-details">
                  <div className="shipping-info">
                    <h4>Shipping Details</h4>
                    <p><strong>Name:</strong> {order.fullname}</p>
                    <p><strong>Phone:</strong> {order.phone}</p>
                    <p><strong>Address:</strong> {order.address}</p>
                  </div>

                  <div className="order-products">
                    <h4>Products ({order.products?.length || 0})</h4>
                    <div className="products-list">
                      {order.products?.map((product, index) => (
                        <div key={index} className="product-item">
                          {product.images?.[0]?.url && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                            />
                          )}
                          <div className="product-details">
                            <h5>{product.name}</h5>
                            <p className="product-price">${product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total Amount:</span>
                    <span className="total-price">
                      ${calculateTotal(order.products || [])}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;