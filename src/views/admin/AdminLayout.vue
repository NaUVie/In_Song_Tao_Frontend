<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Menu,
  X,
  FolderTree 
} from 'lucide-vue-next'

const router = useRouter()
const isSidebarOpen = ref(true)

const menuItems = [
  { name: 'Tổng quan', icon: LayoutDashboard, route: 'admin-dashboard' },
  { name: 'Quản lý Tin tức', icon: LayoutDashboard, route: 'NewsManager' },
  { name: 'Banner', icon: LayoutDashboard, route: 'AdminBanners' },
  { name: 'Quản lý Danh mục', icon: FolderTree, route: 'admin-categories' }, 
  { name: 'Quản lý Dịch vụ', icon: Package, route: 'admin-services' },
  { name: 'Quản lý Đơn hàng', icon: ShoppingCart, route: 'admin-orders' },
]

const logout = () => {
  localStorage.removeItem('token')
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <aside 
      class="bg-white border-r border-gray-200 transition-all duration-300 flex flex-col sticky top-0 h-screen z-[100] shrink-0"
      :class="isSidebarOpen ? 'w-64' : 'w-20'"
    >
      <div class="h-20 flex items-center justify-between px-6 shrink-0">
        <div 
          class="transition-all duration-300 overflow-hidden flex items-center"
          :class="isSidebarOpen ? 'w-40 opacity-100' : 'w-0 opacity-0'"
        >
          <img 
          src="/images/clickin.svg" 
          alt="ClickIn Logo" 
          class="h-[200%] md:h-[250%] w-auto object-contain object-left -ml-5 md:-ml-5" 
        />
        </div>

        <button 
          @click="isSidebarOpen = !isSidebarOpen" 
          class="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-xl hover:bg-red-50 outline-none" 
          :class="!isSidebarOpen ? 'mx-auto' : ''"
        >
          <Menu v-if="!isSidebarOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-2 relative">
        <router-link 
          v-for="item in menuItems" 
          :key="item.route"
          :to="{ name: item.route }"
          class="flex items-center p-3 rounded-xl transition-all group relative"
          active-class="bg-red-50 text-red-600 font-bold"
          :class="[
            $route.name === item.route ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium',
            isSidebarOpen ? 'justify-start' : 'justify-center'
          ]"
        >
          <component 
            :is="item.icon" 
            class="w-6 h-6 shrink-0 transition-colors" 
            :class="$route.name === item.route ? 'text-red-600' : 'text-gray-400 group-hover:text-red-500'" 
          />
          
          <span 
            class="whitespace-nowrap transition-all duration-300 overflow-hidden text-left"
            :class="isSidebarOpen ? 'w-40 ml-4 opacity-100' : 'w-0 ml-0 opacity-0'"
          >
            {{ item.name }}
          </span>

          <div 
            v-if="!isSidebarOpen" 
            class="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl whitespace-nowrap"
          >
            <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45 rounded-sm"></div>
            <span class="relative z-10">{{ item.name }}</span>
          </div>
        </router-link>
      </nav>

      <div class="p-3 border-t border-gray-100 bg-white">
        <button 
          @click="logout"
          class="w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium group relative"
          :class="isSidebarOpen ? 'justify-start' : 'justify-center'"
        >
          <LogOut class="w-6 h-6 shrink-0 text-red-400 group-hover:text-red-600 transition-colors" />
          
          <span 
            class="whitespace-nowrap transition-all duration-300 overflow-hidden text-left"
            :class="isSidebarOpen ? 'w-40 ml-4 opacity-100' : 'w-0 ml-0 opacity-0'"
          >
            Đăng xuất
          </span>

          <div 
            v-if="!isSidebarOpen" 
            class="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl whitespace-nowrap"
          >
            <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rotate-45 rounded-sm"></div>
            <span class="relative z-10">Đăng xuất</span>
          </div>
        </button>
      </div>
    </aside>

    <main class="flex-1 min-w-0">
      <router-view />
    </main>
  </div>
</template>