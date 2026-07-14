import axios from 'axios'
import { getToken, clearAllAuth } from './storage'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' })

api.interceptors.request.use(cfg => {
  const token = getToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      clearAllAuth()
      window.location.href = '/auth'
    }
    return Promise.reject(err)
  }
)

export default api
