<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import SidebarLayout from '../components/layout/SidebarLayout.vue'
import { ArrowRight, Layers, ChevronDown, ChevronUp } from 'lucide-vue-next'

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
      <div class="bg-white p-4 md:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <h1 class="text-2xl md:text-3xl font-black text-gray-900 mb-10 uppercase tracking-tight flex items-center gap-3">
          <Layers class="w-8 h-8 text-primary-600" /> Tất cả dịch vụ in ấn
        </h1>

        <div v-if="store.loading" class="flex justify-center items-center py-20">
           <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-primary-600"></div>
        </div>

        <div v-else class="space-y-16">
          <div v-for="group in groupedCategories" :key="group.id" class="group-section">
            
            <div class="flex items-center gap-4 mb-8">
              <h2 class="text-lg md:text-xl font-black text-gray-800 uppercase tracking-wider relative">
                {{ group.name }}
                <span class="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-600 rounded-full"></span>
              </h2>
              <div class="flex-grow h-px bg-gray-100 mt-2"></div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <div v-for="cat in (expandedGroups.has(group.id) ? group.items : group.items.slice(0, 4))" :key="cat.id" 
                   class="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-600/10 hover:border-primary-200 transition-all duration-300 group/card flex flex-col cursor-pointer animate-in fade-in slide-in-from-bottom-4">
                
                <div class="h-36 sm:h-44 bg-gray-50 relative overflow-hidden flex justify-center items-center p-4">
                  <img :src="getImageUrl(cat.image_url)" :alt="cat.name" class="w-full h-full object-contain transition-transform duration-500 group-hover/card:scale-110" @error="handleImageError">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div class="p-4 md:p-5 flex-grow flex flex-col justify-between bg-white">
                  <h3 class="text-sm md:text-[15px] font-bold text-gray-800 mb-4 group-hover/card:text-primary-600 line-clamp-2 transition-colors">
                    {{ cat.name }}
                  </h3>
                  
                  <router-link :to="'/category/' + cat.slug" 
                               class="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-600 hover:text-white border border-primary-100 hover:border-primary-600 px-4 py-2.5 rounded-lg transition-all duration-300">
                    Xem chi tiết <ArrowRight class="w-4 h-4" />
                  </router-link>
                </div>
              </div>
            </div>

            <div v-if="group.items.length > 4" class="mt-10 flex justify-center">
              <button @click="toggleGroup(group.id)" 
                      class="flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-200 rounded-full text-slate-600 font-bold text-xs uppercase tracking-widest hover:border-primary-600 hover:text-primary-600 transition-all duration-300 group/btn shadow-sm active:scale-95">
                
                <template v-if="!expandedGroups.has(group.id)">
                  Xem thêm {{ group.items.length - 4 }} dịch vụ
                  <ChevronDown class="w-4 h-4 group-hover/btn:translate-y-1 transition-transform" />
                </template>
                <template v-else>
                  Thu gọn lại
                  <ChevronUp class="w-4 h-4 group-hover/btn:-translate-y-1 transition-transform" />
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
</style>