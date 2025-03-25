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
  // Divider,
  Avatar,
  LinearProgress,
} from '@mui/material'
import { motion } from 'framer-motion'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddIcon from '@mui/icons-material/Add'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import EventNoteIcon from '@mui/icons-material/EventNote'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import RefreshIcon from '@mui/icons-material/Refresh'
import AssessmentIcon from '@mui/icons-material/Assessment'
import FolderIcon from '@mui/icons-material/Folder'
// import SettingsIcon from '@mui/icons-material/Settings'
// import DownloadIcon from '@mui/icons-material/Download'
import StorageIcon from '@mui/icons-material/Storage'
// import DeleteIcon from '@mui/icons-material/Delete'
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

interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  is_active: boolean
  event_log_count: number
  llm_log_count: number
  log_count: number
}

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    fetchStats()
    fetchProjects()
  }, [])

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

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true)
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/projects/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // Filter active projects, sort by log count (highest first) and take only the top 3
      const sortedProjects = response.data
        .filter((project: Project) => project.is_active)
        .sort((a: Project, b: Project) => b.log_count - a.log_count)
        .slice(0, 3)
      setProjects(sortedProjects)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setProjectsLoading(false)
    }
  }

  // const refreshStats = async () => {
  //   try {
  //     setLoading(true)
  //     const token = localStorage.getItem('access_token')
  //     const response = await axios.get(`${API_URL}/user/stats/`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     })
  //     setStats(response.data)
  //   } catch (error) {
  //     console.error('Failed to refresh stats:', error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const refreshAll = () => {
    fetchStats();
    fetchProjects();
  }

  const primaryColor = '#008374'
  const secondaryColor = '#66fdee'
  const primaryLight = alpha(primaryColor, 0.1)
  const primaryMedium = alpha(primaryColor, 0.2)
  // const secondaryLight = alpha(secondaryColor, 0.1)
  
  // Colors for status indicators
  const blueColor = '#0288d1'
  const yellowColor = '#ffc107'
  const redColor = '#f44336'
  const grayColor = '#757575'

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
              This is your logging dashboard. From here, you can manage your API keys, projects, and view your logs.
            </Typography>
          </Box>
          <Tooltip title="Refresh All Data">
            <IconButton 
              onClick={refreshAll} 
              disabled={loading || projectsLoading}
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
                        backgroundColor: primaryColor,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventNoteIcon sx={{ mr: 1, color: primaryColor }} />
                      <Typography variant="h5" component="h2" fontWeight="500">
                        Event Logs
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ my: 2, fontWeight: 'bold', color: primaryColor }}>
                      {stats?.total_event_logs || 0}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Tooltip title="Info logs">
                        <Chip label={`Info: ${stats?.logs_by_level.info || 0}`} size="small" sx={{ bgcolor: alpha(blueColor, 0.1), color: blueColor }} />
                      </Tooltip>
                      <Tooltip title="Warning logs">
                        <Chip label={`Warn: ${stats?.logs_by_level.warning || 0}`} size="small" sx={{ bgcolor: alpha(yellowColor, 0.1), color: yellowColor }} />
                      </Tooltip>
                      <Tooltip title="Error logs">
                        <Chip label={`Error: ${stats?.logs_by_level.error || 0}`} size="small" sx={{ bgcolor: alpha(redColor, 0.1), color: redColor }} />
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
                        backgroundColor: primaryColor,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SmartToyIcon sx={{ mr: 1, color: primaryColor }} />
                      <Typography variant="h5" component="h2" fontWeight="500">
                        LLM Logs
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ my: 2, fontWeight: 'bold', color: primaryColor }}>
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
                        backgroundColor: primaryColor,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MenuBookIcon sx={{ mr: 1, color: primaryColor }} />
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
                      View Documentation
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Project Section */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Box sx={{ mt: 6, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="600" sx={{ mb: 0 }}>
                Your Projects
              </Typography>
              <Button 
                component={RouterLink} 
                to="/projects"
                variant="outlined" 
                endIcon={<VisibilityIcon />}
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
                View All Projects
              </Button>
            </Box>
            
            {projectsLoading ? (
              <Box sx={{ my: 4 }}>
                <LinearProgress sx={{ height: 6, borderRadius: 3, bgcolor: alpha(primaryColor, 0.1), '& .MuiLinearProgress-bar': { bgcolor: primaryColor } }} />
              </Box>
            ) : projects.length === 0 ? (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: alpha('#f5f5f5', 0.5)
                }}
              >
                <FolderIcon sx={{ fontSize: 48, color: grayColor, opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No projects yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first project to organize your logs and keep track of your applications.
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/projects"
                  startIcon={<AddIcon />}
                  sx={{ 
                    bgcolor: primaryColor,
                    '&:hover': {
                      bgcolor: alpha(primaryColor, 0.8),
                    }
                  }}
                >
                  Create a Project
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {projects.map((project) => (
                  <Grid item xs={12} md={4} key={project.id}>
                    <motion.div variants={itemVariants}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          height: '100%',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: theme.shadows[4],
                            transform: 'translateY(-4px)',
                          },
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            backgroundColor: project.is_active ? primaryColor : grayColor,
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: alpha(primaryColor, 0.1), 
                                  color: primaryColor,
                                  width: 40,
                                  height: 40,
                                  mr: 1.5
                                }}
                              >
                                <FolderIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" noWrap sx={{ maxWidth: 150 }}>
                                  {project.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Created: {formatDate(project.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip 
                              label={project.is_active ? 'Active' : 'Inactive'} 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                bgcolor: project.is_active ? alpha(primaryColor, 0.1) : alpha(grayColor, 0.1), 
                                color: project.is_active ? primaryColor : grayColor 
                              }}
                            />
                          </Box>
                          
                          {project.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {project.description}
                            </Typography>
                          )}
                          
                          <Grid container spacing={1} sx={{ mt: 2 }}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Event Logs:
                              </Typography>
                              <Typography variant="h6" sx={{ color: blueColor }}>
                                {project.event_log_count}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                LLM Logs:
                              </Typography>
                              <Typography variant="h6" sx={{ color: blueColor }}>
                                {project.llm_log_count}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            component={RouterLink} 
                            to={`/projects/${project.id}/logs`}
                            startIcon={<VisibilityIcon />}
                            sx={{ 
                              ml: 'auto',
                              color: primaryColor,
                              '&:hover': {
                                bgcolor: alpha(primaryColor, 0.1),
                              }
                            }}
                          >
                            View Logs
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
                <Grid item xs={12} md={4}>
                  <motion.div variants={itemVariants}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 3,
                        bgcolor: alpha('#f5f5f5', 0.5),
                        border: '1px dashed',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: primaryColor,
                          bgcolor: alpha(primaryColor, 0.03)
                        }
                      }}
                      component={RouterLink}
                      to="/projects"
                      style={{ textDecoration: 'none' }}
                    >
                      <AddIcon sx={{ fontSize: 48, color: grayColor, mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" align="center">
                        Create New Project
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            )}
          </Box>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Box sx={{ mt: 6, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
              Available Features
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[5],
                      },
                      border: `1px solid ${alpha(primaryColor, 0.1)}`
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor, mr: 2 }}>
                          <StorageIcon />
                        </Avatar>
                        <Typography variant="h6" component="h3" fontWeight="500">
                          Log Management
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        View, filter, and search your application logs. Access both event logs and LLM interaction logs.
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label="Event Logs" 
                          size="small" 
                          sx={{ mr: 1, mb: 1, bgcolor: alpha(blueColor, 0.1), color: blueColor }} 
                        />
                        <Chip 
                          label="LLM Logs" 
                          size="small" 
                          sx={{ mr: 1, mb: 1, bgcolor: alpha(primaryColor, 0.1), color: primaryColor }} 
                        />
                        <Chip 
                          label="CSV Export" 
                          size="small" 
                          sx={{ mr: 1, mb: 1, bgcolor: alpha(primaryColor, 0.1), color: primaryColor }} 
                        />
                        <Chip 
                          label="Delete Logs" 
                          size="small" 
                          sx={{ mb: 1, bgcolor: alpha(redColor, 0.1), color: redColor }} 
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button 
                        size="small" 
                        component={RouterLink} 
                        to="/logs" 
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        sx={{ 
                          borderRadius: '8px',
                          color: primaryColor,
                          borderColor: primaryColor,
                          '&:hover': {
                            bgcolor: alpha(primaryColor, 0.1),
                            borderColor: primaryColor
                          }
                        }}
                      >
                        View Logs
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[5],
                      },
                      border: `1px solid ${alpha(primaryColor, 0.1)}`
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor, mr: 2 }}>
                          <FolderIcon />
                        </Avatar>
                        <Typography variant="h6" component="h3" fontWeight="500">
                          Project Organization
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Organize your logs by project to keep track of different applications or components. Filter and view logs specific to each project.
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label="Create Projects" 
                          size="small" 
                          sx={{ mr: 1, mb: 1, bgcolor: alpha(primaryColor, 0.1), color: primaryColor }} 
                        />
                        <Chip 
                          label="Project Logs" 
                          size="small" 
                          sx={{ mr: 1, mb: 1, bgcolor: alpha(blueColor, 0.1), color: blueColor }} 
                        />
                        <Chip 
                          label="Project Analytics" 
                          size="small" 
                          sx={{ mb: 1, bgcolor: alpha(secondaryColor, 0.2), color: primaryColor }} 
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button 
                        size="small" 
                        component={RouterLink} 
                        to="/projects" 
                        variant="outlined"
                        startIcon={<FolderIcon />}
                        sx={{ 
                          borderRadius: '8px',
                          color: primaryColor,
                          borderColor: primaryColor,
                          '&:hover': {
                            bgcolor: alpha(primaryColor, 0.1),
                            borderColor: primaryColor
                          }
                        }}
                      >
                        Manage Projects
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div variants={itemVariants}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[5],
                      },
                      border: `1px solid ${alpha(primaryColor, 0.1)}`
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor, mr: 2 }}>
                          <AssessmentIcon />
                        </Avatar>
                        <Typography variant="h6" component="h3" fontWeight="500">
                          Analytics & Insights
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Gain insights from your log data with analytics dashboards. View trends, distributions, and metrics about your application's behavior.
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label="Time Trends" 
                          size="small" 
                          sx={{ mr: 1, mb: 1, bgcolor: alpha(primaryColor, 0.1), color: primaryColor }} 
                        />
                        <Chip 
                          label="Log Levels" 
                          size="small" 
                          sx={{ mr: 1, mb: 1, bgcolor: alpha(redColor, 0.1), color: redColor }} 
                        />
                        <Chip 
                          label="LLM Sources" 
                          size="small" 
                          sx={{ mr: 1, mb: 1, bgcolor: alpha(secondaryColor, 0.2), color: primaryColor }} 
                        />
                        <Chip 
                          label="CSV Export" 
                          size="small" 
                          sx={{ mb: 1, bgcolor: alpha(primaryColor, 0.1), color: primaryColor }} 
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button 
                        size="small" 
                        component={RouterLink} 
                        to="/analytics" 
                        variant="outlined"
                        startIcon={<AssessmentIcon />}
                        sx={{ 
                          borderRadius: '8px',
                          color: primaryColor,
                          borderColor: primaryColor,
                          '&:hover': {
                            bgcolor: alpha(primaryColor, 0.1),
                            borderColor: primaryColor
                          }
                        }}
                      >
                        View Analytics
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

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
                        border: `1px solid ${alpha(primaryColor, 0.1)}`
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
                        border: `1px solid ${alpha(primaryColor, 0.1)}`
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
                            bgcolor: alpha(secondaryColor, 0.05),
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.8rem',
                            border: `1px solid ${alpha(primaryColor, 0.1)}`,
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
                        border: `1px solid ${alpha(primaryColor, 0.1)}`
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