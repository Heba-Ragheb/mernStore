import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function GoogleCallback() {
  const navigate = useNavigate();
  const { checkAuth, user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      
      // Wait a moment for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 500));
      
       
      try {
        // Check auth to update user state with the new cookie
        await checkAuth();
         
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 300));
        
            // Redirect to home page
        navigate('/');
      } catch (error) {
           navigate('/login?error=google_auth_failed');
      }
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