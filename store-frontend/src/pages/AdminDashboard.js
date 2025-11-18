import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [productImages, setProductImages] = useState([]);

  // Category Form
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [categoryImage, setCategoryImage] = useState(null);

  // Offer Form
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    discount: '',
    backgroundColor: '#667eea'
  });
  const [offerImage, setOfferImage] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOffers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/index`);
      setProducts(res.data.products);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categorys/`);
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/offers/`, {
        withCredentials: true
      });
      setOffers(res.data.offers);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);

    if (productImages.length === 1) {
      formData.append('image', productImages[0]);
    } else if (productImages.length > 1) {
      productImages.forEach((img) => formData.append('image', img));
    }

    try {
      const endpoint =
        productImages.length === 1
          ? '/api/products/addOneImage'
          : '/api/products/addmultiImage';

      await axios.post(`${API_URL}${endpoint}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Product added successfully!');
      setProductForm({ name: '', description: '', price: '', category: '' });
      setProductImages([]);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?'))
      return;

    try {
      await axios.delete(`${API_URL}/api/products/delete/${id}`, {
        withCredentials: true,
      });
      alert('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Failed to delete product');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', categoryForm.name);
    if (categoryImage) {
      formData.append('image', categoryImage);
    }

    try {
      await axios.post(`${API_URL}/api/categorys/add`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Category added successfully!');
      setCategoryForm({ name: '' });
      setCategoryImage(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', offerForm.title);
    formData.append('description', offerForm.description);
    formData.append('discount', offerForm.discount);
    formData.append('backgroundColor', offerForm.backgroundColor);
    if (offerImage) {
      formData.append('image', offerImage);
    }

    try {
      await axios.post(`${API_URL}/api/offers/add`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Offer added successfully!');
      setOfferForm({ title: '', description: '', discount: '', backgroundColor: '#667eea' });
      setOfferImage(null);
      fetchOffers();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add offer');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOffer = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/offers/toggle/${id}`, {}, {
        withCredentials: true
      });
      fetchOffers();
    } catch (error) {
      console.error(error);
      alert('Failed to toggle offer status');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?'))
      return;

    try {
      await axios.delete(`${API_URL}/api/offers/delete/${id}`, {
        withCredentials: true,
      });
      alert('Offer deleted successfully');
      fetchOffers();
    } catch (error) {
      console.error(error);
      alert('Failed to delete offer');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="tabs">
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={activeTab === 'offers' ? 'active' : ''}
            onClick={() => setActiveTab('offers')}
          >
            Offers
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="tab-content">
            <div className="form-section">
              <h2>Add New Product</h2>
              <form onSubmit={handleAddProduct} className="admin-form">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  required
                />
                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setProductImages([...e.target.files])}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </form>
            </div>

            <div className="list-section">
              <h2>All Products</h2>
              <div className="admin-table">
                {products.map((product) => (
                  <div key={product._id} className="admin-item">
                    <img src={product.images[0]?.url} alt={product.name} />
                    <div className="item-info">
                      <h3>{product.name}</h3>
                      <p>${product.price}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="tab-content">
            <div className="form-section">
              <h2>Add New Category</h2>
              <form onSubmit={handleAddCategory} className="admin-form">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCategoryImage(e.target.files[0])}
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </form>
            </div>

            <div className="list-section">
              <h2>All Categories</h2>
              <div className="admin-table">
                {categories.map((category) => (
                  <div key={category._id} className="admin-item">
                    {category.image?.url && (
                      <img src={category.image.url} alt={category.name} />
                    )}
                    <div className="item-info">
                      <h3>{category.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="tab-content">
            <div className="form-section">
              <h2>Add New Offer</h2>
              <form onSubmit={handleAddOffer} className="admin-form">
                <input
                  type="text"
                  placeholder="Offer Title"
                  value={offerForm.title}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, title: e.target.value })
                  }
                  required
                />
                <textarea
                  placeholder="Offer Description"
                  value={offerForm.description}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, description: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Discount (e.g., 50% OFF)"
                  value={offerForm.discount}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, discount: e.target.value })
                  }
                  required
                />
                <div className="color-picker-wrapper">
                  <label>Background Color:</label>
                  <input
                    type="color"
                    value={offerForm.backgroundColor}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, backgroundColor: e.target.value })
                    }
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setOfferImage(e.target.files[0])}
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Offer'}
                </button>
              </form>
            </div>

            <div className="list-section">
              <h2>All Offers</h2>
              <div className="admin-table">
                {offers.map((offer) => (
                  <div key={offer._id} className="admin-item offer-item">
                    {offer.image?.url && (
                      <img src={offer.image.url} alt={offer.title} />
                    )}
                    <div className="item-info">
                      <h3>{offer.title}</h3>
                      <p className="offer-discount">{offer.discount}</p>
                      <span className={`status-badge ${offer.isActive ? 'active' : 'inactive'}`}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button
                        onClick={() => handleToggleOffer(offer._id)}
                        className="btn-toggle"
                      >
                        {offer.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;