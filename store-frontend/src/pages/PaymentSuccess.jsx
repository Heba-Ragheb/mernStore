import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('merchant_order_id');

  return (
    <div className="payment-result">
      {success === 'true' ? (
        <div className="success">
          <h1>✅ Payment Successful!</h1>
          <p>Order ID: {orderId}</p>
          <p>Thank you for your purchase!</p>
          <a href="/orders">View My Orders</a>
        </div>
      ) : (
        <div className="failed">
          <h1>❌ Payment Failed</h1>
          <p>Order ID: {orderId}</p>
          <p>Please try again or contact support.</p>
          <a href="/cart">Return to Cart</a>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;