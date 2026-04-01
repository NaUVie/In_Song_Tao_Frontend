<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import SidebarLayout from '../components/layout/SidebarLayout.vue'
import { Layers, ChevronDown, ChevronUp, ChevronRight, PackageOpen } from 'lucide-vue-next'

const route = useRoute()
const store = useAppStore()
const isExpanded = ref(false)

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories()
  }
})

// Reset trạng thái thu gọn khi đổi danh mục
watch(() => route.params.slug, () => {
  isExpanded.value = false
})

const category = computed(() => {
  return store.categories.find(c => c.slug === route.params.slug)
})

// Lấy danh mục con trực tiếp
const subCategories = computed(() => {
  if (!category.value) return []
  return store.categories.filter(c => c.parent_id === category.value.id)
})

// Lấy dịch vụ (nếu là cấp cuối)
const activeServices = computed(() => {
  if (!category.value || !category.value.services) return []
  return category.value.services.filter(service => !service.is_deleted)
})

// Xác định danh sách sẽ hiển thị (Ưu tiên hiện danh mục con)
const displayItems = computed(() => {
  return subCategories.value.length > 0 ? subCategories.value : activeServices.value
})

// Helper xử lý ảnh
const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x300/f3f4f6/6b7280?text=Chưa+có+ảnh'
  if (path.startsWith('http')) return path
  return path.startsWith('/') ? path : `/${path}`
}

const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/400x300/f3f4f6/6b7280?text=Ảnh+bị+lỗi'
}
</script>

<template>
  <MainLayout>
    <SidebarLayout>
      <div class="bg-white p-4 md:p-6 lg:p-8 font-sans min-h-[600px]">
        
        <div v-if="store.loading" class="flex justify-center items-center py-20">
           <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-red-600"></div>
        </div>

        <div v-else-if="category">
          <nav class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6">
            <router-link to="/" class="hover:text-red-600">Trang chủ</router-link>
            <ChevronRight class="w-3 h-3" />
            <span class="text-slate-900 font-black italic">{{ category.name }}</span>
          </nav>

          <div class="mb-10">
            <h1 class="text-xl md:text-2xl font-bold text-[#6d6e71] uppercase tracking-[2px] flex items-center gap-3">
              <Layers class="w-7 h-7 text-red-600" /> {{ category.name }}
            </h1>
            <div class="w-full border-t-2 border-dotted border-gray-300 mt-3"></div>
          </div>

          <div v-if="displayItems.length > 0">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-6">
              <router-link 
                v-for="item in (isExpanded ? displayItems : displayItems.slice(0, 4))" 
                :key="item.id" 
                :to="subCategories.length > 0 ? '/category/' + item.slug : '/service/' + item.slug" 
                class="group flex flex-col items-center text-center px-2 animate-in fade-in slide-in-from-bottom-4"
              >
                <div class="w-full flex justify-center mb-4">
                  <div class="w-full aspect-square bg-white border border-slate-50 overflow-hidden flex items-center justify-center">
                    <img 
                      :src="getImageUrl(item.image_url)" 
                      :alt="item.name" 
                      class="w-[90%] h-auto object-contain transition-transform duration-500 group-hover:scale-105" 
                      @error="handleImageError"
                    >
                  </div>
                </div>

                <h3 class="text-[#6d6e71] font-bold text-[13px] md:text-[14px] tracking-[1.5px] uppercase group-hover:text-red-600 transition-colors line-clamp-2">
                  {{ item.name }}
                </h3>
              </router-link>
            </div>

            <div v-if="displayItems.length > 4" class="mt-12 text-center">
              <button 
                @click="isExpanded = !isExpanded" 
                class="inline-flex items-center gap-1 text-[#6d6e71] text-[13px] tracking-[2px] uppercase font-semibold hover:text-red-600 transition-colors"
              >
                <template v-if="!isExpanded">
                  XEM THÊM {{ displayItems.length - 4 }} {{ subCategories.length > 0 ? 'PHÂN LOẠI' : 'DỊCH VỤ' }} <ChevronDown class="w-4 h-4 ml-1" />
                </template>
                <template v-else>
                  THU GỌN LẠI <ChevronUp class="w-4 h-4 ml-1" />
                </template>
              </button>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <PackageOpen class="w-12 h-12 text-slate-300 mb-4" />
            <p class="text-[#6d6e71] font-bold uppercase tracking-widest text-xs">Sản phẩm đang được cập nhật</p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  </MainLayout>
</template>

<style scoped>
.animate-in {
  animation-duration: 500ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>