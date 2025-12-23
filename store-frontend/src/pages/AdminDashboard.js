import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    stock: '',
    discount: '',
  });
  const [productImages, setProductImages] = useState([]);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  // Category Form
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Subcategory Form
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState(null);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  // Offer Form
  const [offerImage, setOfferImage] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOffers();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (productForm.category) {
      const selectedCat = categories.find(cat => cat._id === productForm.category);
      setAvailableSubcategories(selectedCat?.subcategories || []);
      setProductForm(prev => ({ ...prev, subCategory: '' }));
    } else {
      setAvailableSubcategories([]);
    }
  }, [productForm.category, categories]);

  // Filter products based on sidebar selection
  useEffect(() => {
    filterProducts();
  }, [selectedCategory, selectedSubcategory, products]);

  const filterProducts = () => {
  if (!selectedCategory) {
    setFilteredProducts(products);
    return;
  }

  if (selectedSubcategory) {
    // Filter by subcategory - compare subCategory ID (string) with selectedSubcategory (string)
    const filtered = products.filter(p => 
      p.subCategory === selectedSubcategory
    );
    console.log('Filtered by subcategory:', selectedSubcategory, filtered);
    setFilteredProducts(filtered);
  } else {
    // Filter by category only - compare category object's _id with selectedCategory
    const filtered = products.filter(p => 
      p.category && p.category._id === selectedCategory
    );
    console.log('Filtered by category:', selectedCategory, filtered);
    setFilteredProducts(filtered);
  }
};
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/index`);
      setProducts(res.data.products);
      setFilteredProducts(res.data.products);
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
      const res = await axios.get(`${API_URL}/api/offer/`);
      setOffers(res.data.offers || []);
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

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('price', productForm.price);
    formData.append('category', productForm.category);
    
    if (productForm.subCategory) {
      formData.append('subCategory', productForm.subCategory);
    }
    
    formData.append('stock', productForm.stock);
    formData.append('discount', productForm.discount || 0);
    
    if (productImages.length === 1) {
      formData.append('image', productImages[0]);
    } else if (productImages.length > 1) {
      productImages.forEach((img) => formData.append('image', img));
    }

    try {
      const endpoint = productImages.length === 1
        ? '/api/products/addOneImage'
        : '/api/products/addmultiImage';

      await axios.post(`${API_URL}${endpoint}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Product added successfully!');
      setProductForm({ 
        name: '', 
        description: '', 
        price: '', 
        category: '', 
        subCategory: '',
        stock: '', 
        discount: '' 
      });
      setProductImages([]);
      setAvailableSubcategories([]);
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

    try {
      await axios.post(`${API_URL}/api/categorys/`, 
        { name: categoryForm.name },
        { withCredentials: true }
      );

      alert('Category added successfully!');
      setCategoryForm({ name: '' });
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (categoryId) => {
    if (!editCategoryName.trim()) {
      alert('Category name cannot be empty');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/categorys/${categoryId}`,
        { name: editCategoryName },
        { withCredentials: true }
      );

      alert('Category updated successfully!');
      setEditingCategory(null);
      setEditCategoryName('');
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure? This will affect all products in this category!'))
      return;

    try {
      await axios.delete(`${API_URL}/api/categorys/${id}`, {
        withCredentials: true,
      });
      alert('Category deleted successfully');
      fetchCategories();
      clearFilters();
    } catch (error) {
      console.error(error);
      alert('Failed to delete category');
    }
  };

  const handleAddSubcategory = async (categoryId) => {
    if (!subcategoryName.trim()) {
      alert('Subcategory name cannot be empty');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/categorys/${categoryId}/sub`,
        { name: subcategoryName },
        { withCredentials: true }
      );

      alert('Subcategory added successfully!');
      setSubcategoryName('');
      setSelectedCategoryForSub(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add subcategory');
    }
  };

  const handleEditSubcategory = async (categoryId, subId, newName) => {
    if (!newName.trim()) {
      alert('Subcategory name cannot be empty');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/categorys/${categoryId}/sub/${subId}`,
        { name: newName },
        { withCredentials: true }
      );

      alert('Subcategory updated successfully!');
      setEditingSubcategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to update subcategory');
    }
  };

  const handleDeleteSubcategory = async (categoryId, subId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?'))
      return;

    try {
      await axios.delete(
        `${API_URL}/api/categorys/${categoryId}/sub/${subId}`,
        { withCredentials: true }
      );
      alert('Subcategory deleted successfully');
      fetchCategories();
      if (selectedSubcategory === subId) {
        setSelectedSubcategory(null);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete subcategory');
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (offerImage) {
      formData.append('image', offerImage);
    }

    try {
      await axios.post(`${API_URL}/api/offer/addOffer`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Offer added successfully!');
      setOfferImage(null);
      fetchOffers();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to add offer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?'))
      return;

    try {
      await axios.delete(`${API_URL}/api/offer/deleteOffer/${id}`, {
        withCredentials: true,
      });
      alert('Offer deleted successfully');
      fetchOffers();
    } catch (error) {
      console.error(error);
      alert('Failed to delete offer');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/order/status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      alert('Order status updated successfully!');
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update order status");
    }
  };

  const calculateOrderTotal = (order) => {
    if (order.totalPrice) {
      return order.totalPrice;
    }
    return order.products?.reduce((sum, item) => {
      const price = item.finalPrice || item.price || item.productId?.price || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0) || 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'Processing': '#3b82f6',
      'Completed': '#10b981',
      'Cancelled': '#ef4444',
      'Failed': '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentMethodBadge = (method) => {
    return method === 'Online' 
      ? <span className="payment-badge online">💳 Online</span>
      : <span className="payment-badge cash">💵 Cash</span>;
  };

  const getPaymentStatusBadge = (payment) => {
    return payment === 'Paid'
      ? <span className="payment-status-badge paid">✓ Paid</span>
      : <span className="payment-status-badge unpaid">⏳ Unpaid</span>;
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return 'All Products';
    const category = categories.find(c => c._id === selectedCategory);
    if (!selectedSubcategory) return category?.name || 'Category';
    const subcategory = category?.subcategories.find(s => s._id === selectedSubcategory);
    return `${category?.name} > ${subcategory?.name}` || 'Products';
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-layout">
        {/* Sidebar */}
        <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          {sidebarOpen && (
            <div className="sidebar-content">
              <h3 className="sidebar-title">Categories</h3>
              
            <button 
  className={`sidebar-item all-products ${!selectedCategory ? 'active' : ''}`}
  onClick={clearFilters}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
  </svg>
  All Products ({products.length})
</button>
              {categories.map((category) => (
                <div key={category._id} className="category-group">
                 <button
  className={`sidebar-item category ${selectedCategory === category._id && !selectedSubcategory ? 'active' : ''}`}
  onClick={() => handleCategoryClick(category._id)}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2"/>
  </svg>
  {category.name}
  <span className="category-count">
    ({products.filter(p => p.category && p.category._id === category._id).length})
  </span>
</button>

                  {selectedCategory === category._id && category.subcategories && category.subcategories.length > 0 && (
  <div className="subcategory-list">
    {category.subcategories.map((sub) => (
      <button
        key={sub._id}
        className={`sidebar-item subcategory ${selectedSubcategory === sub._id ? 'active' : ''}`}
        onClick={() => handleSubcategoryClick(category._id, sub._id)}
      >
        <span className="subcategory-dot">•</span>
        {sub.name}
        <span className="category-count">
          ({products.filter(p => p.subCategory === sub._id).length})
        </span>
      </button>
    ))}
  </div>
)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="admin-content">
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
                {/* Add Product Form */}
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
                    <input
                      type="number"
                      placeholder="Discount (%)"
                      value={productForm.discount}
                      onChange={(e) =>
                        setProductForm({ ...productForm, discount: e.target.value })
                      }
                    />
                    
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({ ...productForm, category: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Category *</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    {productForm.category && (
                      <select
                        value={productForm.subCategory}
                        onChange={(e) =>
                          setProductForm({ ...productForm, subCategory: e.target.value })
                        }
                      >
                        <option value="">Select Subcategory (Optional)</option>
                        {availableSubcategories.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setProductImages([...e.target.files])}
                      required
                    />
                    
                    {productImages.length > 0 && (
                      <div className="image-preview-count">
                        {productImages.length} image(s) selected
                      </div>
                    )}

                    <button type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Product'}
                    </button>
                  </form>
                </div>

                {/* Products List */}
                <div className="list-section">
                  <div className="section-header-with-filter">
                    <h2>{getSelectedCategoryName()} ({filteredProducts.length})</h2>
                    {(selectedCategory || selectedSubcategory) && (
                      <button onClick={clearFilters} className="btn-clear-filter">
                        Clear Filter
                      </button>
                    )}
                  </div>
                  <div className="admin-table">
                    {filteredProducts.map((product) => (
                      <div key={product._id} className="admin-item">
                        <img src={product.images[0]?.url} alt={product.name} />
                        <div className="item-info">
                          <h3>{product.name}</h3>
                          <p className="product-category-info">
                            {product.category?.name || 'No Category'}
                            {product.subCategory && ` > Subcategory`}
                          </p>
                          <div className="product-price-info">
                            {product.discount > 0 ? (
                              <>
                                <span className="old-price">${product.price}</span>
                                <span className="new-price">
                                  ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                </span>
                                <span className="discount-tag">-{product.discount}%</span>
                              </>
                            ) : (
                              <span className="new-price">${product.price}</span>
                            )}
                          </div>
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

            {/* Categories, Offers, Orders tabs remain the same */}
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
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </form>
            </div>

            <div className="list-section">
              <h2>All Categories ({categories.length})</h2>
              <div className="categories-list">
                {categories.map((category) => (
                  <div key={category._id} className="category-card">
                    <div className="category-header">
                      {editingCategory === category._id ? (
                        <div className="edit-mode">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            placeholder="Category name"
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditCategory(category._id)}
                            className="btn-save"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(null);
                              setEditCategoryName('');
                            }}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3>{category.name}</h3>
                          <div className="category-actions">
                            <button
                              onClick={() => {
                                setEditingCategory(category._id);
                                setEditCategoryName(category.name);
                              }}
                              className="btn-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="subcategories-section">
                      <h4>Subcategories ({category.subcategories?.length || 0})</h4>
                      
                      {selectedCategoryForSub === category._id ? (
                        <div className="add-subcategory-form">
                          <input
                            type="text"
                            value={subcategoryName}
                            onChange={(e) => setSubcategoryName(e.target.value)}
                            placeholder="Subcategory name"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddSubcategory(category._id)}
                            className="btn-save"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCategoryForSub(null);
                              setSubcategoryName('');
                            }}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedCategoryForSub(category._id)}
                          className="btn-add-sub"
                        >
                          + Add Subcategory
                        </button>
                      )}

                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="subcategories-list">
                          {category.subcategories.map((sub) => (
                            <div key={sub._id} className="subcategory-item">
                              {editingSubcategory === sub._id ? (
                                <div className="edit-mode">
                                  <input
                                    type="text"
                                    defaultValue={sub.name}
                                    onBlur={(e) => {
                                      if (e.target.value !== sub.name) {
                                        handleEditSubcategory(
                                          category._id,
                                          sub._id,
                                          e.target.value
                                        );
                                      } else {
                                        setEditingSubcategory(null);
                                      }
                                    }}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleEditSubcategory(
                                          category._id,
                                          sub._id,
                                          e.target.value
                                        );
                                      }
                                    }}
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <>
                                  <span>{sub.name}</span>
                                  <div className="subcategory-actions">
                                    <button
                                      onClick={() => setEditingSubcategory(sub._id)}
                                      className="btn-edit-small"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteSubcategory(category._id, sub._id)
                                      }
                                      className="btn-delete-small"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
                <div className="image-upload-preview">
                  {offerImage && (
                    <div className="preview-image">
                      <img src={URL.createObjectURL(offerImage)} alt="Offer preview" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setOfferImage(e.target.files[0])}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Offer'}
                </button>
              </form>
            </div>

            <div className="list-section">
              <h2>All Offers ({offers.length})</h2>
              <div className="offers-grid">
                {offers.map((offer) => (
                  <div key={offer._id} className="offer-card">
                    {offer.images?.[0]?.url && (
                      <img src={offer.images[0].url} alt="Offer" className="offer-image" />
                    )}
                    <div className="offer-actions">
                      <span className="offer-date">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
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
                    const totalItems = order.products?.reduce((sum, item) => 
                      sum + (item.quantity || 1), 0
                    ) || 0;

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
                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                              {getPaymentMethodBadge(order.paymentMethod)}
                              {getPaymentStatusBadge(order.payment)}
                            </div>
                          </div>

                          <select
                            value={order.status || 'Pending'}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="order-status-select"
                            style={{
                              backgroundColor: getStatusColor(order.status || 'Pending'),
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Failed">Failed</option>
                          </select>
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
                                const productName = product.name || item.name || 'Unknown Product';
                                const productPrice = item.finalPrice || item.price || product.price || 0;
                                const productImage = product.images?.[0]?.url || item.images?.[0]?.url;
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
</div>
      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }

        .admin-sidebar {
          width: 280px;
          background: white;
          border-right: 2px solid #e5e7eb;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          transition: all 0.3s ease;
        }

        .admin-sidebar.closed {
          width: 60px;
        }

        .sidebar-toggle {
          width: 100%;
          padding: 15px;
          background: #667eea;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 18px;
          transition: background 0.3s;
        }

        .sidebar-toggle:hover {
          background: #5568d3;
        }

        .sidebar-content {
          padding: 20px;
        }

        .sidebar-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 16px 0;
        }

        .sidebar-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #4b5563;
          text-align: left;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }

        .sidebar-item:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .sidebar-item.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .sidebar-item.all-products {
          margin-bottom: 12px;
          font-weight: 600;
        }

        .category-group {
          margin-bottom: 8px;
        }

        .category-count {
          margin-left: auto;
          font-size: 12px;
          opacity: 0.7;
        }

        .subcategory-list {
          padding-left: 16px;
          margin-top: 4px;
        }

        .sidebar-item.subcategory {
          font-size: 13px;
          padding: 8px 12px;
        }

        .subcategory-dot {
          font-size: 20px;
          line-height: 1;
        }

        .admin-content {
          flex: 1;
          overflow-x: hidden;
        }

        .section-header-with-filter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .btn-clear-filter {
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .btn-clear-filter:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            z-index: 1000;
            box-shadow: 2px 0 8px rgba(0,0,0,0.1);
          }

          .admin-sidebar.closed {
            transform: translateX(-100%);
          }

          .admin-content {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;