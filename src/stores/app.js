import { defineStore } from 'pinia'
import axios from '../utils/axios'

export const useAppStore = defineStore('app', {
  state: () => ({
    categories: [],
    cart: [],
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
  }),
  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const response = await axios.get('/services/categories')
        this.categories = response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        this.loading = false
      }
    },
    addToCart(item) {
      this.cart.push(item)
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },
async login(email, password) {
      try {
        const response = await axios.post('/auth/login', { email, password })
        this.token = response.data.access_token
        localStorage.setItem('token', this.token)
        
        // Đợi lấy profile xong
        await this.fetchUserProfile()
        
        // SỬA TẠI ĐÂY: Trả về dữ liệu user vừa bốc được thay vì "true"
        return this.user 
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },
    async register(userData) {
      try {
        await axios.post('/auth/register', userData)
        return true
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      }
    },
    async fetchUserProfile() {
      if (!this.token) return
      try {
        const response = await axios.get('/auth/users/me')
        this.user = response.data
        
        // ===== THÊM DÒNG NÀY ĐỂ LƯU VÀO LOCAL STORAGE =====
        localStorage.setItem('user', JSON.stringify(response.data))
        // =================================================

      } catch (error) {
        console.error('Error fetching profile:', error)
        this.logout()
      }
    },
    
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      
      // ===== THÊM DÒNG NÀY ĐỂ XÓA SẠCH KHI ĐĂNG XUẤT =====
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('auth-change')) // Hét lên cho Header biết
      // =================================================
    },
    async checkout(orderData) {
      try {
        const response = await axios.post('/orders/', orderData)
        this.cart = [] // Clear cart on success
        return response.data
      } catch (error) {
        console.error('Checkout failed:', error)
        throw error
      }
    }
  }
})
