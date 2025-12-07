import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/index`);
      setProducts(res.data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e, productId, stock) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (stock === 0) {
      alert('Sorry, this product is out of stock');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/products/addToCard/${productId}`,
        {},
        { withCredentials: true }
      );
      await checkAuth();
      alert('Product added to cart!');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const calculateFinalPrice = (price, discount) => {
    if (discount > 0) {
      return (price * (1 - discount / 100)).toFixed(2);
    }
    return price;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1>All Products</h1>
        {products.length === 0 ? (
          <div className="no-products">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <p>No products available</p>
            <Link to="/" className="btn-back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => {
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const finalPrice = calculateFinalPrice(product.price, product.discount);

              return (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="product-card"
                >
                  <div className="product-image-container">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    
                    {/* Badges */}
                    <div className="product-badges">
                      {product.discount > 0 && !isOutOfStock && (
                        <span className="badge discount-badge">
                          -{product.discount}%
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="badge out-of-stock-badge">
                          Out of Stock
                        </span>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <span className="badge low-stock-badge">
                          Only {product.stock} left
                        </span>
                      )}
                    </div>

                    {/* Stock Overlay */}
                    {!isOutOfStock && (
                      <div className={`stock-overlay ${isLowStock ? 'low-stock' : 'in-stock'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20 7h-4V5a3 3 0 00-6 0v2H6a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {product.stock} in stock
                      </div>
                    )}

                    {isOutOfStock && (
                      <div className="stock-overlay out-of-stock">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Out of Stock
                      </div>
                    )}
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">
                      {product.description?.substring(0, 80)}...
                    </p>

                    <div className="product-footer">
                      <div className="product-price-section">
                        {product.discount > 0 ? (
                          <>
                            <span className="old-price">${product.price}</span>
                            <span className="new-price">${finalPrice}</span>
                            <span className="discount-tag">Save {product.discount}%</span>
                          </>
                        ) : (
                          <span className="new-price">${product.price}</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, product._id, product.stock)}
                        className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
                      >
                        {isOutOfStock ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;