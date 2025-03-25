import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleAuthenticate } from '../../api/Auth';
import { toast } from 'react-toastify'; // or your preferred notification library
import { CircularProgress, Typography, Box, Container } from '@mui/material';
import AuthContext from '../../context/AuthContext';

const GoogleCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleLoginSuccess } = useContext(AuthContext);

  useEffect(() => {
    // Check if we've already processed this code
    const recentAuthFlag = sessionStorage.getItem('recent_google_auth');
    
    const handleGoogleCallback = async () => {
      console.log("GoogleCallback component mounted, processing authentication...");
      let code = null;
      
      // Extract the code from search params
      const searchParams = new URLSearchParams(location.search);
      code = searchParams.get('code');
      console.log("Code from search params:", code ? "Found" : "Not found");
      
      // If no code in search params, check if we're in a hash route with params
      if (!code && location.hash.includes('?')) {
        // For hash routing: /#/auth/google/callback?code=...
        const hashParams = new URLSearchParams(location.hash.split('?')[1]);
        code = hashParams.get('code');
        console.log("Code from hash params:", code ? "Found" : "Not found");
      }
      
      // If still no code, try extracting from full URL
      if (!code) {
        const fullUrl = window.location.href;
        console.log("Full URL for debugging:", fullUrl);
        if (fullUrl.includes('code=')) {
          const codeMatch = fullUrl.match(/[?&]code=([^&]+)/);
          code = codeMatch ? codeMatch[1] : null;
          console.log("Code from full URL:", code ? "Found" : "Not found");
        }
      }
      
      if (!code) {
        const errorMsg = 'No authorization code received from Google';
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        toast.error('Authentication failed: No code received from Google');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Check if we already processed this exact code to prevent duplicate processing
      if (recentAuthFlag && recentAuthFlag === code) {
        console.log("Already processed this auth code, redirecting to dashboard");
        navigate('/dashboard');
        return;
      }
      
      try {
        console.log("Calling backend to authenticate with Google code...");
        const data = await googleAuthenticate(code);
        console.log("Backend response:", JSON.stringify(data, null, 2));
        
        // Check if the response has the expected structure
        if (!data) {
          throw new Error("Empty response from server");
        }
        
        // Log keys to help diagnose response structure
        console.log("Response keys:", Object.keys(data));
        
        if (!data.access_token) {
          console.error("Missing access_token in response");
          // Check if token is under a different name
          if (data.token || data.access) {
            console.log("Found token under different name:", data.token || data.access);
            data.access_token = data.token || data.access;
          }
        }
        
        if (!data.refresh_token) {
          console.error("Missing refresh_token in response");
          // Check if refresh is under a different name
          if (data.refresh) {
            console.log("Found refresh_token under different name:", data.refresh);
            data.refresh_token = data.refresh;
          }
        }
        
        if (!data.user) {
          console.error("Missing user data in response");
          // If user data might be directly in the response
          if (data.id && (data.email || data.username)) {
            console.log("Found user data at root level, creating user object");
            data.user = {
              id: data.id,
              email: data.email,
              username: data.username || data.email.split('@')[0]
            };
          }
        }
        
        // Final check after attempted fixes
        if (!data.access_token || !data.refresh_token || !data.user) {
          console.error("Backend response missing required fields:", data);
          throw new Error("Invalid response from server");
        }
        
        // Use the new AuthContext method to handle login
        handleGoogleLoginSuccess(
          data.access_token,
          data.refresh_token,
          data.user
        );
        
        // Save the code to sessionStorage to prevent duplicate processing
        sessionStorage.setItem('recent_google_auth', code);
        
        console.log("Authentication successful, user state updated");
        toast.success("Google login successful! Redirecting...");
        
        // Add a small delay to ensure state updates before navigation
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          // Check if we have a saved redirect path
          const redirectAfterAuth = sessionStorage.getItem('auth_redirect_after');
          if (redirectAfterAuth) {
            console.log("Redirecting to saved path:", redirectAfterAuth);
            sessionStorage.removeItem('auth_redirect_after');
            navigate(redirectAfterAuth);
          } else {
            navigate('/dashboard');
          }
        }, 500);
      } catch (error: any) {
        console.error('Google authentication error:', error);
        setError(error.message || 'Failed to authenticate with Google');
        setLoading(false);
        toast.error('Failed to authenticate with Google');
        
        // Clear the auth flag if we failed
        sessionStorage.removeItem('recent_google_auth');
        
        setTimeout(() => navigate('/login'), 3000);
      }
    };
    
    // Don't reprocess the same code
    if (!recentAuthFlag) {
      handleGoogleCallback();
    } else {
      console.log("Clearing recent_google_auth flag");
      // Wait a moment, then clear the flag to allow future logins
      setTimeout(() => {
        sessionStorage.removeItem('recent_google_auth');
      }, 5000);
      navigate('/dashboard');
    }
    
    // Cleanup function to prevent processing during unmounts/remounts
    return () => {
      // Keep the flag for a while to prevent reprocessing during remounts
    };
  }, [location, navigate, handleGoogleLoginSuccess]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Authenticating with Google...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <Typography variant="h5" color="error" gutterBottom>
            Authentication Error
          </Typography>
          <Typography variant="body1">{error}</Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Redirecting to login page...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return null;
};

export default GoogleCallback;
