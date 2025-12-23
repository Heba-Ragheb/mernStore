import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Products.css';

function SubcategoryProducts() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, checkAuth } = useAuth();
  const { categoryId, subId } = useParams(); // Changed from subcategoryId to subId to match route
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Only fetch if both IDs are available
    if (categoryId && subId) {
      fetchSubcategoryProducts();
    }
  }, [categoryId, subId]);

  const fetchSubcategoryProducts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/categorys/${categoryId}/sub/${subId}`
      );

      

  
      if (res.data.products && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
        
            if (res.data.products.length > 0) {
          const firstProduct = res.data.products[0];
                 try {
               const categoriesRes = await axios.get(`${API_URL}/api/categorys`);
              
            const foundCategory = categoriesRes.data.find(cat => cat._id === categoryId);
            if (foundCategory) {
              setCategory(foundCategory);
              
              // Find subcategory in the category
              const foundSubcategory = foundCategory.subcategories?.find(
                (sub) => sub._id === subId
              );
              setSubcategory(foundSubcategory);
            }
          } catch (err) {
            console.error('Error fetching categories:', err);
          }
        }
      } else {
        console.error('Unexpected API response structure:');
      }

    } catch (error) {
      console.error('Error fetching subcategory products:', error);
      // Handle error gracefully
      if (error.response?.status === 404) {
        alert('Subcategory not found');
        navigate('/');
      }
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

  // Check if parameters are missing
  if (!categoryId || !subId) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="no-products">
            <p>Invalid URL parameters</p>
            <Link to="/" className="btn-back">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          <Link to={`/categories/${categoryId}`}>{category?.name || 'Category'}</Link>
          <span> / </span>
          <span>{subcategory?.name || 'Subcategory'}</span>
        </div>

        <h1>{subcategory?.name || 'Subcategory Products'}</h1>
        
        {!products || products.length === 0 ? (
          <div className="no-products">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <p>No products available in this subcategory</p>
            <Link to={`/categories/${categoryId}`} className="btn-back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Back to Category
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

export default SubcategoryProducts;