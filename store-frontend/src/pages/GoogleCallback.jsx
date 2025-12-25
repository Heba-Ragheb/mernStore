import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function GoogleCallback() {
  const navigate = useNavigate();
  const { checkAuth, user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('GoogleCallback: Starting...');
      console.log('GoogleCallback: Current user state:', user);
      
      // Wait a moment for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('GoogleCallback: About to call checkAuth');
      
      try {
        // Check auth to update user state with the new cookie
        await checkAuth();
        console.log('GoogleCallback: checkAuth completed');
        
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('GoogleCallback: Navigating to home');
        // Redirect to home page
        navigate('/');
      } catch (error) {
        console.error('GoogleCallback: Error during checkAuth:', error);
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