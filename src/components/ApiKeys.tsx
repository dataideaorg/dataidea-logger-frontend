import { useState, useEffect } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AddIcon from '@mui/icons-material/Add'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface ApiKey {
  id: number
  key: string
  name: string
  created_at: string
  is_active: boolean
}

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null)
  const [openToggleDialog, setOpenToggleDialog] = useState(false)
  const [keyToToggle, setKeyToToggle] = useState<ApiKey | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  })

  const API_URL = 'https://loggerapi.dataidea.org/api'

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api-keys/`)
      const activeKeys = response.data.filter((key: ApiKey) => key.is_active)
      setApiKeys(activeKeys)
      setError('')
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setError('Failed to load API keys. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a name for the API key',
        severity: 'error',
      })
      return
    }

    try {
      const response = await axios.post(`${API_URL}/api-keys/`, {
        name: newKeyName,
      })
      setApiKeys([...apiKeys, response.data])
      setOpenDialog(false)
      setNewKeyName('')
      setSnackbar({
        open: true,
        message: 'API key created successfully',
        severity: 'success',
      })
    } catch (err) {
      console.error('Error creating API key:', err)
      setSnackbar({
        open: true,
        message: 'Failed to create API key',
        severity: 'error',
      })
    }
  }

  const handleDeleteKey = async () => {
    if (!keyToDelete) return

    try {
      await axios.delete(`${API_URL}/api-keys/${keyToDelete.id}/`)
      setApiKeys(apiKeys.filter((key) => key.id !== keyToDelete.id))
      setOpenDeleteDialog(false)
      setKeyToDelete(null)
      setSnackbar({
        open: true,
        message: 'API key deleted successfully',
        severity: 'success',
      })
    } catch (err) {
      console.error('Error deleting API key:', err)
      setSnackbar({
        open: true,
        message: 'Failed to delete API key',
        severity: 'error',
      })
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setSnackbar({
      open: true,
      message: 'API key copied to clipboard',
      severity: 'success',
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleToggleKeyStatus = async () => {
    if (!keyToToggle) return

    try {
      const newStatus = !keyToToggle.is_active
      const response = await axios.patch(`${API_URL}/api-keys/${keyToToggle.id}/`, {
        is_active: newStatus
      })
      setApiKeys(apiKeys.map((key) =>
        key.id === keyToToggle.id ? response.data : key
      ))
      setOpenToggleDialog(false)
      setKeyToToggle(null)
      setSnackbar({
        open: true,
        message: `API key ${newStatus ? 'activated' : 'deactivated'} successfully`,
        severity: 'success',
      })
    } catch (err) {
      console.error('Error toggling API key status:', err)
      setSnackbar({
        open: true,
        message: `Failed to ${keyToToggle.is_active ? 'deactivate' : 'activate'} API key`,
        severity: 'error',
      })
    }
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            API Keys
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ backgroundColor: '#008374' }}
            onClick={() => setOpenDialog(true)}
          >
            Create New Key
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : apiKeys.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                You don't have any API keys yet. Create one to get started.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Key</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {key.key}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyKey(key.key)}
                            sx={{ ml: 1 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(key.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={key.is_active ? 'Active' : 'Inactive'}
                          color={key.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={key.is_active ? "Deactivate Key" : "Activate Key"}>
                          <span>
                            <IconButton
                              color={key.is_active ? "error" : "success"}
                              onClick={() => {
                                setKeyToToggle(key);
                                setOpenToggleDialog(true);
                              }}
                            >
                              {key.is_active ? <BlockIcon /> : <CheckCircleIcon />}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Create API Key Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter a name for your new API key. This will help you identify it later.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="API Key Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateKey} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Toggle API Key Status Dialog */}
        <Dialog open={openToggleDialog} onClose={() => setOpenToggleDialog(false)}>
          <DialogTitle>
            {keyToToggle?.is_active ? 'Deactivate' : 'Activate'} API Key
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {keyToToggle?.is_active ? 
                `Are you sure you want to deactivate the API key "${keyToToggle?.name}"? The key will no longer be usable for new log entries, but all existing logs will be preserved.` :
                `Are you sure you want to activate the API key "${keyToToggle?.name}"? The key will be usable again for new log entries.`
              }
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenToggleDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleToggleKeyStatus} 
              color={keyToToggle?.is_active ? "error" : "success"} 
              variant="contained"
            >
              {keyToToggle?.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete API Key Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Delete API Key</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the API key "{keyToDelete?.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteKey} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  )
}

export default ApiKeys