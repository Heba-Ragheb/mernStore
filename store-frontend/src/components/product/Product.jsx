import { useEffect, useState } from "react";
import axios from "axios";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/products/index");
        setProducts(res.data.products);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5050/api/products/addToCart",
        { productId },
        { withCredentials: true }
      );
      alert("Product added to cart!");
    } catch (error) {
      console.error(error);
      alert("You must be logged in to add items to cart");
    }
  };

  return (
    <div className="products-container">
      <h2 className="products-title">Products</h2>

      <div className="products-grid">
        {products.map((p) => (
          <div key={p._id} className="product-card">
            <img
              src={`http://localhost:5050/${p.images[0]?.url}` || "/no-image.jpg"}
              alt={p.name}
              className="product-image"
            />

            <div className="product-info">
              <h3 className="product-name">{p.name}</h3>
              <p className="product-description">
                {p.description?.slice(0, 60)}...
              </p>

              <div className="product-meta">
                <span className="product-category">{p.category}</span>
                <span className="product-price">${p.price}</span>
              </div>

              <button
                onClick={() => addToCart(p._id)}
                className="add-btn"
              >
                Add to Cart 🛒
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
