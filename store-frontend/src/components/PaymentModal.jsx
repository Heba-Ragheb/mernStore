import { useState } from 'react';
import axios from 'axios';

const PaymentModal = ({ order, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://your-backend.onrender.com/api/payment/create',
        {
          amount: order.total,
          orderId: order._id,
          items: order.items,
          customer: {
            email: order.customerEmail,
            firstName: order.customerName.split(' ')[0],
            lastName: order.customerName.split(' ')[1] || '',
            phone: order.customerPhone
          }
        }
      );

      if (response.data.success) {
        setIframeUrl(response.data.iframeUrl);
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal">
      {!iframeUrl ? (
        <div className="payment-info">
          <h2>Complete Your Payment</h2>
          <p>Total Amount: {order.total} EGP</p>
          <button 
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      ) : (
        <iframe
          src={iframeUrl}
          width="100%"
          height="600px"
          frameBorder="0"
          title="Paymob Payment"
        />
      )}
    </div>
  );
};

export default PaymentModal;