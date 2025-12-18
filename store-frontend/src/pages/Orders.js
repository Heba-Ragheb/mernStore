import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

function Orders() {
  const { user, checkAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrderDetails = async () => {
    try {
      if (!user?.order || user.order.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Debug: Log user.order structure
      console.log('User orders:', user.order);

      // Fetch full order details for each order in user.order array (like Cart does)
      const ordersWithDetails = await Promise.all(
        user.order.map(async (orderRef) => {
          try {
            // Handle both possible structures: orderRef.orderId or orderRef._id
            const orderId = orderRef.orderId || orderRef._id;
            
            // Skip if orderId is still undefined
            if (!orderId) {
              console.error('Order ID is undefined:', orderRef);
              return null;
            }

            console.log('Fetching order:', orderId);

            const res = await axios.get(
              `${API_URL}/api/order/show/${orderId}`,
              { withCredentials: true }
            );
            return {
              ...res.data.order,
              userStatus: orderRef.status,
              orderRefId: orderId
            };
          } catch (error) {
            console.error(`Failed to fetch order:`, error);
            return null;
          }
        })
      );

      // Filter out null values and sort by date (newest first)
      const validOrders = ordersWithDetails.filter(order => order !== null);
      const sortedOrders = validOrders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;

    try {
      await axios.delete(`${API_URL}/api/order/delete/${orderId}`, {
        withCredentials: true,
      });
      alert('Order cancelled successfully');
      
      await checkAuth();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const calculateTotal = (order) => {
    if (order.totalPrice) {
      return order.totalPrice.toFixed(2);
    }
    return order.products?.reduce((total, item) => {
      const price = item.finalPrice || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0).toFixed(2) || '0.00';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'Processing': '#3b82f6',
      'Completed': '#10b981',
      'Cancelled': '#ef4444',
      'Failed': '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': '⏳',
      'Processing': '📦',
      'Completed': '✅',
      'Cancelled': '❌',
      'Failed': '⚠️'
    };
    return icons[status] || '📋';
  };

  const getPaymentMethodBadge = (method) => {
    return method === 'Online' 
      ? { icon: '💳', text: 'Online Payment', color: '#3b82f6' }
      : { icon: '💵', text: 'Cash on Delivery', color: '#10b981' };
  };

  const getPaymentStatusBadge = (payment) => {
    return payment === 'Paid'
      ? { icon: '✓', text: 'Paid', color: '#10b981' }
      : { icon: '⏳', text: 'Unpaid', color: '#f59e0b' };
  };

  const canCancelOrder = (order) => {
    const status = order.status || order.userStatus || 'Pending';
    return ['Pending', 'Processing'].includes(status);
  };

  const getOrderStatus = (order) => {
    return order.status || order.userStatus || 'Pending';
  };

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(order => getOrderStatus(order) === filterStatus);

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => getOrderStatus(o) === 'Pending').length,
    processing: orders.filter(o => getOrderStatus(o) === 'Processing').length,
    completed: orders.filter(o => getOrderStatus(o) === 'Completed').length,
    cancelled: orders.filter(o => getOrderStatus(o) === 'Cancelled').length,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="empty-orders">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h2>Please Login</h2>
            <p>You need to be logged in to view your orders</p>
            <Link to="/login" className="btn-shop-now">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <div>
            <h1>My Orders</h1>
            <p>View and manage your orders</p>
          </div>
          <div className="orders-stats">
            <div className="stat-card">
              <span className="stat-number">{orderStats.total}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orderStats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orderStats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
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
          <>
            {/* Filter Tabs */}
            <div className="order-filters">
              {['All', 'Pending', 'Processing', 'Completed', 'Cancelled'].map(status => (
                <button
                  key={status}
                  className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                  {status !== 'All' && (
                    <span className="filter-count">
                      {status === 'Pending' && orderStats.pending}
                      {status === 'Processing' && orderStats.processing}
                      {status === 'Completed' && orderStats.completed}
                      {status === 'Cancelled' && orderStats.cancelled}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="no-filtered-orders">
                <p>No {filterStatus.toLowerCase()} orders found</p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => {
                  const paymentMethod = getPaymentMethodBadge(order.paymentMethod || 'Cash');
                  const paymentStatus = getPaymentStatusBadge(order.payment || 'notPaid');
                  const status = getOrderStatus(order);
                  const totalItems = order.products?.reduce((sum, item) => 
                    sum + (item.quantity || 1), 0
                  ) || 0;

                  return (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                          <p className="order-date">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="order-status-badge" style={{ backgroundColor: getStatusColor(status) }}>
                          <span className="status-icon">{getStatusIcon(status)}</span>
                          <span className="status-text">{status}</span>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="payment-info-section">
                        <div className="payment-info-item">
                          <span className="info-label">Payment Method:</span>
                          <div className="info-badge" style={{ color: paymentMethod.color }}>
                            <span>{paymentMethod.icon}</span>
                            <span>{paymentMethod.text}</span>
                          </div>
                        </div>
                        <div className="payment-info-item">
                          <span className="info-label">Payment Status:</span>
                          <div className="info-badge" style={{ color: paymentStatus.color }}>
                            <span>{paymentStatus.icon}</span>
                            <span>{paymentStatus.text}</span>
                          </div>
                        </div>
                      </div>

                      <div className="order-details">
                        <div className="shipping-info">
                          <h4>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Shipping Details
                          </h4>
                          <div className="info-list">
                            <p><strong>Name:</strong> {order.fullname}</p>
                            <p><strong>Phone:</strong> {order.phone}</p>
                            <p><strong>Address:</strong> {order.address}</p>
                          </div>
                        </div>

                        <div className="order-products">
                          <h4>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Products ({totalItems} items)
                          </h4>
                          <div className="products-list">
                            {order.products?.map((product, index) => (
                              <div key={index} className="product-item">
                                {product.images?.[0]?.url && (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.name}
                                    className="product-image"
                                  />
                                )}
                                <div className="product-details">
                                  <h5>{product.name}</h5>
                                  <div className="product-meta">
                                    <span className="product-quantity">Qty: {product.quantity || 1}</span>
                                    <span className="product-price">
                                      ${(product.finalPrice || product.price || 0).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="product-subtotal">
                                    Subtotal: ${((product.finalPrice || product.price || 0) * (product.quantity || 1)).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="order-footer">
                        <div className="order-actions">
                          {canCancelOrder(order) && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="btn-cancel"
                              title="Cancel this order"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Cancel Order
                            </button>
                          )}
                          {!canCancelOrder(order) && (
                            <span className="cancel-disabled">
                              {status === 'Completed' ? '✓ Order Completed' : 
                               status === 'Cancelled' ? 'Order Cancelled' : 
                               'Cannot Cancel'}
                            </span>
                          )}
                        </div>
                        <div className="order-total">
                          <span className="total-label">Total Amount:</span>
                          <span className="total-price">
                            ${calculateTotal(order)} EGP
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Orders;