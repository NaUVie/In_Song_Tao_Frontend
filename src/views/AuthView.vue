<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  full_name: '',
  phone: ''
})

const handleAuth = async () => {
  loading.value = true
  error.value = ''
  try {
    if (isLogin.value) {
  const user = await store.login(form.email, form.password)

console.log("Dữ liệu User bốc được:", user)

const redirectPath = route.query.redirect || '/'

const isAdmin = !!user?.is_admin 

if (redirectPath.includes('/admin') && !isAdmin) {
    error.value = 'Tài khoản này không có quyền truy cập khu vực Admin!'
    loading.value = false
    setTimeout(() => router.push('/'), 2000)
    return 
}
      router.push(redirectPath)
      
    } else {
      await store.register(form)
      isLogin.value = true
      error.value = 'Đăng ký thành công! Vui lòng đăng nhập.'
    }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Sai email hoặc mật khẩu'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">{{ isLogin ? 'Đăng nhập' : 'Đăng ký' }}</h1>
      <form @submit.prevent="handleAuth" class="space-y-4">
        <div v-if="!isLogin">
          <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input v-model="form.full_name" type="text" class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none" required>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none" required>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input v-model="form.password" type="password" class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none" required>
        </div>
         <div v-if="!isLogin">
          <label class="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
          <input v-model="form.phone" type="text" class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
        </div>
        <button type="submit" :disabled="loading" class="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition flex justify-center shadow-lg shadow-red-200">
          <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          {{ isLogin ? 'Đăng nhập' : 'Đăng ký' }}
        </button>
        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      </form>
      <p class="mt-4 text-center text-sm text-gray-500">
        {{ isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?' }}
        <button @click="isLogin = !isLogin" class="text-red-600 font-bold hover:underline">
          {{ isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay' }}
        </button>
      </p>
    </div>
  </div>
</template>