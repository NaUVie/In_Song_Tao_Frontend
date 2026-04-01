<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import SidebarLayout from '../components/layout/SidebarLayout.vue'
import { Layers, ChevronDown, ChevronUp } from 'lucide-vue-next'

const store = useAppStore()
const expandedGroups = ref(new Set())

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories()
  }
})

const toggleGroup = (groupId) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

const groupedCategories = computed(() => {
  if (!store.categories || store.categories.length === 0) return []
  const parents = store.categories.filter(cat => cat.parent_id === null)
  return parents.map(parent => {
    return {
      ...parent,
      items: store.categories.filter(cat => cat.parent_id === parent.id)
    }
  }).filter(group => group.items.length > 0) 
})

// HÀM XỬ LÝ ẢNH ĐÃ FIX LOCALHOST
const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x300/f3f4f6/6b7280?text=Chưa+có+ảnh'
  
  // Nếu path đã là link tuyệt đối (http...) thì trả về luôn
  if (path.startsWith('http')) return path
  
  // Vì bạn đã có rewrite trong vercel.json và proxy trong vite.config
  // Bạn chỉ cần đảm bảo path bắt đầu bằng dấu / (ví dụ: /static/uploads/...)
  return path.startsWith('/') ? path : `/${path}`
}

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/400x300/f3f4f6/6b7280?text=Ảnh+bị+lỗi'
}
</script>

<template>
  <MainLayout>
    <SidebarLayout>
      <div class="bg-white p-4 md:p-6 lg:p-8 font-sans">
        
        <h1 class="text-xl md:text-2xl font-bold text-[#6d6e71] mb-6 uppercase tracking-[2px] flex items-center gap-3">
          <Layers class="w-7 h-7 text-red-600" /> TẤT CẢ DỊCH VỤ IN ẤN
        </h1>

        <div v-if="store.loading" class="flex justify-center items-center py-20">
           <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-red-600"></div>
        </div>

        <div v-else class="space-y-12">
          <div v-for="group in groupedCategories" :key="group.id" class="group-section">
            
            <div class="mb-6">
              <h2 class="text-[16px] md:text-[18px] font-bold text-[#6d6e71] uppercase tracking-[2px]">
                {{ group.name }}
              </h2>
              <div class="w-full border-t-2 border-dotted border-gray-300 mt-2"></div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 gap-x-4">
              <router-link 
                v-for="cat in (expandedGroups.has(group.id) ? group.items : group.items.slice(0, 4))" 
                :key="cat.id" 
                :to="'/category/' + cat.slug" 
                class="group flex flex-col items-center text-center px-2 animate-in fade-in slide-in-from-bottom-4"
              >
                <div class="w-full flex justify-center mb-3">
                  <img 
                    :src="getImageUrl(cat.image_url)" 
                    :alt="cat.name" 
                    class="w-[90%] max-w-[200px] h-auto object-contain transition-transform duration-300 group-hover:-translate-y-1" 
                    @error="handleImageError"
                  >
                </div>

                <h3 class="text-[#6d6e71] font-bold text-[14px] tracking-[1.5px] uppercase group-hover:text-red-600 transition-colors line-clamp-2">
                  {{ cat.name }}
                </h3>
              </router-link>
            </div>

            <div v-if="group.items.length > 4" class="mt-8 text-center">
              <button 
                @click="toggleGroup(group.id)" 
                class="inline-flex items-center gap-1 text-[#6d6e71] text-[13px] tracking-[2px] uppercase font-semibold hover:text-red-600 transition-colors"
              >
                <template v-if="!expandedGroups.has(group.id)">
                  XEM THÊM {{ group.items.length - 4 }} DỊCH VỤ <ChevronDown class="w-4 h-4 ml-1" />
                </template>
                <template v-else>
                  THU GỌN LẠI <ChevronUp class="w-4 h-4 ml-1" />
                </template>
              </button>
            </div>

          </div>
        </div>

      </div>
    </SidebarLayout>
  </MainLayout>
</template>

<style scoped>
.animate-in {
  animation-duration: 400ms;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>