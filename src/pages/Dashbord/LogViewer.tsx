import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link as RouterLink } from 'react-router-dom'
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
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import DownloadIcon from '@mui/icons-material/Download'
import BarChartIcon from '@mui/icons-material/BarChart'
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

const LogViewer = () => {
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
  
  // API and pagination config
  const LOGS_PER_PAGE = 10

  useEffect(() => {
    fetchLogs()
  }, [activeLogTab])

  // Apply filters and update pagination when search or level filter changes
  useEffect(() => {
    applyFiltersAndPaginate()
  }, [page, levelFilter, searchTerm, allEventLogs, allLlmLogs])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      console.log(loading)
      setError('')
      
      if (activeLogTab === 0) {
        // Fetch all event logs
        const response = await axios.get(`${API_URL}/event-logs/`)
        setAllEventLogs(response.data)
      } else {
        // Fetch all LLM logs
        const response = await axios.get(`${API_URL}/llm-logs/`)
        setAllLlmLogs(response.data)
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
      const response = await axios.get(`${API_URL}/event-logs/download/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `event_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
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
      const response = await axios.get(`${API_URL}/llm-logs/download/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `llm_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
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
      const response = await axios.get(`${API_URL}/download/all-logs/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `all_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading all logs:', error);
      setError('Failed to download logs. Please try again.');
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
        </Stack>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="15%">Timestamp</TableCell>
              <TableCell width="10%">Level</TableCell>
              <TableCell width="15%">User ID</TableCell>
              <TableCell width="45%">Message</TableCell>
              <TableCell width="15%">Details</TableCell>
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
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpand(log.id)}
                        aria-expanded={expandedRows[log.id]}
                        aria-label="show more"
                      >
                        {expandedRows[log.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
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
        </Stack>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="15%">Timestamp</TableCell>
              <TableCell width="15%">User ID</TableCell>
              <TableCell width="15%">Source</TableCell>
              <TableCell width="40%">Query/Response</TableCell>
              <TableCell width="15%">Details</TableCell>
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
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpand(log.id)}
                        aria-expanded={expandedRows[log.id]}
                        aria-label="show more"
                      >
                        {expandedRows[log.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
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

  return (
    <Container maxWidth="xl">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">Log Explorer</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<BarChartIcon />}
              component={RouterLink}
              to="/analytics"
            >
              View Analytics
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadAllLogs}
            >
              Download All
            </Button>
          </Stack>
        </Box>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Search logs"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
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
                sx={{ backgroundColor: '#008374', color: 'white', '&:hover': { backgroundColor: 'white', color: '#008374' } }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeLogTab} onChange={handleLogTabChange}>
            <Tab label="Event Logs" />
            <Tab label="LLM Logs" />
          </Tabs>
        </Box>

        <TabPanel value={activeLogTab} index={0}>
          {renderEventLogsTable()}
        </TabPanel>

        <TabPanel value={activeLogTab} index={1}>
          {renderLlmLogsTable()}
        </TabPanel>

        {(eventLogs.length > 0 || llmLogs.length > 0) && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default LogViewer 