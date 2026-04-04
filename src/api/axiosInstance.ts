import axios from 'axios'
import { toast } from 'react-toastify'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor — attach JWT from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message: string =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong.'

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const isAuthPage = ['/login', '/signup'].includes(window.location.pathname)
      if (!isAuthPage) {
        window.location.href = '/login'
      }
      // Let auth pages handle 401 errors themselves (form-level error)
      return Promise.reject(error)
    }

    // For upload requests, skip global toast — UploadPage handles it inline
    const isUpload = error.config?.url?.includes('/videos') && error.config?.method === 'post'
    if (!isUpload) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
