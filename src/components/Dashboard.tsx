import { useContext } from 'react'
import { Link as RouterLink } from 'react-router-dom'
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
} from '@mui/material'
import AuthContext from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useContext(AuthContext)

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

        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={4}>
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
                Create and manage API keys to authenticate your logging requests.
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

          <Grid item xs={12} md={6} lg={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                Logs
              </Typography>
              <Typography variant="body1" paragraph>
                View and search through your application logs.
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                component={RouterLink}
                to="/logs"
                sx={{ alignSelf: 'flex-start', backgroundColor: '#008374' }}
              >
                View Logs
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4}>
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
    "query": "What is the weather today?",
    "response": "The weather is sunny with a high of 75°F.",
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