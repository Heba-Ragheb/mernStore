import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import CategoryProducts from './pages/CategoryProducts';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:id" element={<CategoryProducts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes - Require Login */}
          <Route path="/cart" element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          } />
          <Route path="/checkout" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />
          <Route path="/orders" element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          } />
          
          {/* Admin Only Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;