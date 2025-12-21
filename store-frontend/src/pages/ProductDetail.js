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
  const [reviews, setReviews] = useState([]);
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

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/review/${id}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
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
      fetchReviews(); // Refresh reviews
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
    </div>
  );
}

export default ProductDetail;