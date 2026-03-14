<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Search, ShoppingCart, User, Phone, Loader2 } from 'lucide-vue-next' 
import axios from '@/utils/axios' 

const isLoggedIn = ref(false)
const userName = ref('Đăng nhập')

const checkAuthStatus = () => {
  const jwtToken = localStorage.getItem('token') 
  isLoggedIn.value = !!jwtToken

  if (jwtToken) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      userName.value = user.name ? user.name.split(' ').pop() : 'Tài khoản'
    } catch (e) {
      userName.value = 'Tài khoản'
    }
  } else {
    userName.value = 'Đăng nhập'
  }
}

const searchQuery = ref('')
const searchResults = ref({ services: [], categories: [] })
const isSearching = ref(false)
const showDropdown = ref(false)
const searchContainerRef = ref(null)
let searchTimeout = null

const handleSearch = () => {
  clearTimeout(searchTimeout)

  if (!searchQuery.value.trim()) {
    searchResults.value = { services: [], categories: [] }
    showDropdown.value = false
    isSearching.value = false
    return
  }

  isSearching.value = true
  showDropdown.value = true

  searchTimeout = setTimeout(async () => {
    try {
      const response = await axios.get(`/search?q=${searchQuery.value}`)
      searchResults.value = response.data
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error)
    } finally {
      isSearching.value = false
    }
  }, 500)
}

const handleClickOutside = (event) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  checkAuthStatus()
  window.addEventListener('auth-change', checkAuthStatus)
  window.addEventListener('storage', checkAuthStatus)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('auth-change', checkAuthStatus)
  window.removeEventListener('storage', checkAuthStatus)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="bg-white border-b border-gray-100 relative z-[99]">
    
    <div class="hidden md:block bg-gray-100 text-gray-600 text-[11px] py-1 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div class="flex gap-4">
          <span class="font-bold text-red-600 flex items-center pr-2">
            <Phone class="w-3 h-3 inline mr-1" /> 0 969 296 540
          </span>
          <span class="border-l border-gray-300 pl-2">Email: demo@clickin.vn</span>
        </div>
        <div class="flex gap-3 items-center font-medium">
          <a href="#" class="hover:text-red-600 transition">Tuyển dụng</a>
          <span class="text-gray-300">|</span>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-2 md:py-3 flex flex-wrap items-center">
      
      <router-link to="/" class="w-1/2 md:w-auto flex-shrink-0 flex items-center h-10 md:h-12 overflow-hidden">
        <img 
          src="/images/clickin.svg" 
          alt="ClickIn Logo" 
          class="h-[180%] md:h-[220%] w-auto object-contain object-left -ml-2 md:-ml-6" 
        />
      </router-link>

      <div class="w-1/2 flex items-center justify-end gap-4 text-gray-700 md:hidden">
        <router-link :to="isLoggedIn ? '/account' : '/auth'" class="flex flex-col items-center hover:text-red-600 transition">
          <User class="w-5 h-5" />
        </router-link>
        <router-link to="/cart" class="flex flex-col items-center hover:text-red-600 transition relative">
          <ShoppingCart class="w-5 h-5" />
          <span class="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white">
            0
          </span>
        </router-link>
      </div>

      <div class="w-full mt-3 md:mt-0 md:flex-1 md:px-10 relative md:-translate-y-2" ref="searchContainerRef">
        <div class="flex relative group">
          <input 
            v-model="searchQuery"
            @input="handleSearch"
            @focus="searchQuery.trim() ? showDropdown = true : null"
            type="text" 
            placeholder="Tìm kiếm danh mục, dịch vụ..." 
            class="w-full pl-4 pr-12 py-2 text-xs md:text-sm border-2 border-red-600 rounded-full outline-none focus:ring-4 focus:ring-red-100 transition-all shadow-sm"
          >
          <button class="absolute right-1 top-1 bottom-1 bg-red-600 text-white px-4 md:px-5 rounded-full hover:bg-red-700 transition-colors flex items-center shadow-md">
            <Loader2 v-if="isSearching" class="w-4 h-4 animate-spin" />
            <Search v-else class="w-4 h-4" />
          </button>
        </div>

        <div 
          v-if="showDropdown && (searchResults.services?.length || searchResults.categories?.length || isSearching || searchQuery)"
          class="absolute top-full left-0 md:left-10 right-0 md:right-10 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] max-h-[400px] overflow-y-auto"
        >
          <div v-if="isSearching" class="p-4 text-center text-gray-500 text-sm">Đang tìm kiếm...</div>
          <div v-else-if="!searchResults.services?.length && !searchResults.categories?.length" class="p-4 text-center text-gray-500 text-sm">
            Không tìm thấy kết quả cho "<span class="font-bold text-red-600">{{ searchQuery }}</span>"
          </div>
          <div v-else>
            <div v-if="searchResults.categories?.length" class="py-2">
              <div class="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Danh mục</div>
              <router-link 
                v-for="cat in searchResults.categories" :key="cat.slug" :to="`/category/${cat.slug}`" 
                class="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                @click="showDropdown = false"
              >{{ cat.name }}</router-link>
            </div>
            <div v-if="searchResults.services?.length" class="py-2 border-t border-gray-100">
              <div class="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Dịch vụ</div>
              <router-link 
                v-for="srv in searchResults.services" :key="srv.slug" :to="`/service/${srv.slug}`" 
                class="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                @click="showDropdown = false"
              >{{ srv.name }}</router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden md:flex items-center justify-end gap-6 text-gray-700">
        
        <div class="flex items-center gap-3 pr-6 border-r border-gray-200">
          <div class="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <Phone class="w-4 h-4" />
          </div>
          <div>
            <div class="text-[10px] text-gray-500 font-normal leading-none mb-1">Tư vấn báo giá</div>
            <div class="text-red-600 font-bold text-xs leading-none">0969 296 540</div>
          </div>
        </div>

        <router-link 
          :to="isLoggedIn ? '/account' : '/auth'" 
          class="flex flex-col items-center gap-0.5 hover:text-red-600 transition min-w-[50px]"
        >
          <User class="w-6 h-6" />
          <span class="text-[11px] font-semibold truncate w-full text-center">
            {{ userName }}
          </span>
        </router-link>

        <router-link to="/cart" class="flex flex-col items-center gap-0.5 hover:text-red-600 transition relative">
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