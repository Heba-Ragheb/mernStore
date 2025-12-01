import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  // Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
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
    fetchOrders();
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

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/order/`, {
        withCredentials: true
      });
      setOrders(res.data.orders);
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
    formData.append('stock', productForm.stock);
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
      setProductForm({ name: '', description: '', price: '', category: '', stock: '' });
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

  // Calculate order total price correctly with quantity
  const calculateOrderTotal = (order) => {
    if (!order.totalPrice) {
      // Fallback: calculate from products if totalPrice not available
      return order.products?.reduce((sum, item) => {
        const price = item.productId?.price || item.price || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0) || 0;
    }
    return order.totalPrice;
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
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
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
                <input
                  type="number"
                  placeholder="Stock"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({ ...productForm, stock: e.target.value })
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
              <h2>All Products ({products.length})</h2>
              <div className="admin-table">
                {products.map((product) => (
                  <div key={product._id} className="admin-item">
                    <img src={product.images[0]?.url} alt={product.name} />
                    <div className="item-info">
                      <h3>{product.name}</h3>
                      <p>${product.price}</p>
                      <p className="stock-info">Stock: {product.stock || 0}</p>
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
              <h2>All Categories ({categories.length})</h2>
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
              <h2>All Offers ({offers.length})</h2>
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

        {activeTab === 'orders' && (
          <div className="tab-content">
            <div className="list-section">
              <h2>All Orders ({orders.length})</h2>
              {orders.length === 0 ? (
                <div className="no-data">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#ccc"/>
                  </svg>
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="orders-admin-list">
                  {orders.map((order) => {
                    const orderTotal = calculateOrderTotal(order);
                    const totalItems = order.products?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
                    
                    return (
                      <div key={order._id} className="order-admin-card">
                        <div className="order-admin-header">
                          <div>
                            <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                            <p className="order-date">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <span className="order-status-badge pending">Pending</span>
                        </div>

                        <div className="order-admin-details">
                          <div className="order-customer-info">
                            <h4>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Customer Information
                            </h4>
                            <p><strong>Name:</strong> {order.fullname}</p>
                            <p><strong>Phone:</strong> {order.phone}</p>
                            <p><strong>Address:</strong> {order.address}</p>
                          </div>

                          <div className="order-items-summary">
                            <h4>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Items ({totalItems})
                            </h4>
                            <div className="order-items-list">
                              {order.products?.slice(0, 3).map((item, index) => {
                                const product = item.productId || item;
                                const productName = product.name || 'Unknown Product';
                                const productPrice = product.price || 0;
                                const productImage = product.images?.[0]?.url;
                                const quantity = item.quantity || 1;

                                return (
                                  <div key={index} className="order-item-mini">
                                    {productImage && (
                                      <img src={productImage} alt={productName} />
                                    )}
                                    <div className="order-item-details">
                                      <p className="item-name">{productName}</p>
                                      <p className="item-quantity">Qty: {quantity}</p>
                                      <p className="item-price">${productPrice.toFixed(2)} each</p>
                                    </div>
                                  </div>
                                );
                              })}
                              {order.products?.length > 3 && (
                                <p className="more-items">
                                  +{order.products.length - 3} more items
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="order-admin-footer">
                          <div className="order-summary">
                            <span className="order-total-label">Order Total:</span>
                            <span className="order-total-amount">${orderTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;