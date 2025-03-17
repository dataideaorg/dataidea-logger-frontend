import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
  Alert,
  CircularProgress,
  Pagination,
  IconButton,
  Collapse,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

interface LogMessage {
  id: number
  message: string
  query?: string
  response?: string
  level: string
  timestamp: string
  metadata: Record<string, any>
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
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [tabValues, setTabValues] = useState<Record<number, number>>({})
  
  const API_URL = 'http://localhost:8000/api'
  const LOGS_PER_PAGE = 10

  useEffect(() => {
    fetchLogs()
  }, [page, levelFilter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/logs/`, {
        params: {
          page,
          level: levelFilter !== 'all' ? levelFilter : undefined,
          search: searchTerm || undefined,
        },
      })
      
      // In a real app, the backend would return paginated results
      // For now, we'll simulate pagination on the frontend
      const allLogs = response.data
      const filteredLogs = searchTerm
        ? allLogs.filter((log: LogMessage) => 
            log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.query && log.query.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (log.response && log.response.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : allLogs
      
      const totalItems = filteredLogs.length
      setTotalPages(Math.ceil(totalItems / LOGS_PER_PAGE))
      
      const paginatedLogs = filteredLogs.slice(
        (page - 1) * LOGS_PER_PAGE,
        page * LOGS_PER_PAGE
      )
      
      setLogs(paginatedLogs)
      setError('')
    } catch (err) {
      console.error('Error fetching logs:', err)
      setError('Failed to load logs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1) // Reset to first page when searching
    fetchLogs()
  }

  const handleRefresh = () => {
    fetchLogs()
  }

  const handleLevelFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevelFilter(event.target.value)
    setPage(1) // Reset to first page when changing filters
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Logs
        </Typography>

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
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

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
          ) : logs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No logs found. Try changing your search criteria or create some logs first.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width="10%">Level</TableCell>
                      <TableCell width="15%">Timestamp</TableCell>
                      <TableCell width="65%">Message</TableCell>
                      <TableCell width="10%">Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <React.Fragment key={log.id}>
                        <TableRow hover>
                          <TableCell>
                            <Chip
                              label={log.level.toUpperCase()}
                              color={getLevelChipColor(log.level) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                          <TableCell>{log.message}</TableCell>
                          <TableCell>
                            <Tooltip title="View details">
                              <IconButton
                                size="small"
                                onClick={() => toggleRowExpand(log.id)}
                              >
                                {expandedRows[log.id] ? (
                                  <ExpandLessIcon />
                                ) : (
                                  <ExpandMoreIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={4}
                          >
                            <Collapse
                              in={expandedRows[log.id]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ margin: 1, py: 2 }}>
                                <Tabs 
                                  value={tabValues[log.id] || 0} 
                                  onChange={(e, newValue) => handleTabChange(log.id, newValue)}
                                  aria-label="log details tabs"
                                >
                                  <Tab label="Metadata" />
                                  {log.query && <Tab label="Query" />}
                                  {log.response && <Tab label="Response" />}
                                </Tabs>
                                
                                <TabPanel value={tabValues[log.id] || 0} index={0}>
                                  <Typography variant="h6" gutterBottom component="div">
                                    Metadata
                                  </Typography>
                                  <Box
                                    component="pre"
                                    sx={{
                                      p: 2,
                                      bgcolor: 'background.paper',
                                      borderRadius: 1,
                                      overflow: 'auto',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {formatMetadata(log.metadata)}
                                  </Box>
                                </TabPanel>
                                
                                {log.query && (
                                  <TabPanel value={tabValues[log.id] || 0} index={1}>
                                    <Typography variant="h6" gutterBottom component="div">
                                      Query
                                    </Typography>
                                    <Box
                                      component="pre"
                                      sx={{
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        borderRadius: 1,
                                        overflow: 'auto',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {log.query}
                                    </Box>
                                  </TabPanel>
                                )}
                                
                                {log.response && (
                                  <TabPanel value={tabValues[log.id] || 0} index={log.query ? 2 : 1}>
                                    <Typography variant="h6" gutterBottom component="div">
                                      Response
                                    </Typography>
                                    <Box
                                      component="pre"
                                      sx={{
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        borderRadius: 1,
                                        overflow: 'auto',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {log.response}
                                    </Box>
                                  </TabPanel>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  )
}

export default LogViewer 