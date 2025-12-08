import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

function CategoryProducts() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL ;

  useEffect(() => {
    fetchCategoryProducts();
  }, [id]);

  const fetchCategoryProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categorys/${id}`);
      setProducts(res.data.products);
      // You might want to fetch category name separately
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
        <h1>Category Products</h1>
        {products.length === 0 ? (
          <p className="no-products">No products in this category</p>
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
                  <p className="product-price">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryProducts;