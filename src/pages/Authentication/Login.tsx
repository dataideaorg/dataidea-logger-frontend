import { useState, useContext } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link,
} from '@mui/material'
import AuthContext from '../../context/AuthContext'
import { getGoogleAuthUrl } from '../../api/Auth';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('Error getting Google auth URL:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          setError(err.response.data.detail)
        } else {
          setError('Invalid credentials')
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 8 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 500, width: '100%' }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Log In
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#008374' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                {/* or login with google */}
                <Typography variant="body2">Or</Typography>
                <Button onClick={handleGoogleLogin} variant="outlined" color="primary" 
                sx={{ width: '100%', mt: 2, mb:2, borderColor: '#008374', color: '#008374', '&:hover': { borderColor: '#008374', color: '#008374' } }}>
                  <GoogleIcon />
                  Sign in with Google
                </Button>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link component={RouterLink} className='text-[#008374]' to="/register">
                    Register here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  )
}

export default Login 