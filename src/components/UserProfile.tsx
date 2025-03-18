import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import AuthContext from '../context/AuthContext'

interface UsageStats {
  total_logs: number
  logs_by_level: {
    info: number
    warning: number
    error: number
    debug: number
  }
  api_keys_count: number
}

const UserProfile = () => {
  const { user, isAuthenticated } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [error, setError] = useState('')
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const API_URL = 'http://localhost:8000/api'

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setEmail(user.email)
      fetchUsageStats()
    }
  }, [user])

  const fetchUsageStats = async () => {
    try {
      setStatsLoading(true)
      const response = await axios.get(`${API_URL}/user/stats/`)
      setUsageStats(response.data)
      setStatsLoading(false)
    } catch (err) {
      console.error('Error fetching usage stats:', err)
      setStatsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUpdateSuccess(false)

    try {
      const response = await axios.put(`${API_URL}/user/profile/`, {
        username,
        email
      })
      
      setUpdateSuccess(true)
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    
    setLoading(true)
    setError('')
    setUpdateSuccess(false)

    try {
      await axios.put(`${API_URL}/user/profile/`, {
        current_password: currentPassword,
        new_password: newPassword
      })
      
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setUpdateSuccess(true)
    } catch (err: any) {
      console.error('Error updating password:', err)
      setError(err.response?.data?.detail || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Profile Information
              </Typography>
              
              {updateSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Profile updated successfully!
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleProfileUpdate}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ mt: 1 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
              
              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h5" component="h2" gutterBottom>
                Change Password
              </Typography>
              
              <form onSubmit={handlePasswordUpdate}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ mt: 1 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Change Password'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2">
                  Usage Statistics
                </Typography>
                <Tooltip title="Refresh statistics">
                  <IconButton 
                    onClick={fetchUsageStats} 
                    disabled={statsLoading}
                    size="small"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {statsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : usageStats ? (
                <>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        Total Logs
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {usageStats.total_logs}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        Logs by Level
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Info:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="right">
                            {usageStats.logs_by_level.info}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Warning:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="right">
                            {usageStats.logs_by_level.warning}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Error:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="right">
                            {usageStats.logs_by_level.error}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Debug:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="right">
                            {usageStats.logs_by_level.debug}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        API Keys
                      </Typography>
                      <Typography variant="h3" color="primary">
                        {usageStats.api_keys_count}
                      </Typography>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No usage statistics available.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default UserProfile 