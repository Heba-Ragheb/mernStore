import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categorys/`);
      setCategories(res.data);
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
    <div className="categories-page">
      <div className="container">
        <h1>All Categories</h1>
        {categories.length === 0 ? (
          <p className="no-categories">No categories available</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default Categories;