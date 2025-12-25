import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      console.log("Token from URL:", token); // Debug log
      console.log("Full URL:", window.location.href); // Debug log

      if (token) {
        // Store token in localStorage
        localStorage.setItem('token', token);
        console.log("Token stored in localStorage"); // Debug log
        
        // Check auth to update user state
        try {
          await checkAuth();
          console.log("Auth check successful"); // Debug log
        } catch (error) {
          console.error("Auth check failed:", error); // Debug log
        }
        
        // Redirect to home page
        navigate('/');
      } else {
        console.log("No token in URL"); // Debug log
        // No token found, redirect to login
        navigate('/login?error=authentication_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Completing your login...</p>
    </div>
  );
}

export default AuthCallback;