import { createContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: number
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, passwordConfirm: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const API_URL = 'https://loggerapi.dataidea.org/api'
  const AUTH_URL = `${API_URL}/auth`

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Check if token is expired
        const decoded: any = jwtDecode(token)
        const currentTime = Date.now() / 1000
        
        if (decoded.exp < currentTime) {
          // Token expired
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setIsAuthenticated(false)
          setUser(null)
          setLoading(false)
          return
        }

        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Get user data
        const response = await axios.get(`${AUTH_URL}/user/`)
        setUser(response.data)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error loading user:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setIsAuthenticated(false)
        setUser(null)
      }
      
      setLoading(false)
    }

    loadUser()
  }, [AUTH_URL])

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${AUTH_URL}/token/`, {
        username,
        password,
      })

      const { access, refresh } = response.data
      
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      const userResponse = await axios.get(`${AUTH_URL}/user/`)
      setUser(userResponse.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (username: string, email: string, password: string, passwordConfirm: string) => {
    try {
      await axios.post(`${AUTH_URL}/register/`, {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      })
      
      // Login after successful registration
      await login(username, password)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 