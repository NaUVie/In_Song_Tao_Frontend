<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  FolderTree 
} from 'lucide-vue-next'

const router = useRouter()
const isSidebarOpen = ref(true)

const menuItems = [
  { name: 'Tổng quan', icon: LayoutDashboard, route: 'admin-dashboard' },
  { name: 'Quản lý Danh mục', icon: FolderTree, route: 'admin-categories' }, 
  { name: 'Quản lý Dịch vụ', icon: Package, route: 'admin-services' },
  { name: 'Quản lý Đơn hàng', icon: ShoppingCart, route: 'admin-orders' },
]

const logout = () => {
  // Clear token and redirect
  localStorage.removeItem('token')
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <aside 
      class="bg-white border-r border-gray-200 transition-all duration-300 flex flex-col"
      :class="isSidebarOpen ? 'w-64' : 'w-20'"
    >
      <div class="p-6 flex items-center justify-between">
        <span v-if="isSidebarOpen" class="font-black text-xl text-indigo-600 italic tracking-tighter">TYD Admin</span>
        <button @click="isSidebarOpen = !isSidebarOpen" class="text-gray-500 hover:text-indigo-600 transition-colors">
          <Menu v-if="!isSidebarOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <nav class="flex-1 px-4 py-4 space-y-2">
        <router-link 
          v-for="item in menuItems" 
          :key="item.route"
          :to="{ name: item.route }"
          class="flex items-center gap-4 p-3 rounded-xl transition group"
          active-class="bg-indigo-50 text-indigo-600 font-bold"
          :class="$route.name === item.route ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'"
        >
          <component :is="item.icon" class="w-6 h-6" :class="$route.name === item.route ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'" />
          <span v-if="isSidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-100">
        <button 
          @click="logout"
          class="w-full flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-50 transition font-medium group"
        >
          <LogOut class="w-6 h-6 text-red-400 group-hover:text-red-600" />
          <span v-if="isSidebarOpen">Đăng xuất</span>
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>