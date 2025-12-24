import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchRelatedProducts();
    window.scrollTo(0, 0); // Scroll to top when product changes
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
  // In your ProductDetail.js or wherever you show individual products
useEffect(() => {
  if (product) {
    // Save to view history
    const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
    
    const newView = {
      productId: product._id,
      categoryId: product.category?._id || product.category,
      timestamp: Date.now()
    };
    
    // Keep last 50 views
    const updatedHistory = [newView, ...history].slice(0, 50);
    localStorage.setItem('viewHistory', JSON.stringify(updatedHistory));
  }
}, [product]);
 useEffect(() => {
  if (product && product._id) {
    // Get existing recently viewed products from localStorage
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    
    // Add current product to the beginning, remove duplicates
    const updated = [
      product._id,
      ...viewed.filter(id => id !== product._id)
    ].slice(0, 8); // Keep maximum 8 items
    
    // Save back to localStorage
    localStorage.setItem("recentlyViewed", JSON.stringify(updated));
    
    console.log('Product added to recently viewed:', product._id);
    console.log('All recently viewed:', updated);
  }
}, [product?._id]);
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/review/${id}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/relatedProducts/${id}`);
      console.log('Related products response:', res.data);
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        // If response is directly an array
        setRelatedProducts(res.data);
      } else if (res.data.products && Array.isArray(res.data.products)) {
        // If response is { products: [...] }
        setRelatedProducts(res.data.products);
      } else {
        console.warn('Unexpected related products structure:', res.data);
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

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

      await checkAuth();
      alert('Product added to cart!');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddRelatedToCart = async (e, productId, stock) => {
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      alert('Please write a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post(
        `${API_URL}/api/review/${id}`,
        { review: reviewText, rating },
        { withCredentials: true }
      );

      alert('Review submitted successfully!');
      setReviewText('');
      setRating(0);
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`${API_URL}/api/review/${reviewId}`, {
        withCredentials: true,
      });
      alert('Review deleted successfully!');
      fetchReviews();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const calculateFinalPrice = (price, discount) => {
    if (discount > 0) {
      return (price * (1 - discount / 100)).toFixed(2);
    }
    return price;
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <svg
          key={index}
          className={`star ${interactive ? 'interactive' : ''} ${
            starValue <= (interactive ? (hoverRating || rating) : rating) ? 'filled' : ''
          }`}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && setRating(starValue)}
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="currentColor"
            strokeWidth="2"
            fill={starValue <= (interactive ? (hoverRating || rating) : rating) ? 'currentColor' : 'none'}
          />
        </svg>
      );
    });
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
  const averageRating = calculateAverageRating();

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
            
            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="rating-summary">
                <div className="stars-display">
                  {renderStars(parseFloat(averageRating))}
                </div>
                <span className="rating-text">
                  {averageRating} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
            
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

            {!user && !isOutOfStock && (
              <p className="login-message">
                Please <a href="/login">login</a> to add items to cart
              </p>
            )}

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

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2>You May Also Like</h2>
            <div className="related-products-grid">
              {relatedProducts.slice(0, 4).map((relatedProduct) => {
                const isRelatedOutOfStock = relatedProduct.stock === 0;
                const isRelatedLowStock = relatedProduct.stock > 0 && relatedProduct.stock <= 5;
                const relatedFinalPrice = calculateFinalPrice(relatedProduct.price, relatedProduct.discount);

                return (
                  <Link
                    key={relatedProduct._id}
                    to={`/product/${relatedProduct._id}`}
                    className="related-product-card"
                  >
                    <div className="related-product-image">
                      {relatedProduct.images?.[0]?.url ? (
                        <img src={relatedProduct.images[0].url} alt={relatedProduct.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                      
                      {relatedProduct.discount > 0 && !isRelatedOutOfStock && (
                        <span className="related-discount-badge">
                          -{relatedProduct.discount}%
                        </span>
                      )}
                      {isRelatedOutOfStock && (
                        <span className="related-stock-badge out">
                          Out of Stock
                        </span>
                      )}
                      {isRelatedLowStock && !isRelatedOutOfStock && (
                        <span className="related-stock-badge low">
                          Only {relatedProduct.stock} left
                        </span>
                      )}
                    </div>

                    <div className="related-product-info">
                      <h3>{relatedProduct.name}</h3>
                      <div className="related-product-price">
                        {relatedProduct.discount > 0 ? (
                          <>
                            <span className="old-price">${relatedProduct.price}</span>
                            <span className="new-price">${relatedFinalPrice}</span>
                          </>
                        ) : (
                          <span className="new-price">${relatedProduct.price}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddRelatedToCart(e, relatedProduct._id, relatedProduct.stock)}
                        className={`btn-quick-add ${isRelatedOutOfStock ? 'disabled' : ''}`}
                        disabled={isRelatedOutOfStock}
                      >
                        {isRelatedOutOfStock ? 'Out of Stock' : 'Quick Add'}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Customer Reviews</h2>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-write-review"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="review-form-container">
              <form onSubmit={handleSubmitReview} className="review-form">
                <h3>Write Your Review</h3>
                
                <div className="form-group">
                  <label>Rating *</label>
                  <div className="stars-input">
                    {renderStars(rating, true)}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review">Your Review *</label>
                  <textarea
                    id="review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows="5"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-submit-review"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="no-reviews">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">
                      <div className="author-avatar">
                        {review.userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="author-info">
                        <h4>{review.userName || 'Anonymous'}</h4>
                        <p className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  <p className="review-text">{review.review}</p>

                  {user && user.name === review.userName && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="btn-delete-review"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .related-products-section {
          margin: 60px 0;
          padding: 40px 0;
          border-top: 1px solid #e5e7eb;
        }

        .related-products-section h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 30px;
          color: #111827;
        }

        .related-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 24px;
        }

        .related-product-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
        }

        .related-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          border-color: #667eea;
        }

        .related-product-image {
          position: relative;
          padding-top: 100%;
          overflow: hidden;
          background: #f9fafb;
        }

        .related-product-image img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .related-discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }

        .related-stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: white;
        }

        .related-stock-badge.out {
          background: #ef4444;
        }

        .related-stock-badge.low {
          background: #f59e0b;
        }

        .related-product-info {
          padding: 16px;
        }

        .related-product-info h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #111827;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .related-product-price {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .related-product-price .old-price {
          text-decoration: line-through;
          color: #9ca3af;
          font-size: 14px;
        }

        .related-product-price .new-price {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .btn-quick-add {
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-quick-add:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-quick-add.disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .related-products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .related-products-section h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default ProductDetail;