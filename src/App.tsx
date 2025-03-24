import { useState, useEffect, useContext } from 'react'
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { jwtDecode } from 'jwt-decode'
import { Container, Box, CircularProgress, Typography } from '@mui/material'

// Components
import Login from './pages/Authentication/Login'
import Register from './pages/Authentication/Register'
import Dashboard from './pages/Dashbord/Dashboard'
import Navbar from './components/Navbar'
import ApiKeys from './pages/Dashbord/ApiKeys'
import LogViewer from './pages/Dashbord/LogViewer'
import UserProfile from './pages/Dashbord/UserProfile'
import Analytics from './pages/Dashbord/Analytics'
import Projects from './pages/Dashbord/Projects'

// Auth context
import { AuthProvider } from './context/AuthContext'
import AuthContext from './context/AuthContext'
import GoogleCallback from './pages/Authentication/GoogleCallback'

const theme = createTheme({
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 500,
    },
    subtitle1: {
      fontFamily: '"DM Sans", sans-serif',
    },
    subtitle2: {
      fontFamily: '"DM Sans", sans-serif',
    },
    body1: {
      fontFamily: '"DM Sans", sans-serif',
    },
    body2: {
      fontFamily: '"DM Sans", sans-serif',
    },
    button: {
      fontFamily: '"DM Sans", sans-serif',
      textTransform: 'none',
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

// This component checks if we're on the Google callback URL and handles it
const GoogleRedirectHandler = () => {
  const [redirecting, setRedirecting] = useState(false);
  
  useEffect(() => {
    // Check if the current URL is a Google callback URL
    const isGoogleCallback = window.location.pathname.includes('/auth/google/callback');
    
    if (isGoogleCallback) {
      console.log("Detected Google callback URL:", window.location.href);
      setRedirecting(true);
      
      // Extract the code from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log("Found authorization code, redirecting to hash-based callback route");
        // Redirect to your hash-based route with the code
        window.location.href = `/#/auth/google/callback?code=${code}`;
      }
    }
  }, []);
  
  if (redirecting) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Processing Google authentication...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return null;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* This component handles non-hash Google callback URLs */}
      <GoogleRedirectHandler />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/api-keys" element={
              <PrivateRoute>
                <ApiKeys />
              </PrivateRoute>
            } />
            <Route path="/logs" element={
              <PrivateRoute>
                <LogViewer />
              </PrivateRoute>
            } />
            <Route path="/analytics" element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } />
            <Route path="/projects" element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Private route component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [localAuthCheck, setLocalAuthCheck] = useState<boolean | null>(null)
  const { isAuthenticated, loading } = useContext(AuthContext);

  // This is a backup check in case the context isn't ready yet
  useEffect(() => {
    console.log("PrivateRoute effect running, context auth state:", { isAuthenticated, loading });
    
    // Only run this check if the context auth state is not yet available
    if (isAuthenticated === false && !loading) {
      console.log("Using context auth state: not authenticated");
      setLocalAuthCheck(false);
      return;
    }
    
    if (isAuthenticated === true && !loading) {
      console.log("Using context auth state: authenticated");
      setLocalAuthCheck(true);
      return;
    }
    
    // Fallback to localStorage check
    console.log("Falling back to localStorage check");
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.log("No token in localStorage");
      setLocalAuthCheck(false)
      return
    }

    try {
      const decoded: any = jwtDecode(token)
      const currentTime = Date.now() / 1000
      
      if (decoded.exp < currentTime) {
        // Token expired
        console.log("Token expired");
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setLocalAuthCheck(false)
      } else {
        console.log("Valid token found in localStorage");
        setLocalAuthCheck(true)
      }
    } catch (error) {
      console.error('Invalid token:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setLocalAuthCheck(false)
    }
  }, [isAuthenticated, loading])

  // Use context state if available, otherwise use local check
  const finalAuthState = isAuthenticated || localAuthCheck;

  if (loading && localAuthCheck === null) {
    console.log("Still loading auth state...");
    // Still checking authentication
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Checking authentication...
          </Typography>
        </Box>
      </Container>
    );
  }

  console.log("Final auth decision:", finalAuthState ? "Authenticated" : "Not authenticated");
  return finalAuthState ? <>{children}</> : <Navigate to="/login" replace />
}

export default App
