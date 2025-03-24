import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { API_URL } from '../../api/endpoints'
import { motion } from 'framer-motion'

interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  is_active: boolean
  log_count?: number
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const theme = useTheme()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/projects/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    setEditMode(false)
    setProjectName('')
    setProjectDescription('')
    setOpenDialog(true)
  }

  const handleEditProject = (project: Project) => {
    setEditMode(true)
    setCurrentProject(project)
    setProjectName(project.name)
    setProjectDescription(project.description || '')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      if (editMode && currentProject) {
        // Update existing project
        await axios.patch(
          `${API_URL}/projects/${currentProject.id}/`,
          {
            name: projectName,
            description: projectDescription || null
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      } else {
        // Create new project
        await axios.post(
          `${API_URL}/projects/`,
          {
            name: projectName,
            description: projectDescription || null
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      }
      fetchProjects()
      setOpenDialog(false)
    } catch (error) {
      console.error('Error saving project:', error)
      setError('Failed to save project. Please try again.')
    }
  }

  const handleToggleActive = async (project: Project) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.patch(
        `${API_URL}/projects/${project.id}/`,
        {
          is_active: !project.is_active
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      fetchProjects()
    } catch (error) {
      console.error('Error toggling project status:', error)
      setError('Failed to update project status. Please try again.')
    }
  }

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="500">
          Projects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
          sx={{ borderRadius: 8 }}
        >
          New Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {projects.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No projects found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Create your first project to start organizing your logs.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                sx={{ mt: 2 }}
              >
                Create Project
              </Button>
            </Paper>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {projects.map((project) => (
                  <Grid item xs={12} md={6} lg={4} key={project.id}>
                    <motion.div variants={itemVariants}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          borderColor: project.is_active ? 'transparent' : alpha('#000', 0.1),
                          opacity: project.is_active ? 1 : 0.7,
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            backgroundColor: project.is_active ? theme.palette.primary.main : '#ccc',
                          }
                        }}
                        variant="outlined"
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h5" component="h2" gutterBottom>
                              {project.name}
                            </Typography>
                            <Chip 
                              label={project.is_active ? "Active" : "Inactive"} 
                              color={project.is_active ? "success" : "default"}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {project.description || 'No description'}
                          </Typography>
                          {project.log_count !== undefined && (
                            <Typography variant="body2" color="text.secondary">
                              {project.log_count} logs
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Created: {new Date(project.created_at).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                          <Tooltip title="Edit project">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditProject(project)}
                              aria-label="edit"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={project.is_active ? "Deactivate project" : "Activate project"}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleToggleActive(project)}
                              aria-label={project.is_active ? "deactivate" : "activate"}
                              color={project.is_active ? "default" : "success"}
                            >
                              {project.is_active ? <DeleteIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {editMode
              ? 'Update the project details below.'
              : 'Enter a name and optional description for your new project.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!projectName.trim()}>
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Projects 