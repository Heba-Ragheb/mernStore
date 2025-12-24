import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SmartRecommendations.css';

function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recentlyViewed');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Load view history from localStorage
    const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
    setViewHistory(history);
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [activeTab, viewHistory]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      let productsToShow = [];

      switch(activeTab) {
        case 'recentlyViewed':
          // Get products from recently viewed categories
          productsToShow = await getRecentlyViewedProducts();
          break;
        case 'popular':
          // Get popular products from visited categories
          productsToShow = await getPopularFromCategories();
          break;
        case 'similar':
          // Get similar products from same categories
          productsToShow = await getSimilarProducts();
          break;
        case 'mightLike':
          // Get products from related categories
          productsToShow = await getRelatedCategoryProducts();
          break;
        default:
          productsToShow = await getAllProducts();
      }

      setRecommendations(productsToShow.slice(0, 8));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getRecentlyViewedProducts = async () => {
    if (viewHistory.length === 0) {
      return await getAllProducts();
    }

    try {
      // Get unique category IDs from view history
      const categoryIds = [...new Set(viewHistory.map(item => item.categoryId))].filter(Boolean);
      
      if (categoryIds.length === 0) {
        return await getAllProducts();
      }

      // Fetch products from these categories
      const response = await axios.get(`${API_URL}/api/products/index`);
      const allProducts = response.data.products || [];
      
      // Filter products by viewed categories
      const filtered = allProducts.filter(product => 
        categoryIds.includes(product.category?._id || product.category)
      );

      return filtered.length > 0 ? filtered : allProducts;
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
      return await getAllProducts();
    }
  };

  const getPopularFromCategories = async () => {
    if (viewHistory.length === 0) {
      return await getAllProducts();
    }

    try {
      const categoryIds = [...new Set(viewHistory.map(item => item.categoryId))].filter(Boolean);
      
      if (categoryIds.length === 0) {
        return await getAllProducts();
      }

      const response = await axios.get(`${API_URL}/api/products/index`);
      const allProducts = response.data.products || [];
      
      // Filter by viewed categories and sort by rating/reviews
      const filtered = allProducts
        .filter(product => categoryIds.includes(product.category?._id || product.category))
        .sort((a, b) => {
          const scoreA = (a.rating || 0) * (a.numReviews || 0);
          const scoreB = (b.rating || 0) * (b.numReviews || 0);
          return scoreB - scoreA;
        });

      return filtered.length > 0 ? filtered : allProducts;
    } catch (error) {
      console.error('Error fetching popular:', error);
      return await getAllProducts();
    }
  };

  const getSimilarProducts = async () => {
    if (viewHistory.length === 0) {
      return await getAllProducts();
    }

    try {
      // Get the most recently viewed product's category
      const lastViewed = viewHistory[viewHistory.length - 1];
      
      if (!lastViewed || !lastViewed.categoryId) {
        return await getAllProducts();
      }

      const response = await axios.get(`${API_URL}/api/products/index`);
      const allProducts = response.data.products || [];
      
      // Filter products from the same category, excluding the last viewed product
      const filtered = allProducts.filter(product => 
        (product.category?._id || product.category) === lastViewed.categoryId &&
        product._id !== lastViewed.productId
      );

      return filtered.length > 0 ? filtered : allProducts;
    } catch (error) {
      console.error('Error fetching similar:', error);
      return await getAllProducts();
    }
  };

  const getRelatedCategoryProducts = async () => {
    if (viewHistory.length === 0) {
      return await getAllProducts();
    }

    try {
      // Get all categories the user has viewed
      const viewedCategoryIds = [...new Set(viewHistory.map(item => item.categoryId))].filter(Boolean);
      
      if (viewedCategoryIds.length === 0) {
        return await getAllProducts();
      }

      // Fetch all categories to find related ones
      const categoriesResponse = await axios.get(`${API_URL}/api/categorys/`);
      const allCategories = categoriesResponse.data || [];
      
      // Find parent categories of viewed categories
      const relatedCategoryIds = new Set();
      
      viewedCategoryIds.forEach(categoryId => {
        const category = allCategories.find(cat => cat._id === categoryId);
        if (category) {
          // Add sibling categories (same parent)
          const siblings = allCategories.filter(cat => 
            cat.parent === category.parent && cat._id !== categoryId
          );
          siblings.forEach(sibling => relatedCategoryIds.add(sibling._id));
          
          // Add subcategories
          if (category.subcategories) {
            category.subcategories.forEach(sub => relatedCategoryIds.add(sub._id));
          }
        }
      });

      // Get products from related categories
      const response = await axios.get(`${API_URL}/api/products/index`);
      const allProducts = response.data.products || [];
      
      const filtered = allProducts.filter(product => 
        relatedCategoryIds.has(product.category?._id || product.category)
      );

      return filtered.length > 0 ? filtered : allProducts;
    } catch (error) {
      console.error('Error fetching related:', error);
      return await getAllProducts();
    }
  };

  const getAllProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/index`);
      return response.data.products || [];
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  };

  const tabs = [
    { id: 'recentlyViewed', label: '👀 Based on Your Browsing', icon: '🔍' },
    { id: 'popular', label: '⭐ Popular in Your Categories', icon: '🔥' },
    { id: 'similar', label: '🔗 Similar to What You Viewed', icon: '📦' },
    { id: 'mightLike', label: '✨ You Might Also Like', icon: '💡' }
  ];

  if (loading) {
    return (
      <section className="smart-recommendations">
        <div className="container">
          <div className="recommendations-loading">
            <div className="loading-spinner-smart"></div>
            <p>Loading personalized recommendations...</p>
          </div>
        </div>
      </section>
    );
  }

  // Don't show section if no recommendations
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="smart-recommendations">
      <div className="container">
        {/* Header */}
        <div className="recommendations-header">
          <div className="header-badge-wrapper">
            <div className="personalized-badge">
              <span className="personalized-icon">🎯</span>
              <span className="personalized-text">Personalized for You</span>
            </div>
            <h2 className="recommendations-title">Recommended Products</h2>
            <p className="recommendations-subtitle">
              Based on categories you've explored
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="recommendations-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`rec-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {activeTab === tab.id && <div className="tab-active-indicator"></div>}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="recommendations-grid">
          {recommendations.map((product, index) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="recommendation-card"
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Relevance Badge */}
              <div className="relevance-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>For You</span>
              </div>

              {/* Product Image */}
              <div className="recommendation-image">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                
                {/* Hover Overlay */}
                <div className={`image-overlay ${hoveredProduct === product._id ? 'visible' : ''}`}>
                  <button className="quick-view-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Quick View
                  </button>
                </div>

                {/* Badges */}
                {product.stock <= 0 && (
                  <div className="rec-badge out-of-stock">Out of Stock</div>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <div className="rec-badge low-stock">Only {product.stock} left!</div>
                )}
                {product.discount > 0 && (
                  <div className="rec-badge discount">-{product.discount}%</div>
                )}
              </div>

              {/* Product Info */}
              <div className="recommendation-info">
                {/* Rating */}
                <div className="rec-rating">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={i < Math.floor(product.rating || 4) ? "#FFA500" : "none"}
                      stroke={i < Math.floor(product.rating || 4) ? "#FFA500" : "#D1D5DB"}
                      strokeWidth="2"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span className="rating-count">({product.numReviews || Math.floor(Math.random() * 100) + 50})</span>
                </div>

                {/* Name */}
                <h3 className="rec-name">{product.name}</h3>

                {/* Category Tag */}
                <div className="rec-tags">
                  {product.category?.name && (
                    <span className="tag category">{product.category.name}</span>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="tag limited">Limited Stock</span>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="rec-footer">
                  <div className="rec-price-section">
                    {product.discount > 0 ? (
                      <>
                        <span className="rec-price-old">${product.price}</span>
                        <span className="rec-price">
                          ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="rec-price">${product.price}</span>
                    )}
                  </div>
                  
                  <div className="rec-actions">
                    <button className="rec-wishlist-btn" onClick={(e) => e.preventDefault()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button className="rec-cart-btn" onClick={(e) => e.preventDefault()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View More Button */}
        <div className="recommendations-footer">
          <Link to="/products" className="view-more-btn">
            <span>Explore All Products</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SmartRecommendations;