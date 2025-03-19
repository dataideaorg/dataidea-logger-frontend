import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  IconButton
} from '@mui/material'
import Plot from 'react-plotly.js'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import { API_URL } from '../api/endpoints'

// Analytics data interfaces
interface MonthlyLogCounts {
  month: string
  eventCount: number
  llmCount: number
}

interface SourceCount {
  name: string
  value: number
}

interface LogLevelCount {
  level: string
  count: number
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

// Colors for charts
const COLORS = ['#1976d2', '#008374', '#9c27b0', '#ff9800', '#f44336', '#4caf50', '#795548', '#607d8b']

// Tab Panel Component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Analytics = () => {
  // States for analytics data
  const [monthlyLogCounts, setMonthlyLogCounts] = useState<MonthlyLogCounts[]>([])
  const [llmSourceCounts, setLlmSourceCounts] = useState<SourceCount[]>([])
  const [logLevelCounts, setLogLevelCounts] = useState<LogLevelCount[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const theme = useTheme()

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('access_token')
      
      const response = await axios.get(`${API_URL}/analytics/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      const data = response.data
      
      // Process monthly data
      setMonthlyLogCounts(data.monthly_logs || [])
      
      // Process source counts
      setLlmSourceCounts(data.llm_sources || [])
      
      // Process log level counts
      setLogLevelCounts(data.log_levels || [])
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      setError('Failed to load analytics data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchAnalyticsData()
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleDownloadCSV = async (dataType: string) => {
    try {
      const token = localStorage.getItem('access_token')
      
      const response = await axios.get(`${API_URL}/analytics/download/${dataType}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      })
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${dataType}_analytics.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error(`Failed to download ${dataType} data:`, error)
      setError(`Failed to download ${dataType} data. Please try again later.`)
    }
  }

  // Monthly Trend Chart
  const renderMonthlyTrendChart = () => {
    if (monthlyLogCounts.length === 0) {
      return <Typography>No monthly data available</Typography>
    }

    const months = monthlyLogCounts.map(item => item.month)
    const eventCounts = monthlyLogCounts.map(item => item.eventCount)
    const llmCounts = monthlyLogCounts.map(item => item.llmCount)

    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <Plot
          data={[
            {
              x: months,
              y: eventCounts,
              type: 'bar',
              name: 'Event Logs',
              marker: { color: COLORS[0] }
            },
            {
              x: months,
              y: llmCounts,
              type: 'bar',
              name: 'LLM Logs',
              marker: { color: COLORS[1] }
            }
          ]}
          layout={{
            title: 'Monthly Log Counts',
            autosize: true,
            barmode: 'group',
            xaxis: {
              title: 'Month',
              tickangle: -45
            },
            yaxis: {
              title: 'Count'
            },
            legend: {
              orientation: 'h',
              y: -0.2
            },
            margin: {
              l: 50,
              r: 50,
              b: 100,
              t: 50,
              pad: 4
            }
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </Box>
    )
  }

  // LLM Sources Pie Chart
  const renderLlmSourcesChart = () => {
    if (llmSourceCounts.length === 0) {
      return <Typography>No LLM source data available</Typography>
    }

    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <Plot
          data={[
            {
              values: llmSourceCounts.map(item => item.value),
              labels: llmSourceCounts.map(item => item.name),
              type: 'pie',
              marker: {
                colors: COLORS.slice(0, llmSourceCounts.length)
              },
              textinfo: 'label+percent',
              textposition: 'outside',
              automargin: true
            }
          ]}
          layout={{
            title: 'LLM Log Sources',
            autosize: true,
            showlegend: true,
            legend: {
              orientation: 'h',
              y: -0.2
            },
            margin: {
              l: 50,
              r: 50,
              b: 100,
              t: 50,
              pad: 4
            }
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </Box>
    )
  }

  // Log Levels Chart
  const renderLogLevelsChart = () => {
    if (logLevelCounts.length === 0) {
      return <Typography>No log level data available</Typography>
    }

    const levelColors: Record<string, string> = {
      'info': '#2196f3',
      'warning': '#ff9800',
      'error': '#f44336',
      'debug': '#4caf50'
    }

    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <Plot
          data={[
            {
              values: logLevelCounts.map(item => item.count),
              labels: logLevelCounts.map(item => item.level),
              type: 'pie',
              marker: {
                colors: logLevelCounts.map(item => levelColors[item.level.toLowerCase()] || COLORS[0])
              },
              textinfo: 'label+percent',
              textposition: 'outside',
              automargin: true
            }
          ]}
          layout={{
            title: 'Log Levels Distribution',
            autosize: true,
            showlegend: true,
            legend: {
              orientation: 'h',
              y: -0.2
            },
            margin: {
              l: 50,
              r: 50,
              b: 100,
              t: 50,
              pad: 4
            }
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </Box>
    )
  }

  // Combined Summary Chart
  const renderCombinedChart = () => {
    if (monthlyLogCounts.length === 0) {
      return <Typography>No data available for combined chart</Typography>
    }

    const months = monthlyLogCounts.map(item => item.month)
    const eventCounts = monthlyLogCounts.map(item => item.eventCount)
    const llmCounts = monthlyLogCounts.map(item => item.llmCount)
    const totalCounts = monthlyLogCounts.map(item => item.eventCount + item.llmCount)

    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <Plot
          data={[
            {
              x: months,
              y: totalCounts,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Total Logs',
              line: { color: COLORS[2], width: 3 },
              marker: { size: 8 }
            },
            {
              x: months,
              y: eventCounts,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Event Logs',
              line: { color: COLORS[0], width: 2 },
              marker: { size: 6 }
            },
            {
              x: months,
              y: llmCounts,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'LLM Logs',
              line: { color: COLORS[1], width: 2 },
              marker: { size: 6 }
            }
          ]}
          layout={{
            title: 'Logs Trend Over Time',
            autosize: true,
            xaxis: {
              title: 'Month',
              tickangle: -45
            },
            yaxis: {
              title: 'Count'
            },
            legend: {
              orientation: 'h',
              y: -0.2
            },
            margin: {
              l: 50,
              r: 50,
              b: 100,
              t: 50,
              pad: 4
            }
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="500">
          Analytics Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} sx={{ color: theme.palette.primary.main }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download CSV">
            <IconButton onClick={() => handleDownloadCSV('all')} sx={{ color: theme.palette.primary.main }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {error && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.main,
            border: `1px solid ${theme.palette.error.main}`
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
              <Tab label="Monthly Trend" />
              <Tab label="LLM Sources" />
              <Tab label="Log Levels" />
              <Tab label="Combined View" />
            </Tabs>
          </Box>
          
          <TabPanel value={activeTab} index={0}>
            <Paper elevation={3} sx={{ p: 3 }}>
              {renderMonthlyTrendChart()}
            </Paper>
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <Paper elevation={3} sx={{ p: 3 }}>
              {renderLlmSourcesChart()}
            </Paper>
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <Paper elevation={3} sx={{ p: 3 }}>
              {renderLogLevelsChart()}
            </Paper>
          </TabPanel>
          
          <TabPanel value={activeTab} index={3}>
            <Paper elevation={3} sx={{ p: 3 }}>
              {renderCombinedChart()}
            </Paper>
          </TabPanel>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Log Summary</Typography>
                <Typography variant="body1">
                  Total Event Logs: <strong>{monthlyLogCounts.reduce((acc, item) => acc + item.eventCount, 0)}</strong>
                </Typography>
                <Typography variant="body1">
                  Total LLM Logs: <strong>{monthlyLogCounts.reduce((acc, item) => acc + item.llmCount, 0)}</strong>
                </Typography>
                <Typography variant="body1">
                  Total Logs: <strong>{monthlyLogCounts.reduce((acc, item) => acc + item.eventCount + item.llmCount, 0)}</strong>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Top Source</Typography>
                {llmSourceCounts.length > 0 ? (
                  <Typography variant="body1">
                    Most Popular LLM Source: <strong>{llmSourceCounts[0].name}</strong> with <strong>{llmSourceCounts[0].value}</strong> logs
                  </Typography>
                ) : (
                  <Typography variant="body1">No LLM source data available</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  )
}

export default Analytics 