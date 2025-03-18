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
} from '@mui/material'
import AuthContext from '../context/AuthContext'

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

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const API_URL = 'http://loggerapi.dataidea.org/api';
  const AUTH_URL = `${API_URL}/auth`;

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
    
    fetchUsageStats();
  }, [user]);

  const fetchUsageStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/user/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const data: any = {
        username,
        email,
      };

      if (newPassword) {
        if (!currentPassword) {
          setError('Current password is required to set a new password');
          setLoading(false);
          return;
        }
        data.current_password = currentPassword;
        data.new_password = newPassword;
      }

      await axios.put(`${AUTH_URL}/user/profile/`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccess('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.response?.data) {
        // Handle different error formats
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          // Handle field-specific errors
          const fieldErrors = [];
          for (const field in err.response.data) {
            if (Array.isArray(err.response.data[field])) {
              fieldErrors.push(`${field}: ${err.response.data[field].join(' ')}`);
            } else if (typeof err.response.data[field] === 'string') {
              fieldErrors.push(`${field}: ${err.response.data[field]}`);
            }
          }
          setError(fieldErrors.join(', ') || 'Profile update failed');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>

        <Grid container spacing={4}>
          {/* User Stats */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Account Summary
              </Typography>
              
              {statsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : stats ? (
                <Box>
                  <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                    <strong>Username:</strong> {user?.username}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Email:</strong> {user?.email}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
                    Logging Statistics
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                          <Typography variant="h5" align="center">
                            {stats.total_event_logs}
                          </Typography>
                          <Typography variant="body2" align="center">
                            Event Logs
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent>
                          <Typography variant="h5" align="center">
                            {stats.total_llm_logs}
                          </Typography>
                          <Typography variant="body2" align="center">
                            LLM Logs
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="body2" sx={{ mt: 3 }}>
                    <strong>API Keys:</strong> {stats.api_keys_count}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Log Levels:</strong>
                  </Typography>
                  <Typography variant="body2">
                    Info: {stats.logs_by_level.info} | 
                    Warning: {stats.logs_by_level.warning} | 
                    Error: {stats.logs_by_level.error} | 
                    Debug: {stats.logs_by_level.debug}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Failed to load usage statistics.
                </Typography>
              )}
              
              <Button 
                variant="outlined" 
                onClick={fetchUsageStats} 
                sx={{ mt: 3 }}
              >
                Refresh Stats
              </Button>
            </Paper>
          </Grid>
          
          {/* Profile Settings */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Account Settings
              </Typography>
              
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

              <Box component="form" onSubmit={handleProfileUpdate}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 2 }}>
                      Change Password (Optional)
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      helperText="Required only if changing password"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ mt: 2, backgroundColor: '#008374', '&:hover': { backgroundColor: '#00695f' } }}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UserProfile; 