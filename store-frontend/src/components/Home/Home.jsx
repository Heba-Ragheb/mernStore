import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/user/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        navigate("/"); // redirect if not logged in
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/products/index");
        setProducts(res.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5050/api/user/logout",
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (err) {
      navigate("/");
    }
  };

  if (loading || !user) {
    return (
      <div className="home-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const avatarLetter = user.name.charAt(0).toUpperCase();

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="home-navbar">
        <h1>Store Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="home-content">
        {/* User Info */}
        <div className="user-panel">
          <div className="user-avatar">{avatarLetter}</div>
          <div className="user-details">
            <h2>{user.name}</h2>
            <span className="role-badge">{user.role}</span>
            <p>Email: {user.email}</p>
            {user.googleId && <p>Login via Google</p>}
          </div>
        </div>

        {/* Products Section */}
        <div className="products-section">
          <h2>Products</h2>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="product-image"
                  />
                ) : (
                  <div className="product-no-image">No Image</div>
                )}
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-meta">
                    <span className="price">${product.price}</span>
                    <span className="category">{product.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
