import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './SearchPage.css';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    if (query) {
      searchProducts();
    }
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    setNotFound(false);

    try {
      const res = await axios.get(`${API_URL}/api/products/index`);
      const allProducts = res.data.products;

      // Filter products by search query
      const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );

      setProducts(filtered);
      setNotFound(filtered.length === 0);
    } catch (error) {
      console.error('Search error:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="search-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching for "{query}"...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>Search Results</h1>
          <p className="search-query">
            Showing results for: <strong>"{query}"</strong>
          </p>
          {products.length > 0 && (
            <p className="search-count">Found {products.length} product{products.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {notFound ? (
          <div className="no-results">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h2>No products found</h2>
            <p>We couldn't find any products matching "{query}"</p>
            <div className="no-results-actions">
              <Link to="/products" className="btn-browse">
                Browse All Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
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
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">
                    {product.description?.substring(0, 80)}...
                  </p>
                  <div className="product-footer">
                    <span className="product-price">${product.price}</span>
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="low-stock">Only {product.stock} left!</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;