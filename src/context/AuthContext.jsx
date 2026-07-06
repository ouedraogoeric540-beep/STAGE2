import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const login = async (login, password) => {
    const res = await api.post('/login', { login, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
    return user
  }

  const register = async (data) => {
    const res = await api.post('/register', data)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
    return user
  }

  const [secondPasswordVerified, setSecondPasswordVerified] = useState(() => {
    return sessionStorage.getItem('secondPasswordVerified') === 'true'
  })

  const verifySecondPassword = () => {
    sessionStorage.setItem('secondPasswordVerified', 'true')
    setSecondPasswordVerified(true)
  }

  const logout = async () => {
    try { await api.post('/logout') } catch (_) {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('secondPasswordVerified')
    setToken(null)
    setUser(null)
    setSecondPasswordVerified(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token, setUser, secondPasswordVerified, verifySecondPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}