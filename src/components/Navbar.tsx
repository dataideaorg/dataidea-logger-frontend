import { useContext, useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  ListItemButton
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import BarChartIcon from '@mui/icons-material/BarChart'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import ListAltIcon from '@mui/icons-material/ListAlt'
import LogoutIcon from '@mui/icons-material/Logout'
import AuthContext from '../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setDrawerOpen(open)
  }

  const navItems = isAuthenticated ? [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'API Keys', icon: <VpnKeyIcon />, path: '/api-keys' },
    { text: 'Logs', icon: <ListAltIcon />, path: '/logs' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' }
  ] : [
    { text: 'Login', icon: <PersonIcon />, path: '/login' },
    { text: 'Register', icon: <PersonIcon />, path: '/register' }
  ]

  const drawerContent = (
    <Box
      sx={{ width: 250, borderRadius: 0 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 0 }}>
        <Typography variant="h6" component={RouterLink} to="/" 
          sx={{ color: '#008374', textDecoration: 'none', fontWeight: 'bold', mb: 1 }}>
          Logger
        </Typography>
        {isAuthenticated && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Hello, {user?.username}
          </Typography>
        )}
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 131, 116, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 131, 116, 0.2)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#008374' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <AppBar position="static" sx={{ backgroundColor: '#008374', borderRadius: 0 }}>
      <Container maxWidth={false}>
        <Toolbar disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: '"DM Sans", sans-serif' }}>
            <RouterLink to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Logger
            </RouterLink>
          </Typography>
          
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                {drawerContent}
              </Drawer>
            </>
          ) : (
            <>
              {isAuthenticated ? (
                <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: 0 }}>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/dashboard"
                    sx={{ 
                      fontFamily: '"DM Sans", sans-serif',
                      opacity: location.pathname === '/dashboard' ? 1 : 0.8,
                      fontWeight: location.pathname === '/dashboard' ? 600 : 400
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/api-keys"
                    sx={{ 
                      fontFamily: '"DM Sans", sans-serif',
                      opacity: location.pathname === '/api-keys' ? 1 : 0.8,
                      fontWeight: location.pathname === '/api-keys' ? 600 : 400
                    }}
                  >
                    API Keys
                  </Button>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/logs"
                    sx={{ 
                      fontFamily: '"DM Sans", sans-serif',
                      opacity: location.pathname === '/logs' ? 1 : 0.8,
                      fontWeight: location.pathname === '/logs' ? 600 : 400
                    }}
                  >
                    Logs
                  </Button>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/analytics"
                    sx={{ 
                      fontFamily: '"DM Sans", sans-serif',
                      opacity: location.pathname === '/analytics' ? 1 : 0.8,
                      fontWeight: location.pathname === '/analytics' ? 600 : 400
                    }}
                  >
                    Analytics
                  </Button>
                  <Typography variant="body1" sx={{ mx: 2, fontFamily: '"DM Sans", sans-serif' }}>
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
                  <Tooltip title="Analytics">
                    <IconButton 
                      color="inherit" 
                      component={RouterLink} 
                      to="/analytics"
                      sx={{ mr: 1 }}
                    >
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
                  <Button 
                    color="inherit" 
                    onClick={handleLogout}
                    sx={{ fontFamily: '"DM Sans", sans-serif' }}
                  >
                    Logout
                  </Button>
                </Box>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/login"
                    sx={{ fontFamily: '"DM Sans", sans-serif' }}
                  >
                    Login
                  </Button>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/register"
                    sx={{ fontFamily: '"DM Sans", sans-serif' }}
                  >
                    Register
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar 