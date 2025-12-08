import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL ;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/show/${id}`);
      setProduct(res.data.product);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    // Check if product is out of stock
    if (!product || product.stock === 0) {
      alert('Sorry, this product is currently out of stock');
      return;
    }

    setAddingToCart(true);
    try {
      await axios.post(
        `${API_URL}/api/products/addToCard/${id}`,
        {},
        { withCredentials: true }
      );

      await checkAuth(); // Refresh user data to update cart
      alert('Product added to cart!');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="product-not-found">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/products')} className="btn-back">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const finalPrice = product.discount > 0 
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail-grid">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.images[selectedImage]?.url} 
                alt={product.name} 
              />
              {isOutOfStock && (
                <div className="out-of-stock-overlay">
                  <span>OUT OF STOCK</span>
                </div>
              )}
              {product.discount > 0 && !isOutOfStock && (
                <div className="discount-badge-large">
                  -{product.discount}% OFF
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="product-details">
            <h1>{product.name}</h1>
            
            {/* Price Section */}
            <div className="price-section">
              {product.discount > 0 ? (
                <>
                  <span className="price-old">${product.price}</span>
                  <span className="price-current">${finalPrice}</span>
                  <span className="discount-tag">Save {product.discount}%</span>
                </>
              ) : (
                <span className="price-current">${product.price}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {isOutOfStock ? (
                <div className="stock-badge out-of-stock">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Out of Stock
                </div>
              ) : isLowStock ? (
                <div className="stock-badge low-stock">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Only {product.stock} left in stock!
                </div>
              ) : (
                <div className="stock-badge in-stock">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  In Stock
                </div>
              )}
            </div>

            {/* Description */}
            <div className="product-description-section">
              <h3>Description</h3>
              <p className="product-description">{product.description}</p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || isOutOfStock}
              className={`btn-add-to-cart ${isOutOfStock ? 'disabled' : ''}`}
            >
              {isOutOfStock ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Out of Stock
                </>
              ) : addingToCart ? (
                'Adding...'
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            {/* Login Message */}
            {!user && !isOutOfStock && (
              <p className="login-message">
                Please <a href="/login">login</a> to add items to cart
              </p>
            )}

            {/* Out of Stock Message */}
            {isOutOfStock && (
              <p className="out-of-stock-message">
                This product is currently unavailable. Check back later!
              </p>
            )}

            {/* Product Info */}
            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">
                  {product.category?.name || 'Uncategorized'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Availability:</span>
                <span className="meta-value">
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;