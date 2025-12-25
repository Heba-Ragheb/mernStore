import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function GoogleCallback() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait a moment for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check auth to update user state with the new cookie
      await checkAuth();
      
      // Redirect to home page
      navigate('/');
    };

    handleCallback();
  }, [checkAuth, navigate]);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Completing your login...</p>
    </div>
  );
}

export default GoogleCallback;