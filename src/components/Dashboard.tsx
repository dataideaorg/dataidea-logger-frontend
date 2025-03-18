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
  Divider,
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

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        const response = await axios.get('http://localhost:8000/api/user/stats/', {
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

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is your logging dashboard. From here, you can manage your API keys and view your logs.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={3}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom>
                  API Keys
                </Typography>
                <Typography variant="body1" paragraph>
                  You have {stats?.api_keys_count || 0} API keys.
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/api-keys"
                  sx={{ alignSelf: 'flex-start', backgroundColor: '#008374' }}
                >
                  Manage API Keys
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom>
                  Event Logs
                </Typography>
                <Typography variant="body1" paragraph>
                  You have {stats?.total_event_logs || 0} event logs.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Info: {stats?.logs_by_level.info || 0} | 
                  Warning: {stats?.logs_by_level.warning || 0} | 
                  Error: {stats?.logs_by_level.error || 0}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/logs"
                  sx={{ alignSelf: 'flex-start', backgroundColor: '#008374' }}
                >
                  View Event Logs
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom>
                  LLM Logs
                </Typography>
                <Typography variant="body1" paragraph>
                  You have {stats?.total_llm_logs || 0} LLM interaction logs.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track your AI model interactions and responses.
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/logs"
                  sx={{ alignSelf: 'flex-start', backgroundColor: '#008374' }}
                >
                  View LLM Logs
                </Button>
              </Paper>
            </Grid>
          
            <Grid item xs={12} md={6} lg={3}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom>
                  Documentation
                </Typography>
                <Typography variant="body1" paragraph>
                  Read our developer guides and API documentation.
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  component="a"
                  href="https://github.com/yourorg/dataidea-logger"
                  target="_blank"
                  sx={{ alignSelf: 'flex-start', backgroundColor: '#008374' }}
                >
                  View Documentation
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Quick Start Guide
          </Typography>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                1. Create an API Key
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Go to the API Keys section and create a new key. Give it a descriptive name so you can identify it later.
              </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" component={RouterLink} to="/api-keys" sx={{ backgroundColor: '#008374', color: 'white', '&:hover': { backgroundColor: 'white', color: '#008374' } }}>
                Create API Key
              </Button>
            </CardActions>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                2. Send Logs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use your API key to send logs to our service. Here's an example using curl:
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  mt: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                }}
              >
                {`curl -X POST http://localhost:8000/api/log/ \\
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

          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                3. View Your Logs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Go to the Logs section to view, filter, and search through your logs.
              </Typography>
            </CardContent>
            <CardActions>
                  <Button size="small" component={RouterLink} to="/logs" sx={{ backgroundColor: '#008374', color: 'white', '&:hover': { backgroundColor: 'white', color: '#008374' } }}>
                View Logs
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>
    </Container>
  )
}

export default Dashboard 