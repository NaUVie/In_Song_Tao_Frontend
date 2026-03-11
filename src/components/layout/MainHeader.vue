<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Search, ShoppingCart, User, Phone } from 'lucide-vue-next'

const searchQuery = ref('')

// Dùng ref thay vì computed
const isLoggedIn = ref(false)
const userName = ref('Đăng nhập')

// Hàm kiểm tra và cập nhật trạng thái
const checkAuthStatus = () => {
  // 1. Tìm đúng cái tên 'token' trong Local Storage
  const jwtToken = localStorage.getItem('token') 
  isLoggedIn.value = !!jwtToken

  if (jwtToken) {
    try {
      // 2. Tìm đúng cái tên 'user'
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      // 3. Lấy trường 'name' thay vì 'full_name'
      userName.value = user.name ? user.name.split(' ').pop() : 'Tài khoản'
    } catch (e) {
      userName.value = 'Tài khoản'
    }
  } else {
    userName.value = 'Đăng nhập'
  }
}
// Chạy ngay khi Header load lên
onMounted(() => {
  checkAuthStatus()
  
  // Lắng nghe sự kiện login/logout từ các trang khác
  window.addEventListener('auth-change', checkAuthStatus)
  // Lắng nghe khi mở web ở nhiều tab
  window.addEventListener('storage', checkAuthStatus)
})

// Dọn dẹp bộ nhớ khi chuyển trang
onUnmounted(() => {
  window.removeEventListener('auth-change', checkAuthStatus)
  window.removeEventListener('storage', checkAuthStatus)
})
</script>
<template>
  <header class="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
    <div class="bg-gray-100 text-gray-600 text-[11px] py-1.5 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div class="flex gap-4">
          <span class="font-bold text-red-600 flex items-center pr-2">
            <Phone class="w-3 h-3 inline mr-1" /> 0 969 296 540
          </span>
          <span class="hidden md:inline border-l border-gray-300 pl-2">Email: demo@clickin.vn</span>
        </div>
        <div class="flex gap-3 items-center font-medium">
          <a href="#" class="hover:text-red-600 transition">Tuyển dụng</a>
          <span class="text-gray-300">|</span>
          
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
<router-link to="/" class="flex-shrink-0 flex items-center h-12 md:h-14 overflow-hidden">
   <img 
     src="/images/clickin.svg" 
     alt="ClickIn Logo" 
     class="h-[200%] md:h-[250%] w-auto object-contain object-left -ml-3 md:-ml-8" 
   />
</router-link>

      <div class="flex-1 max-w-xl pl-8 relative hidden md:block">
        <div class="flex relative group">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Tìm kiếm..." 
            class="w-full pl-4 pr-12 py-2 text-sm border-2 border-primary-600 rounded-full outline-none focus:ring-4 focus:ring-primary-100 transition-all"
          >
          <button class="absolute right-1 top-1 bottom-1 bg-primary-600 text-white px-5 rounded-full hover:bg-primary-700 transition-colors flex items-center">
            <Search class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="flex items-center gap-6 text-gray-700">
        <div class="hidden lg:flex items-center gap-3 pr-6 border-r border-gray-200">
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <Phone class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xs text-gray-500 font-normal">Tư vấn báo giá</div>
            <div class="text-red-600 font-bold text-sm">0909 111 222</div>
          </div>
        </div>

    <router-link 
          :to="isLoggedIn ? '/account' : '/auth'" 
          class="flex flex-col items-center gap-1 hover:text-primary-600 transition min-w-[60px]"
        >
          <User class="w-6 h-6" />
          <span class="text-[11px] font-semibold truncate w-full text-center">
            {{ userName }}
          </span>
        </router-link>

        <router-link to="/cart" class="flex flex-col items-center gap-1 hover:text-primary-600 transition relative">
          <div class="relative">
            <ShoppingCart class="w-6 h-6" />
            <span class="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              0
            </span>
          </div>
          <span class="text-[11px] font-semibold">Giỏ hàng</span>
        </router-link>
      </div>
    </div>
  </header>
</template>