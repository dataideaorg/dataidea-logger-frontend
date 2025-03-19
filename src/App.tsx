import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { jwtDecode } from 'jwt-decode'

// Components
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import ApiKeys from './components/ApiKeys'
import LogViewer from './components/LogViewer'
import UserProfile from './components/UserProfile'
import Analytics from './components/Analytics'

// Auth context
import { AuthProvider } from './context/AuthContext'

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setIsAuthenticated(false)
      return
    }

    try {
      const decoded: any = jwtDecode(token)
      const currentTime = Date.now() / 1000
      
      if (decoded.exp < currentTime) {
        // Token expired
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setIsAuthenticated(false)
      } else {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Invalid token:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setIsAuthenticated(false)
    }
  }, [])

  if (isAuthenticated === null) {
    // Still checking authentication
    return <div>Loading...</div>
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default App
