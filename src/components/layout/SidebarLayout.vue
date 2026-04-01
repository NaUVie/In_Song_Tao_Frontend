<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useRoute } from 'vue-router'
import { Layers, Menu, X, ChevronDown } from 'lucide-vue-next'

const store = useAppStore()
const route = useRoute()
const activeGroup = ref('')
const isMobileSidebarOpen = ref(false)

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories()
  }
})

// Xử lý gom nhóm tự động dựa trên quan hệ cha-con (parent_id)
const groupedCategories = computed(() => {
  if (!store.categories || store.categories.length === 0) return []

  // 1. Lấy tất cả các danh mục gốc (không có parent_id)
  const parents = store.categories.filter(cat => !cat.parent_id)

  // 2. Map các danh mục con vào đúng danh mục cha tương ứng
  return parents.map(parent => {
    return {
      id: parent.id,
      name: parent.name,
      slug: parent.slug,
      items: store.categories.filter(cat => cat.parent_id === parent.id)
    }
  })
})

// Mở group tương ứng khi load trang hoặc chuyển route
watch(
  [() => route.params.slug, groupedCategories], 
  ([currentSlug, groups]) => {
    if (currentSlug && groups.length > 0) {
      // Tìm group chứa slug hiện tại (có thể là slug của danh mục con HOẶC chính danh mục cha)
      const targetGroup = groups.find(g => 
        g.slug === currentSlug || g.items.some(item => item.slug === currentSlug)
      )
      if (targetGroup && activeGroup.value !== targetGroup.name) {
        activeGroup.value = targetGroup.name
      }
    } else if (!activeGroup.value && groups.length > 0) {
      activeGroup.value = groups[0].name
    }
  }, 
  { immediate: true }
)

const toggleGroup = (name) => {
  activeGroup.value = activeGroup.value === name ? '' : name
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8">
    
    <div class="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-red-100 shadow-sm z-50 relative">
      <div class="flex items-center gap-2 text-red-600 font-black uppercase tracking-widest text-sm">
        <Layers class="w-5 h-5" />
        <span>Danh mục in ấn</span>
      </div>
      <button 
        @click="isMobileSidebarOpen = !isMobileSidebarOpen" 
        class="text-gray-500 hover:text-red-600 bg-red-50 p-2 rounded-xl transition-all active:scale-95"
      >
        <Menu v-if="!isMobileSidebarOpen" class="w-5 h-5 text-red-600" />
        <X v-else class="w-5 h-5 text-red-600" />
      </button>
    </div>

    <aside 
      class="w-full md:w-1/4 lg:w-1/5 flex-shrink-0 transition-all duration-300 origin-top"
      :class="isMobileSidebarOpen ? 'block' : 'hidden md:block'"
    >
      <div class="md:sticky md:top-24 space-y-4">
        
        <div class="hidden md:flex bg-red-600 text-white font-black p-4 uppercase tracking-widest border-b border-red-700 rounded-t-2xl shadow-sm items-center gap-2">
          <Layers class="w-5 h-5" /> Sản phẩm in
        </div>
        
        <div class="bg-white border border-gray-100 md:rounded-b-2xl md:rounded-t-none rounded-2xl shadow-sm overflow-hidden">
          <div v-if="store.loading" class="p-6 text-center flex flex-col items-center text-gray-400">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-red-600 mb-2"></div>
            Đang tải...
          </div>
          
          <div v-else class="divide-y divide-gray-50 max-h-[70vh] md:max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div v-for="group in groupedCategories" :key="group.id">
              
              <template v-if="group.items.length > 0">
                <button 
                  @click="toggleGroup(group.name)"
                  class="w-full px-5 py-4 md:px-4 md:py-3 text-left font-black text-gray-800 hover:bg-gray-50 flex justify-between items-center focus:outline-none transition-colors"
                  :class="{ 'bg-red-50 text-red-600': activeGroup === group.name }"
                >
                  <span class="text-[11px] md:text-[13px] uppercase tracking-widest">{{ group.name }}</span>
                  <ChevronDown 
                    class="w-4 h-4 text-gray-400 transition-transform duration-300"
                    :class="{ 'rotate-180 text-red-600': activeGroup === group.name }"
                  />
                </button>

                <div 
                  v-show="activeGroup === group.name" 
                  class="bg-white pb-3 pt-1 border-t border-dashed border-red-100"
                >
                  <ul class="space-y-0.5">
                    <li v-for="category in group.items" :key="category.id">
                      <router-link 
                        :to="'/category/' + category.slug" 
                        @click="closeMobileSidebar" 
                        class="block px-6 py-2.5 hover:bg-red-50 hover:text-red-600 transition-all truncate text-gray-600 font-bold border-l-4 border-transparent text-[13px]"
                        active-class="bg-red-50 text-red-600 font-black !border-red-600 shadow-sm"
                      >
                        {{ category.name }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </template>

              <template v-else>
                <router-link 
                  :to="'/category/' + group.slug" 
                  @click="closeMobileSidebar"
                  class="block w-full px-5 py-4 md:px-4 md:py-3 text-left font-black text-gray-800 hover:bg-gray-50 transition-colors uppercase tracking-widest text-[11px] md:text-[13px]"
                  active-class="bg-red-50 !text-red-600"
                >
                  {{ group.name }}
                </router-link>
              </template>

            </div>
          </div>
        </div>
      </div>
    </aside>

    <main class="w-full md:w-3/4 lg:w-4/5 flex-grow">
      <slot></slot>
    </main>

  </div>
</template>

<style scoped>
/* Làm đẹp thanh cuộn trên PC & Mobile */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>