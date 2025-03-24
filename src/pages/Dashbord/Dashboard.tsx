import { useContext, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import axios from 'axios'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material'
import { motion } from 'framer-motion'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddIcon from '@mui/icons-material/Add'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import EventNoteIcon from '@mui/icons-material/EventNote'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import RefreshIcon from '@mui/icons-material/Refresh'
import AuthContext from '../../context/AuthContext'
import {API_URL} from '../../api/endpoints'
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
}

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
}

interface UserStats {
  total_event_logs: number;
  total_llm_logs: number;
  logs_by_level: {
    info: number;
    warning: number;
    error: number;
    debug: number;
  };
  api_keys_count: number;
}

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        const response = await axios.get(`${API_URL}/user/stats/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const refreshStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/user/stats/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const primaryColor = '#008374'
  const primaryLight = alpha(primaryColor, 0.1)
  const primaryMedium = alpha(primaryColor, 0.2)

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
              Welcome, {user?.username}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This is your logging dashboard. From here, you can manage your API keys and view your logs.
            </Typography>
          </Box>
          <Tooltip title="Refresh Statistics">
            <IconButton 
              onClick={refreshStats} 
              disabled={loading}
              sx={{ 
                bgcolor: primaryLight, 
                '&:hover': { bgcolor: primaryMedium },
                transition: 'all 0.3s ease'
              }}
            >
              <RefreshIcon sx={{ color: primaryColor }} />
            </IconButton>
          </Tooltip>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress sx={{ color: primaryColor }} />
          </Box>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={6} lg={3}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 240,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[8],
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        backgroundColor: primaryColor,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <VpnKeyIcon sx={{ mr: 1, color: primaryColor }} />
                      <Typography variant="h5" component="h2" fontWeight="500">
                        API Keys
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ my: 2, fontWeight: 'bold', color: primaryColor }}>
                      {stats?.api_keys_count || 0}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Total API keys in your account
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/api-keys"
                      startIcon={<AddIcon />}
                      sx={{ 
                        alignSelf: 'flex-start',
                        bgcolor: primaryColor,
                        '&:hover': {
                          bgcolor: alpha(primaryColor, 0.8),
                        },
                        transition: 'background-color 0.3s ease',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Manage API Keys
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 240,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[8],
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#3f51b5',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventNoteIcon sx={{ mr: 1, color: '#3f51b5' }} />
                      <Typography variant="h5" component="h2" fontWeight="500">
                        Event Logs
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ my: 2, fontWeight: 'bold', color: '#3f51b5' }}>
                      {stats?.total_event_logs || 0}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Tooltip title="Info logs">
                        <Chip label={`Info: ${stats?.logs_by_level.info || 0}`} size="small" sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3' }} />
                      </Tooltip>
                      <Tooltip title="Warning logs">
                        <Chip label={`Warn: ${stats?.logs_by_level.warning || 0}`} size="small" sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800' }} />
                      </Tooltip>
                      <Tooltip title="Error logs">
                        <Chip label={`Error: ${stats?.logs_by_level.error || 0}`} size="small" sx={{ bgcolor: alpha('#f44336', 0.1), color: '#f44336' }} />
                      </Tooltip>
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/logs"
                      startIcon={<VisibilityIcon />}
                      sx={{ 
                        alignSelf: 'flex-start',
                        bgcolor: '#3f51b5',
                        '&:hover': {
                          bgcolor: alpha('#3f51b5', 0.8),
                        },
                        transition: 'background-color 0.3s ease',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      View Event Logs
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={6} lg={3}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 240,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[8],
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#9c27b0',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SmartToyIcon sx={{ mr: 1, color: '#9c27b0' }} />
                      <Typography variant="h5" component="h2" fontWeight="500">
                        LLM Logs
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ my: 2, fontWeight: 'bold', color: '#9c27b0' }}>
                      {stats?.total_llm_logs || 0}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      AI model interaction logs
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/logs"
                      startIcon={<VisibilityIcon />}
                      sx={{ 
                        alignSelf: 'flex-start',
                        bgcolor: '#9c27b0',
                        '&:hover': {
                          bgcolor: alpha('#9c27b0', 0.8),
                        },
                        transition: 'background-color 0.3s ease',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      View LLM Logs
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>
            
              <Grid item xs={12} md={6} lg={3}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 240,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[8],
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        backgroundColor: '#2e7d32',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MenuBookIcon sx={{ mr: 1, color: '#2e7d32' }} />
                      <Typography variant="h5" component="h2" fontWeight="500">
                        Documentation
                      </Typography>
                    </Box>
                    <Typography variant="body1" paragraph sx={{ my: 2 }}>
                      Access our developer guides and API documentation to make the most of the logging service.
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                      variant="contained"
                      component="a"
                      href="https://docs.dataidea.org"
                      target="_blank"
                      startIcon={<MenuBookIcon />}
                      sx={{ 
                        alignSelf: 'flex-start',
                        bgcolor: '#2e7d32',
                        '&:hover': {
                          bgcolor: alpha('#2e7d32', 0.8),
                        },
                        transition: 'background-color 0.3s ease',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      View Documentation
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>

              
            </Grid>
          </motion.div>
        )}

        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
              Quick Start Guide
            </Typography>
            <motion.div variants={containerVariants}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Card 
                      elevation={2}
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[5],
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box
                            sx={{ 
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              bgcolor: alpha(primaryColor, 0.1),
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              mr: 2,
                              color: primaryColor,
                              fontWeight: 'bold'
                            }}
                          >
                            1
                          </Box>
                          <Typography variant="h6" component="h3" fontWeight="500">
                            Create an API Key
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Go to the API Keys section and create a new key. Give it a descriptive name so you can identify it later.
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button 
                          size="small" 
                          component={RouterLink} 
                          to="/api-keys" 
                          variant="outlined"
                          startIcon={<AddIcon />}
                          sx={{ 
                            color: primaryColor,
                            borderColor: primaryColor,
                            '&:hover': {
                              bgcolor: alpha(primaryColor, 0.1),
                              borderColor: primaryColor
                            },
                            borderRadius: '8px',
                            textTransform: 'none'
                          }}
                        >
                          Create API Key
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>

                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Card 
                      elevation={2}
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[5],
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box
                            sx={{ 
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              bgcolor: alpha(primaryColor, 0.1),
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              mr: 2,
                              color: primaryColor,
                              fontWeight: 'bold'
                            }}
                          >
                            2
                          </Box>
                          <Typography variant="h6" component="h3" fontWeight="500">
                            Send Logs
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Use your API key to send logs to our service. Here's an example using curl:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            p: 2,
                            mt: 2,
                            bgcolor: alpha('#f5f5f5', 0.8),
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.8rem',
                            border: '1px solid #e0e0e0',
                          }}
                        >
                          {`curl -X POST http://localhost:8000/api/event-log/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "your-api-key", 
    "user_id": "user123",
    "message": "User interaction logged",
    "level": "info",
    "metadata": {"session_id": "abc123"}
  }'`}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Card 
                      elevation={2}
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[5],
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box
                            sx={{ 
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              bgcolor: alpha(primaryColor, 0.1),
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              mr: 2,
                              color: primaryColor,
                              fontWeight: 'bold'
                            }}
                          >
                            3
                          </Box>
                          <Typography variant="h6" component="h3" fontWeight="500">
                            View Your Logs
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Go to the Logs section to view, filter, and search through your logs. You can see both event logs and LLM interaction logs in a single interface.
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <Button 
                          size="small" 
                          component={RouterLink} 
                          to="/logs" 
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          sx={{ 
                            color: primaryColor,
                            borderColor: primaryColor,
                            '&:hover': {
                              bgcolor: alpha(primaryColor, 0.1),
                              borderColor: primaryColor
                            },
                            borderRadius: '8px',
                            textTransform: 'none'
                          }}
                        >
                          View Logs
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>
          </Box>
        </motion.div>
      </motion.div>
    </Container>
  )
}

export default Dashboard 