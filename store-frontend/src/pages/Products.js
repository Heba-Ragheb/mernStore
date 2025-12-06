import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
          <p className="no-products">No products available</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="product-card"
              >
                {product.images[0]?.url && (
                  <img src={product.images[0].url} alt={product.name} />
                )}
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">
                    {product.description.substring(0, 100)}...
                  </p>
                   <span className="new-price">stock:{product.stock}</span>
                     
                  <div className="product-price">
                    {product.discount > 0 ? (
                      <>
                        <span className="old-price">${product.price}</span>
                        <span className="new-price">${product.finalPrice}</span>
                        <span className="discount-tag">-{product.discount}%</span>
                      </>
                    ) : (
                      <span className="new-price">${product.price}</span>
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

export default Products;