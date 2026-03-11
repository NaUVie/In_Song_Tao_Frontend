import axios from 'axios'

/**
 * TỰ ĐỘNG NHẬN DIỆN BASE URL:
 * - Trên Vercel: Sẽ lấy link từ biến VITE_API_BASE_URL + '/api'
 * - Ở Local: Sẽ dùng '/api' để chạy qua Proxy trong vite.config.js
 */
const baseURL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api` 
  : '/api'

const instance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
})

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      // Optional: Redirect to login
      // window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export default instance