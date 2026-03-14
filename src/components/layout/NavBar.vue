<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const navItems = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Dịch vụ in', path: '/services' },
  { name: 'Thiết kế', path: '/guide' },
  { name: 'Giới thiệu', path: '/intro' },
  { name: 'Tin tức', path: '/news' },
  { name: 'Liên hệ', path: '/contact' }
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="bg-gradient-to-r from-red-600 to-red-700 text-white font-sans shadow-lg sticky top-0 z-50 border-b border-red-800 w-full transition-all">
    <div class="max-w-7xl mx-auto px-4">
      
      <div class="md:hidden flex items-center justify-between py-3">
        <span class="text-xs font-black uppercase tracking-widest text-red-100">Menu</span>
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen" 
          class="text-white focus:outline-none hover:bg-black/10 p-2 rounded-xl transition-colors active:scale-95"
        >
          <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <ul class="hidden md:flex items-center text-[13px] font-bold uppercase tracking-widest">
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

    <div 
      class="md:hidden w-full bg-red-700 shadow-inner overflow-hidden transition-all duration-300 ease-in-out"
      :class="isMobileMenuOpen ? 'max-h-[500px] border-t border-red-800/50' : 'max-h-0 border-transparent'"
    >
      <ul class="flex flex-col text-[12px] font-bold uppercase tracking-widest">
        <li v-for="(item, index) in navItems" :key="item.path" class="border-b border-red-800/30 last:border-none">
          <router-link 
            :to="item.path" 
            @click="isMobileMenuOpen = false" 
            class="block py-4 px-6 transition-all duration-200 relative overflow-hidden"
            :class="isActive(item.path) ? 'bg-black/20 text-yellow-400' : 'text-white hover:bg-black/10 hover:text-yellow-300'"
          >
            <span class="relative z-10 flex items-center gap-3">
              <span v-if="isActive(item.path)" class="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
              <span v-else class="w-1.5 h-1.5 rounded-full bg-transparent"></span>
              {{ item.name }}
            </span>
            
            <span 
              v-if="isActive(item.path)" 
              class="absolute left-0 top-0 h-full w-1 bg-yellow-400"
            ></span>
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>