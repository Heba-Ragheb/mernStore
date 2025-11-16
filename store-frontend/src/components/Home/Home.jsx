import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/user/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
        // If unauthorized, redirect to login
        navigate("/");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5050/api/user/logout",
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (err) {
      console.error(err);
      // Even if logout fails, redirect to login
      navigate("/");
    }
  };

  if (!user) {
    return (
      <div className="home-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading user...</p>
        </div>
      </div>
    );
  }

  // Get first letter of name for avatar
  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="home-container">
      <nav className="home-navbar">
        <h1>Store Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="home-content">
        <div className="welcome-card">
          <div className="user-avatar">{avatarLetter}</div>
          <h2>Welcome, {user.name}!</h2>
          <span className="role-badge">{user.role}</span>
        </div>

        <div className="user-info-card">
          <div className="user-info-grid">
            <div className="info-item">
              <div className="info-label">Full Name</div>
              <div className="info-value">{user.name}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email Address</div>
              <div className="info-value">{user.email}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Account Role</div>
              <div className="info-value">{user.role}</div>
            </div>
            {user.googleId && (
              <div className="info-item">
                <div className="info-label">Login Method</div>
                <div className="info-value">Google OAuth</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;