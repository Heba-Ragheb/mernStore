import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/products/index`),
        axios.get(`${API_URL}/api/categorys/`),
      ]);

      setProducts(productsRes.data.products.slice(0, 6));
      setCategories(categoriesRes.data.slice(0, 4));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Only ONE useEffect here
  useEffect(() => {
    fetchData();
  }, [API_URL]); // safe dependency

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our Store</h1>
          <p>Discover amazing products at great prices</p>
          <Link to="/products" className="hero-btn">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <h2>Featured Categories</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/category/${category._id}`}
                className="category-card"
              >
                {category.image?.url && (
                  <img src={category.image.url} alt={category.name} />
                )}
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
          <Link to="/categories" className="view-all-btn">
            View All Categories
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
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
                  <p className="product-price">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/products" className="view-all-btn">
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
