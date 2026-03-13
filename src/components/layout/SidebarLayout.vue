<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useRoute } from 'vue-router'

const store = useAppStore()
const route = useRoute()
const activeGroup = ref('')

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories()
  }
})

// Danh sách nhóm tĩnh của bạn
const categoryGroups = [
  { name: 'Ấn phẩm Văn phòng', slugs: ['danh-thiep', 'bao-thu', 'bia-ho-so', 'giay-tieu-de', 'bieu-mau', 'ghi-chu', 'bia-dung-the-tu', 'bang-khen'] },
  { name: 'Quảng cáo & Marketing', slugs: ['to-roi-to-gap', 'catalogue', 'banner-poster', 'voucher-coupon', 'standee-de-ban', 'quat', 'buu-anh', 'phieu-tich-diem'] },
  { name: 'Tem Nhãn & Bao bì', slugs: ['hop-giay', 'tui-giay', 'nhan-decal', 'decal-giay', 'tem-bao-hanh', 'nhan-treo', 'nhan-co-chai', 'phieu-bao-hanh'] },
  { name: 'F&B (Nhà hàng)', slugs: ['menu', 'de-lot-ly', 'giay-lot-ban-an', 've-giu-xe'] },
  { name: 'Sự kiện & Lễ Tết', slugs: ['cuoi-hoi-su-kien', 'thiep-cuoi', 'bao-li-xi', 'lich', 'photobook'] },
  { name: 'Dịch vụ Đặc biệt', slugs: ['thiet-ke-logo', 'in-nhanh', 'in-tren-nhua', 'inproof', 'color-chart'] }
]

// Xử lý gom nhóm và tìm các danh mục chưa được phân loại
const groupedCategories = computed(() => {
  if (!store.categories || store.categories.length === 0) return []

  const matchedCategoryIds = new Set()

  // 1. Phân loại theo nhóm đã định nghĩa
  const groups = categoryGroups.map(group => {
    const items = store.categories.filter(cat => {
      if (group.slugs.includes(cat.slug)) {
        matchedCategoryIds.add(cat.id)
        return true
      }
      return false
    })
    return { ...group, items }
  }).filter(group => group.items.length > 0)

  // 2. Gom các danh mục còn lại (không nằm trong danh sách trên) vào nhóm "Khác"
  const otherItems = store.categories.filter(cat => !matchedCategoryIds.has(cat.id))
  if (otherItems.length > 0) {
    groups.push({ name: 'Khác', items: otherItems })
  }

  return groups
})

// Tự động mở Group chứa danh mục hiện tại (dựa trên URL)
watch(
  [() => route.params.slug, groupedCategories], 
  ([currentSlug, groups]) => {
    if (currentSlug && groups.length > 0) {
      const targetGroup = groups.find(g => g.items.some(item => item.slug === currentSlug))
      if (targetGroup && activeGroup.value !== targetGroup.name) {
        activeGroup.value = targetGroup.name
      }
    } else if (!activeGroup.value && groups.length > 0) {
      // Mở mặc định nhóm đầu tiên nếu đang ở trang chủ/chưa chọn gì
      activeGroup.value = groups[0].name
    }
  }, 
  { immediate: true }
)

const toggleGroup = (name) => {
  activeGroup.value = activeGroup.value === name ? '' : name
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
    
    <aside class="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
      <div class="sticky top-24">
        <div class="bg-primary-600 text-white font-bold p-3 uppercase border-b border-primary-700 rounded-t shadow-sm">
          Sản phẩm in ấn
        </div>
        
        <div class="bg-white border text-sm border-gray-200 rounded-b shadow-sm overflow-hidden">
          <div v-if="store.loading" class="p-6 text-center flex flex-col items-center text-gray-400">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-primary-600 mb-2"></div>
            Đang tải...
          </div>
          
          <div v-else class="divide-y divide-gray-100 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div v-for="group in groupedCategories" :key="group.name">
              
              <button 
                @click="toggleGroup(group.name)"
                class="w-full px-4 py-3 text-left font-bold text-gray-800 hover:bg-gray-50 flex justify-between items-center focus:outline-none transition-colors"
                :class="{ 'bg-gray-50 text-primary-700': activeGroup === group.name }"
              >
                <span class="text-[13px] uppercase tracking-wider">{{ group.name }}</span>
                <svg 
                  class="w-4 h-4 text-gray-400 transition-transform duration-200"
                  :class="{ 'rotate-180 text-primary-600': activeGroup === group.name }"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <div 
                v-show="activeGroup === group.name" 
                class="bg-white pb-2"
              >
                <ul class="space-y-0.5">
                  <li v-for="category in group.items" :key="category.id">
                    <router-link 
                      :to="'/category/' + category.slug" 
                      class="block px-4 py-2 hover:bg-primary-50 hover:text-primary-700 transition-all truncate text-gray-600 font-medium pl-6 border-l-4 border-transparent"
                      active-class="bg-primary-50 text-primary-700 font-bold !border-primary-600"
                    >
                      {{ category.name }}
                    </router-link>
                  </li>
                </ul>
              </div>

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
/* Làm đẹp thanh cuộn */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>