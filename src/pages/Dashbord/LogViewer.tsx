import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link as RouterLink, useSearchParams, useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Button,
  Pagination,
  IconButton,
  Collapse,
  Tabs,
  Tab,
  Stack,
  Tooltip,
  Breadcrumbs,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import DownloadIcon from '@mui/icons-material/Download'
import BarChartIcon from '@mui/icons-material/BarChart'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { API_URL } from '../../api/endpoints'

// Common interface for shared properties
interface BaseLogMessage {
  id: number
  user_id: string
  timestamp: string
  metadata: Record<string, any>
}

// Event log message with message and level
interface EventLogMessage extends BaseLogMessage {
  message: string
  level: string
}

// LLM log message with source, query and response
interface LlmLogMessage extends BaseLogMessage {
  source: string
  query?: string
  response?: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  )
}

interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  is_active: boolean
}

const LogViewer = () => {
  // Get project ID from either route params or search params
  const { projectId: routeProjectId } = useParams<{ projectId: string }>()
  const [searchParams] = useSearchParams()
  const queryProjectId = searchParams.get('projectId')
  
  // Use route param if available, otherwise use query param
  const projectId = routeProjectId || queryProjectId
  
  // Theme and responsive hooks
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  // Project info if viewing project-specific logs
  const [project, setProject] = useState<Project | null>(null)
  
  // Log state for both types
  const [eventLogs, setEventLogs] = useState<EventLogMessage[]>([])
  const [llmLogs, setLlmLogs] = useState<LlmLogMessage[]>([])
  const [allEventLogs, setAllEventLogs] = useState<EventLogMessage[]>([])
  const [allLlmLogs, setAllLlmLogs] = useState<LlmLogMessage[]>([])
  
  // UI state
  const [activeLogTab, setActiveLogTab] = useState(0) // 0 for Event Logs, 1 for LLM Logs
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [tabValues, setTabValues] = useState<Record<number, number>>({})
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const [logToDelete, setLogToDelete] = useState<{id: number, type: 'event' | 'llm'} | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)
  
  // API and pagination config
  const LOGS_PER_PAGE = 10

  // Fetch project details if projectId is provided
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
    } else {
      setProject(null)
    }
  }, [projectId])

  useEffect(() => {
    fetchLogs()
  }, [activeLogTab, projectId])

  // Apply filters and update pagination when search or level filter changes
  useEffect(() => {
    applyFiltersAndPaginate()
  }, [page, levelFilter, searchTerm, allEventLogs, allLlmLogs])

  const fetchProjectDetails = async () => {
    try {
      if (!projectId) return
      
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/projects/${projectId}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setProject(response.data)
    } catch (err) {
      console.error('Error fetching project details:', err)
      setError('Failed to load project details.')
    }
  }

  const fetchLogs = async () => {
    try {
      setLoading(true)
      console.log(loading)
      setError('')
      
      const token = localStorage.getItem('access_token')
      const headers = {
        Authorization: `Bearer ${token}`
      }
      
      if (activeLogTab === 0) {
        // Fetch event logs
        let url = `${API_URL}/event-logs/`
        
        // Add project filter if projectId is provided
        if (projectId) {
          // Handle both REST-style filtering and query param filtering based on what backend supports
          const response = await axios.get(url, { 
            headers,
            params: { project: projectId }
          })
          setAllEventLogs(response.data)
        } else {
          const response = await axios.get(url, { headers })
          setAllEventLogs(response.data)
        }
      } else {
        // Fetch LLM logs
        let url = `${API_URL}/llm-logs/`
        
        // Add project filter if projectId is provided
        if (projectId) {
          // Handle both REST-style filtering and query param filtering based on what backend supports
          const response = await axios.get(url, { 
            headers,
            params: { project: projectId }
          })
          setAllLlmLogs(response.data)
        } else {
          const response = await axios.get(url, { headers })
          setAllLlmLogs(response.data)
        }
      }
    } catch (err) {
      console.error('Error fetching logs:', err)
      setError('Failed to load logs. Please try again.')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndPaginate = () => {
    if (activeLogTab === 0 && allEventLogs.length > 0) {
      // Filter event logs by level and search term
      let filteredLogs = [...allEventLogs]
      
      // Apply level filter if not 'all'
      if (levelFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.level === levelFilter)
      }
      
      // Apply search filter if there's a search term
      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.user_id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      // Update pagination
      const totalItems = filteredLogs.length
      setTotalPages(Math.ceil(totalItems / LOGS_PER_PAGE))
      
      // Get current page's logs
      const paginatedLogs = filteredLogs.slice(
        (page - 1) * LOGS_PER_PAGE,
        page * LOGS_PER_PAGE
      )
      
      setEventLogs(paginatedLogs)
      
    } else if (activeLogTab === 1 && allLlmLogs.length > 0) {
      // Filter LLM logs by search term
      let filteredLogs = [...allLlmLogs]
      
      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
          (log.query && log.query.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (log.response && log.response.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (log.source && log.source.toLowerCase().includes(searchTerm.toLowerCase())) ||
          log.user_id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      // Update pagination
      const totalItems = filteredLogs.length
      setTotalPages(Math.ceil(totalItems / LOGS_PER_PAGE))
      
      // Get current page's logs
      const paginatedLogs = filteredLogs.slice(
        (page - 1) * LOGS_PER_PAGE,
        page * LOGS_PER_PAGE
      )
      
      setLlmLogs(paginatedLogs)
    }
  }

  const handleSearch = () => {
    setPage(1) // Reset to first page when searching
  }

  const handleRefresh = () => {
    fetchLogs()
  }

  const handleLevelFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevelFilter(event.target.value)
    setPage(1) // Reset to first page when changing filters
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const handleLogTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveLogTab(newValue)
    setPage(1) // Reset to page 1 when switching log types
    setSearchTerm('') // Clear search when switching log types
    setLevelFilter('all') // Reset level filter when switching log types
  }

  const toggleRowExpand = (id: number) => {
    setExpandedRows({
      ...expandedRows,
      [id]: !expandedRows[id],
    })
    
    // Initialize tab value if not already set
    if (!tabValues[id] && expandedRows[id] === undefined) {
      setTabValues({
        ...tabValues,
        [id]: 0,
      })
    }
  }

  const handleTabChange = (id: number, newValue: number) => {
    setTabValues({
      ...tabValues,
      [id]: newValue,
    })
  }

  const getLevelChipColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      case 'debug':
        return 'default'
      default:
        return 'default'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const formatMetadata = (metadata: Record<string, any>) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return 'No metadata'
    }
    
    return JSON.stringify(metadata, null, 2)
  }

  const handleDownloadEventLogs = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('access_token');
      
      // Make an authenticated request to the download endpoint
      let apiUrl = `${API_URL}/event-logs/download/`;
      const params = projectId ? { project: projectId } : {};
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params,
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link and trigger the download
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `event_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading event logs:', error);
      setError('Failed to download event logs. Please try again.');
    }
  }

  const handleDownloadLlmLogs = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('access_token');
      
      // Make an authenticated request to the download endpoint
      let apiUrl = `${API_URL}/llm-logs/download/`;
      const params = projectId ? { project: projectId } : {};
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params,
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link and trigger the download
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `llm_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading LLM logs:', error);
      setError('Failed to download LLM logs. Please try again.');
    }
  }

  const handleDownloadAllLogs = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('access_token');
      
      // Make an authenticated request to the download endpoint
      let apiUrl = `${API_URL}/download/all-logs/`;
      const params = projectId ? { project: projectId } : {};
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params,
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link and trigger the download
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `all_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading all logs:', error);
      setError('Failed to download logs. Please try again.');
    }
  }

  // Handler for opening delete confirmation dialog
  const handleOpenDeleteDialog = (id: number, type: 'event' | 'llm') => {
    setLogToDelete({ id, type })
    setDeleteDialogOpen(true)
  }

  // Handler for closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    // Reset after a short delay to allow dialog to close
    setTimeout(() => {
      setLogToDelete(null)
      setDeleteSuccess(null)
    }, 300)
  }

  // Handler for opening delete all confirmation dialog
  const handleOpenDeleteAllDialog = () => {
    setDeleteAllDialogOpen(true)
  }

  // Handler for closing delete all confirmation dialog
  const handleCloseDeleteAllDialog = () => {
    setDeleteAllDialogOpen(false)
    // Reset after a short delay to allow dialog to close
    setTimeout(() => {
      setDeleteSuccess(null)
    }, 300)
  }

  // Handler for deleting a single log
  const handleDeleteLog = async () => {
    if (!logToDelete) return

    try {
      setDeleteLoading(true)
      setError('')
      
      const token = localStorage.getItem('access_token')
      const headers = {
        Authorization: `Bearer ${token}`
      }
      
      const apiUrl = logToDelete.type === 'event' 
        ? `${API_URL}/event-logs/${logToDelete.id}/`
        : `${API_URL}/llm-logs/${logToDelete.id}/`
        
      await axios.delete(apiUrl, { headers })
      
      // Remove the deleted log from state
      if (logToDelete.type === 'event') {
        setAllEventLogs(prevLogs => prevLogs.filter(log => log.id !== logToDelete.id))
        setEventLogs(prevLogs => prevLogs.filter(log => log.id !== logToDelete.id))
      } else {
        setAllLlmLogs(prevLogs => prevLogs.filter(log => log.id !== logToDelete.id))
        setLlmLogs(prevLogs => prevLogs.filter(log => log.id !== logToDelete.id))
      }
      
      setDeleteSuccess('Log deleted successfully')
      
      // Close dialog after a short delay
      setTimeout(() => {
        handleCloseDeleteDialog()
      }, 1000)
      
    } catch (err) {
      console.error('Error deleting log:', err)
      setError('Failed to delete log. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Handler for deleting all logs
  const handleDeleteAllLogs = async () => {
    try {
      setDeleteLoading(true)
      setError('')
      
      const token = localStorage.getItem('access_token')
      const headers = {
        Authorization: `Bearer ${token}`
      }
      
      // Add project parameter if viewing project-specific logs
      const params = projectId ? { project: projectId } : {}
      
      await axios.delete(`${API_URL}/delete/all-logs/`, { 
        headers,
        params
      })
      
      // Clear logs from state
      if (activeLogTab === 0) {
        setAllEventLogs([])
        setEventLogs([])
      } else {
        setAllLlmLogs([])
        setLlmLogs([])
      }
      
      setDeleteSuccess(projectId 
        ? `All logs for this project have been deleted` 
        : 'All logs have been deleted')
      
      // Close dialog after a short delay
      setTimeout(() => {
        handleCloseDeleteAllDialog()
      }, 1000)
      
    } catch (err) {
      console.error('Error deleting all logs:', err)
      setError('Failed to delete logs. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Render event logs table
  const renderEventLogsTable = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Event Logs</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Download event logs as CSV">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadEventLogs}
              size="small"
            >
              Download Event Logs
            </Button>
          </Tooltip>
          <Tooltip title="Delete all event logs">
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenDeleteAllDialog}
              size="small"
              disabled={eventLogs.length === 0}
            >
              Delete All
            </Button>
          </Tooltip>
        </Stack>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="15%">Timestamp</TableCell>
              <TableCell width="10%">Level</TableCell>
              <TableCell width="15%">User ID</TableCell>
              <TableCell width="40%">Message</TableCell>
              <TableCell width="20%">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {eventLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              eventLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow>
                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={log.level} 
                        color={getLevelChipColor(log.level) as any} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    <TableCell>
                      {log.message.length > 100 
                        ? `${log.message.substring(0, 100)}...` 
                        : log.message}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpand(log.id)}
                          aria-expanded={expandedRows[log.id]}
                          aria-label="show more"
                        >
                          {expandedRows[log.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <Tooltip title="Delete log">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(log.id, 'event')}
                            aria-label="delete log"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                      <Collapse in={expandedRows[log.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Tabs 
                            value={tabValues[log.id] || 0} 
                            onChange={(_e, val) => handleTabChange(log.id, val)}
                          >
                            <Tab label="Message" />
                            <Tab label="Metadata" />
                          </Tabs>
                          
                          <TabPanel value={tabValues[log.id] || 0} index={0}>
                            <Typography variant="subtitle2" gutterBottom component="div">
                              Full Message:
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap' }}
                            >
                              {log.message}
                            </Paper>
                          </TabPanel>
                          
                          <TabPanel value={tabValues[log.id] || 0} index={1}>
                            <Typography variant="subtitle2" gutterBottom component="div">
                              Metadata:
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap' }}
                            >
                              <pre>{formatMetadata(log.metadata)}</pre>
                            </Paper>
                          </TabPanel>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  // Render LLM logs table
  const renderLlmLogsTable = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">LLM Logs</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Download LLM logs as CSV">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadLlmLogs}
              size="small"
            >
              Download LLM Logs
            </Button>
          </Tooltip>
          <Tooltip title="Delete all LLM logs">
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenDeleteAllDialog}
              size="small"
              disabled={llmLogs.length === 0}
            >
              Delete All
            </Button>
          </Tooltip>
        </Stack>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="15%">Timestamp</TableCell>
              <TableCell width="15%">User ID</TableCell>
              <TableCell width="15%">Source</TableCell>
              <TableCell width="35%">Query/Response</TableCell>
              <TableCell width="20%">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {llmLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No LLM logs found
                </TableCell>
              </TableRow>
            ) : (
              llmLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow>
                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    <TableCell>{log.source}</TableCell>
                    <TableCell>
                      {log.query && log.query.length > 80 
                        ? `${log.query.substring(0, 80)}...` 
                        : log.query || 'No query'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpand(log.id)}
                          aria-expanded={expandedRows[log.id]}
                          aria-label="show more"
                        >
                          {expandedRows[log.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <Tooltip title="Delete log">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(log.id, 'llm')}
                            aria-label="delete log"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                      <Collapse in={expandedRows[log.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Tabs 
                            value={tabValues[log.id] || 0} 
                            onChange={(_e, val) => handleTabChange(log.id, val)}
                          >
                            <Tab label="Query" />
                            <Tab label="Response" />
                            <Tab label="Metadata" />
                          </Tabs>
                          
                          <TabPanel value={tabValues[log.id] || 0} index={0}>
                            <Typography variant="subtitle2" gutterBottom component="div">
                              Full Query:
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap' }}
                            >
                              {log.query || 'No query provided'}
                            </Paper>
                          </TabPanel>
                          
                          <TabPanel value={tabValues[log.id] || 0} index={1}>
                            <Typography variant="subtitle2" gutterBottom component="div">
                              Full Response:
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap' }}
                            >
                              {log.response || 'No response provided'}
                            </Paper>
                          </TabPanel>
                          
                          <TabPanel value={tabValues[log.id] || 0} index={2}>
                            <Typography variant="subtitle2" gutterBottom component="div">
                              Metadata:
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap' }}
                            >
                              <pre>{formatMetadata(log.metadata)}</pre>
                            </Paper>
                          </TabPanel>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )

  // Mobile card view for event logs
  const renderEventLogCards = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
        <Typography variant="h6" sx={{ mb: { xs: 1, sm: 0 } }}>Event Logs</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: { xs: 1, sm: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadEventLogs}
            size="small"
            sx={{ minWidth: 40, height: 36 }}
          >
            {isMobile ? "" : "Download"}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteAllDialog}
            size="small"
            disabled={eventLogs.length === 0}
            sx={{ minWidth: 40, height: 36 }}
          >
            {isMobile ? "" : "Delete All"}
          </Button>
        </Stack>
      </Box>
      
      {eventLogs.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No logs found</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {eventLogs.map((log) => (
            <Card key={log.id} variant="outlined">
              <CardContent sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip 
                    label={log.level} 
                    color={getLevelChipColor(log.level) as any} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(log.timestamp)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {log.message.length > 150 
                    ? `${log.message.substring(0, 150)}...` 
                    : log.message}
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    User: {log.user_id}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ pt: 0, justifyContent: 'flex-end' }}>
                <IconButton
                  size="small"
                  onClick={() => toggleRowExpand(log.id)}
                  aria-expanded={expandedRows[log.id]}
                  aria-label="show more"
                  sx={{ p: 1 }}
                >
                  {expandedRows[log.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleOpenDeleteDialog(log.id, 'event')}
                  aria-label="delete log"
                  sx={{ p: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
              <Collapse in={expandedRows[log.id]} timeout="auto" unmountOnExit>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Tabs 
                    value={tabValues[log.id] || 0} 
                    onChange={(_e, val) => handleTabChange(log.id, val)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Message" />
                    <Tab label="Metadata" />
                  </Tabs>
                  
                  <TabPanel value={tabValues[log.id] || 0} index={0}>
                    <Typography variant="subtitle2" gutterBottom component="div">
                      Full Message:
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap' }}
                    >
                      {log.message}
                    </Paper>
                  </TabPanel>
                  
                  <TabPanel value={tabValues[log.id] || 0} index={1}>
                    <Typography variant="subtitle2" gutterBottom component="div">
                      Metadata:
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap', overflowX: 'auto' }}
                    >
                      <pre style={{ margin: 0 }}>{formatMetadata(log.metadata)}</pre>
                    </Paper>
                  </TabPanel>
                </Box>
              </Collapse>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )

  // Mobile card view for LLM logs
  const renderLlmLogCards = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
        <Typography variant="h6" sx={{ mb: { xs: 1, sm: 0 } }}>LLM Logs</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: { xs: 1, sm: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadLlmLogs}
            size="small"
            sx={{ minWidth: 40, height: 36 }}
          >
            {isMobile ? "" : "Download"}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleOpenDeleteAllDialog}
            size="small"
            disabled={llmLogs.length === 0}
            sx={{ minWidth: 40, height: 36 }}
          >
            {isMobile ? "" : "Delete All"}
          </Button>
        </Stack>
      </Box>
      
      {llmLogs.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No LLM logs found</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {llmLogs.map((log) => (
            <Card key={log.id} variant="outlined">
              <CardContent sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip label={log.source} size="small" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(log.timestamp)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {log.query && log.query.length > 150 
                    ? `${log.query.substring(0, 150)}...` 
                    : log.query || 'No query'}
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    User: {log.user_id}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ pt: 0, justifyContent: 'flex-end' }}>
                <IconButton
                  size="small"
                  onClick={() => toggleRowExpand(log.id)}
                  aria-expanded={expandedRows[log.id]}
                  aria-label="show more"
                  sx={{ p: 1 }}
                >
                  {expandedRows[log.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleOpenDeleteDialog(log.id, 'llm')}
                  aria-label="delete log"
                  sx={{ p: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
              <Collapse in={expandedRows[log.id]} timeout="auto" unmountOnExit>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Tabs 
                    value={tabValues[log.id] || 0} 
                    onChange={(_e, val) => handleTabChange(log.id, val)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Query" />
                    <Tab label="Response" />
                    <Tab label="Metadata" />
                  </Tabs>
                  
                  <TabPanel value={tabValues[log.id] || 0} index={0}>
                    <Typography variant="subtitle2" gutterBottom component="div">
                      Full Query:
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap' }}
                    >
                      {log.query || 'No query provided'}
                    </Paper>
                  </TabPanel>
                  
                  <TabPanel value={tabValues[log.id] || 0} index={1}>
                    <Typography variant="subtitle2" gutterBottom component="div">
                      Full Response:
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap', overflowX: 'auto' }}
                    >
                      {log.response || 'No response provided'}
                    </Paper>
                  </TabPanel>
                  
                  <TabPanel value={tabValues[log.id] || 0} index={2}>
                    <Typography variant="subtitle2" gutterBottom component="div">
                      Metadata:
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: 'background.default', whiteSpace: 'pre-wrap', overflowX: 'auto' }}
                    >
                      <pre style={{ margin: 0 }}>{formatMetadata(log.metadata)}</pre>
                    </Paper>
                  </TabPanel>
                </Box>
              </Collapse>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 3,
          gap: 2
        }}>
          <Box>
            {projectId && project ? (
              <>
                <Breadcrumbs 
                  separator="›" 
                  aria-label="breadcrumb" 
                  sx={{ 
                    mb: 1,
                    '& .MuiBreadcrumbs-ol': {
                      flexWrap: { xs: 'wrap', sm: 'nowrap' }
                    }
                  }}
                >
                  <Link component={RouterLink} to="/logs" color="inherit">
                    All Logs
                  </Link>
                  <Typography color="text.primary" noWrap sx={{ maxWidth: { xs: '150px', sm: '300px' } }}>
                    {project.name}
                  </Typography>
                </Breadcrumbs>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1
                }}>
                  <Typography variant="h5" component="h1" noWrap sx={{ 
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    maxWidth: { xs: '260px', sm: '500px' }
                  }}>
                    Logs for Project: {project.name}
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    component={RouterLink}
                    to="/logs"
                    startIcon={<ArrowBackIcon />}
                    size={isMobile ? "small" : "medium"}
                    sx={{ ml: { sm: 2 } }}
                  >
                    Back to All Logs
                  </Button>
                </Box>
                {project.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {project.description}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="h5" component="h1" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Log Explorer
              </Typography>
            )}
          </Box>
          <Stack 
            direction={{ xs: 'row', sm: 'row' }} 
            spacing={1}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'space-between', sm: 'flex-end' }
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<BarChartIcon />}
              component={RouterLink}
              to={projectId ? `/analytics?project_id=${projectId}` : "/analytics"}
              size={isMobile ? "small" : "medium"}
              sx={{ minWidth: isMobile ? 40 : 'auto' }}
            >
              {isMobile ? "" : "Analytics"}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size={isMobile ? "small" : "medium"}
              sx={{ minWidth: isMobile ? 40 : 'auto' }}
            >
              {isMobile ? "" : "Refresh"}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadAllLogs}
              size={isMobile ? "small" : "medium"}
              sx={{ minWidth: isMobile ? 40 : 'auto' }}
            >
              {isMobile ? "" : "Download All"}
            </Button>
          </Stack>
        </Box>

        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Search logs"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch} size={isMobile ? "small" : "medium"}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            {activeLogTab === 0 && (
              <Grid item xs={12} md={5}>
                <TextField
                  select
                  fullWidth
                  label="Filter by level"
                  value={levelFilter}
                  onChange={handleLevelFilterChange}
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="debug">Debug</MenuItem>
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} md={activeLogTab === 0 ? 2 : 7}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{ 
                  backgroundColor: '#008374', 
                  color: 'white', 
                  '&:hover': { 
                    backgroundColor: 'white', 
                    color: '#008374' 
                  },
                  height: { xs: 40, md: 'auto' }
                }}
                size={isMobile ? "small" : "medium"}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeLogTab} 
            onChange={handleLogTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab label="Event Logs" />
            <Tab label="LLM Logs" />
          </Tabs>
        </Box>

        <TabPanel value={activeLogTab} index={0}>
          {isMobile ? renderEventLogCards() : renderEventLogsTable()}
        </TabPanel>

        <TabPanel value={activeLogTab} index={1}>
          {isMobile ? renderLlmLogCards() : renderLlmLogsTable()}
        </TabPanel>

        {(eventLogs.length > 0 || llmLogs.length > 0) && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "medium" : "large"}
              siblingCount={isMobile ? 0 : 1}
            />
          </Box>
        )}

        {/* Delete Single Log Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-log-dialog-title"
        >
          <DialogTitle id="delete-log-dialog-title">
            {deleteSuccess ? 'Success' : 'Delete Log'}
          </DialogTitle>
          <DialogContent>
            {deleteSuccess ? (
              <DialogContentText color="success.main">
                {deleteSuccess}
              </DialogContentText>
            ) : (
              <DialogContentText>
                Are you sure you want to delete this log? This action cannot be undone.
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            {!deleteSuccess && (
              <>
                <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteLog} 
                  color="error" 
                  disabled={deleteLoading}
                  startIcon={deleteLoading ? <RefreshIcon /> : <DeleteIcon />}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
            {deleteSuccess && (
              <Button onClick={handleCloseDeleteDialog} autoFocus>
                Close
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Delete All Logs Dialog */}
        <Dialog
          open={deleteAllDialogOpen}
          onClose={handleCloseDeleteAllDialog}
          aria-labelledby="delete-all-logs-dialog-title"
        >
          <DialogTitle id="delete-all-logs-dialog-title">
            {deleteSuccess ? 'Success' : 'Delete All Logs'}
          </DialogTitle>
          <DialogContent>
            {deleteSuccess ? (
              <DialogContentText color="success.main">
                {deleteSuccess}
              </DialogContentText>
            ) : (
              <DialogContentText>
                {projectId ? (
                  <>Are you sure you want to delete all logs from this project? This action cannot be undone.</>
                ) : (
                  <>Are you sure you want to delete all {activeLogTab === 0 ? 'event' : 'LLM'} logs? This action cannot be undone.</>
                )}
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            {!deleteSuccess && (
              <>
                <Button onClick={handleCloseDeleteAllDialog} disabled={deleteLoading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteAllLogs} 
                  color="error" 
                  disabled={deleteLoading}
                  startIcon={deleteLoading ? <RefreshIcon /> : <DeleteIcon />}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete All'}
                </Button>
              </>
            )}
            {deleteSuccess && (
              <Button onClick={handleCloseDeleteAllDialog} autoFocus>
                Close
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  )
}

export default LogViewer 