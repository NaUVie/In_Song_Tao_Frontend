<script setup>
import { useRoute } from 'vue-router'

// Lấy thông tin đường dẫn hiện tại
const route = useRoute()

const navItems = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Dịch vụ in', path: '/services' },
  { name: 'Thiết kế', path: '/guide' },
  { name: 'Giới thiệu', path: '/intro' },
  { name: 'Tin tức', path: '/news' },
  { name: 'Liên hệ', path: '/contact' }
]

// Hàm bắt chính xác 100% trang đang đứng
const isActive = (path) => {
  // Nếu là trang chủ thì phải khớp chính xác '/'
  if (path === '/') {
    return route.path === '/'
  }
  // Các trang khác thì chỉ cần chứa đường dẫn (ví dụ: /services/decal vẫn làm sáng menu Dịch vụ in)
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="bg-gradient-to-r from-red-600 to-red-700 text-white hidden md:block font-sans shadow-lg relative z-40 border-b border-red-800">
    <div class="max-w-7xl mx-auto px-4">
      <ul class="flex items-center text-[13px] font-bold uppercase tracking-widest">
        
        <li v-for="(item, index) in navItems" :key="item.path" class="relative">
          <router-link 
            :to="item.path" 
            class="block py-3.5 px-6 transition-all duration-300 relative overflow-hidden group"
            :class="isActive(item.path) ? 'bg-black/15' : ''"
          >
            <span 
              class="relative z-10 transition-colors duration-300 drop-shadow-sm"
              :class="isActive(item.path) ? 'text-yellow-400' : 'text-white group-hover:text-yellow-300'"
            >
              {{ item.name }}
            </span>

            <span class="absolute bottom-0 left-0 w-full h-[3px] bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            
            <span 
              v-if="isActive(item.path)" 
              class="absolute bottom-0 left-0 w-full h-[3px] bg-yellow-400"
            ></span>

            <span class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </router-link>
        </li>

      </ul>
    </div>
  </nav>
</template>