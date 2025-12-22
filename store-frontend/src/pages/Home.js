import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
  const [offers, setOffers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [offers.length]);

  const fetchData = async () => {
    try {
      const [offersRes, productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/offer/`),
        axios.get(`${API_URL}/api/products/index`),
        axios.get(`${API_URL}/api/categorys/`)
      ]);

      setOffers(offersRes.data.offers || []);
      setFeaturedProducts(productsRes.data.products.slice(0, 8) || []);
      setCategories(categoriesRes.data.slice(0, 6) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextOffer = () => {
    setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
  };

  const prevOffer = () => {
    setCurrentOfferIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const toggleCategory = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const handleCategoryClick = (category, e) => {
    e.preventDefault();
    
    // Check if category has subcategories
    const hasSubcategories = category.subcategories && 
                            Array.isArray(category.subcategories) && 
                            category.subcategories.length > 0;
    
    if (hasSubcategories) {
      // Show subcategories dropdown
      toggleCategory(category._id);
    } else {
      // Navigate directly to category products
      navigate(`/categories/${category._id}`);
    }
  };

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    navigate(`/categories/${categoryId}/subcategory/${subcategoryId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to LUXE</h1>
          <p className="hero-subtitle">Discover Premium Quality Products</p>
          <Link to="/products" className="hero-btn">
            Shop Now
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </section>

      {/* Compact Animated Offers Section */}
      {offers.length > 0 && (
        <section className="offers-section-compact">
          <div className="container">
            <div className="offers-carousel-compact">
              <div className="offers-slider">
                {offers.map((offer, index) => (
                  <div
                    key={offer._id}
                    className={`offer-slide ${index === currentOfferIndex ? 'active' : ''}`}
                    style={{
                      transform: `translateX(${(index - currentOfferIndex) * 100}%)`,
                    }}
                  >
                    <div className="offer-content-wrapper">
                      <div className="offer-image-container">
                        <img 
                          src={offer.images?.[0]?.url} 
                          alt="Special Offer" 
                          className="offer-image-compact"
                        />
                        <div className="offer-shine"></div>
                      </div>
                      <div className="offer-text-overlay">
                        <span className="offer-badge">Special Offer</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {offers.length > 1 && (
                <>
                  <button className="offer-nav-btn prev" onClick={prevOffer}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button className="offer-nav-btn next" onClick={nextOffer}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>

                  <div className="offer-dots">
                    {offers.map((_, index) => (
                      <button
                        key={index}
                        className={`dot ${index === currentOfferIndex ? 'active' : ''}`}
                        onClick={() => setCurrentOfferIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section with Smart Navigation */}
      {categories.length > 0 && (
        <section className="categories-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Browse our popular categories</p>
            </div>
            <div className="categories-grid-expanded">
              {categories.map((category) => {
                const hasSubcategories = category.subcategories && 
                                        Array.isArray(category.subcategories) && 
                                        category.subcategories.length > 0;
                const isExpanded = expandedCategory === category._id;

                return (
                  <div key={category._id} className="category-card-expanded">
                    <div 
                      onClick={(e) => handleCategoryClick(category, e)}
                      className="category-card-main clickable"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="category-icon">
                        {category.image?.url ? (
                          <img src={category.image.url} alt={category.name} />
                        ) : (
                          <div className="category-placeholder">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="category-name">{category.name}</h3>
                      
                      {hasSubcategories && (
                        <div className="category-indicator">
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease'
                            }}
                          >
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Subcategories List */}
                    {hasSubcategories && (
                      <div className="subcategories-wrapper">
                        {isExpanded && (
                          <div className="subcategories-list-home">
                            {category.subcategories.map((sub) => (
                              <button
                                key={sub._id}
                                onClick={() => handleSubcategoryClick(category._id, sub._id)}
                                className="subcategory-link"
                              >
                                <span className="subcategory-dot">•</span>
                                <span className="subcategory-name">{sub.name}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Check out our best selling items</p>
            </div>
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <Link 
                  key={product._id} 
                  to={`/product/${product._id}`}
                  className="product-card"
                >
                  <div className="product-image">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    {product.stock <= 0 && (
                      <div className="out-of-stock-badge">Out of Stock</div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="low-stock-badge">Only {product.stock} left!</div>
                    )}
                    {product.discount > 0 && (
                      <div className="discount-badge">-{product.discount}%</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">
                      {product.description?.substring(0, 60)}...
                    </p>
                    <div className="product-footer">
                      <div className="product-price-section">
                        {product.discount > 0 ? (
                          <>
                            <span className="product-price-old">${product.price}</span>
                            <span className="product-price">
                              ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="product-price">${product.price}</span>
                        )}
                      </div>
                      <button className="product-cart-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="view-all-container">
              <Link to="/products" className="view-all-btn">
                View All Products
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Shopping?</h2>
            <p>Join thousands of happy customers and find your perfect products today</p>
            <Link to="/products" className="cta-btn">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .categories-grid-expanded {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .category-card-expanded {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .category-card-expanded:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .category-card-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          position: relative;
          padding: 10px;
          border-radius: 12px;
          transition: background 0.2s ease;
        }

        .category-card-main.clickable:hover {
          background: rgba(102, 126, 234, 0.05);
        }

        .category-indicator {
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
        }

        .subcategories-wrapper {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .subcategories-list-home {
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .subcategory-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #f9fafb;
          border: none;
          border-radius: 8px;
          text-decoration: none;
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .subcategory-link:hover {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          transform: translateX(4px);
        }

        .subcategory-dot {
          font-size: 20px;
          line-height: 1;
          flex-shrink: 0;
        }

        .subcategory-name {
          flex: 1;
        }

        .subcategory-link svg {
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }

        .subcategory-link:hover svg {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .categories-grid-expanded {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;