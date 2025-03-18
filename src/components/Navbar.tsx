import { useContext } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import AuthContext from '../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <RouterLink to="/" style={{ color: 'white', textDecoration: 'none' }}>
                Logger
              </RouterLink>
            </Typography>
            
            {isAuthenticated ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button color="inherit" component={RouterLink} to="/dashboard">
                    Dashboard
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/api-keys">
                    API Keys
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/logs">
                    Logs
                  </Button>
                  <Typography variant="body1" sx={{ mx: 2 }}>
                    Hello, {user?.username}
                  </Typography>
                  <Tooltip title="Profile">
                    <IconButton 
                      color="inherit" 
                      component={RouterLink} 
                      to="/profile"
                      sx={{ mr: 1 }}
                    >
                      <PersonIcon />
                    </IconButton>
                  </Tooltip>
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/register">
                  Register
                </Button>
              </>
            )}
          </Toolbar>
        </Box>
      </Container>
    </AppBar>
  )
}

export default Navbar 