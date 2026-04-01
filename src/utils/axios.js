import axios from 'axios'

/**
 * TỰ ĐỘNG NHẬN DIỆN BASE URL:
 * - Do cả Vercel (rewrites) và Vite (proxy) đều dùng '/api' làm mốc để bẻ lái request.
 * - Nên ở đây ta chỉ cần lấy đúng giá trị từ .env, hoặc mặc định là '/api'.
 * - KHÔNG nối thêm '/api' nữa để tránh lỗi thành '/api/api'.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const instance = axios.create({
  baseURL: baseURL,
  timeout: 60000,
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