<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '../../stores/app'
import { RouterView } from 'vue-router'

const store = useAppStore()
const activeGroup = ref('')

onMounted(() => {
  store.fetchCategories()
})

const categoryGroups = [
  {
    name: 'Ấn phẩm Văn phòng',
    slugs: ['danh-thiep', 'bao-thu', 'bia-ho-so', 'giay-tieu-de', 'bieu-mau', 'ghi-chu', 'bia-dung-the-tu', 'bang-khen']
  },
  {
    name: 'Quảng cáo & Marketing',
    slugs: ['to-roi-to-gap', 'catalogue', 'banner-poster', 'voucher-coupon', 'standee-de-ban', 'quat', 'buu-anh', 'phieu-tich-diem']
  },
  {
    name: 'Tem Nhãn & Bao bì',
    slugs: ['hop-giay', 'tui-giay', 'nhan-decal', 'decal-giay', 'tem-bao-hanh', 'nhan-treo', 'nhan-co-chai', 'phieu-bao-hanh']
  },
  {
    name: 'F&B (Nhà hàng)',
    slugs: ['menu', 'de-lot-ly', 'giay-lot-ban-an', 've-giu-xe']
  },
  {
    name: 'Sự kiện & Lễ Tết',
    slugs: ['cuoi-hoi-su-kien', 'thiep-cuoi', 'bao-li-xi', 'lich', 'photobook']
  },
  {
    name: 'Dịch vụ Đặc biệt',
    slugs: ['thiet-ke-logo', 'in-nhanh', 'in-tren-nhua', 'inproof', 'color-chart']
  }
]

const groupedCategories = computed(() => {
  if (!store.categories || store.categories.length === 0) return []

  return categoryGroups.map(group => {
    return {
      ...group,
      items: store.categories.filter(cat => group.slugs.includes(cat.slug))
    }
  }).filter(group => group.items.length > 0)
})

const toggleGroup = (name) => {
  activeGroup.value = activeGroup.value === name ? '' : name
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
    <aside class="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
      <div class="bg-primary-600 text-white font-bold p-3 uppercase border-b-2 border-primary-700 rounded-t-lg">
        Sản phẩm in ấn
      </div>
      <div class="bg-white border text-sm border-gray-200 rounded-b-lg shadow-sm">
        <div v-if="store.loading" class="p-4 text-center text-gray-500">Đang tải danh mục...</div>
        
        <div v-else class="divide-y divide-gray-100">
          <div v-for="group in groupedCategories" :key="group.name">
            <button 
              @click="toggleGroup(group.name)"
              class="w-full px-4 py-3 text-left font-bold text-gray-700 hover:bg-gray-50 flex justify-between items-center focus:outline-none"
            >
              <span class="text-[13px] uppercase tracking-wider">{{ group.name }}</span>
              <span class="text-gray-400 font-normal text-lg leading-none">{{ activeGroup === group.name ? '-' : '+' }}</span>
            </button>
            <ul v-show="activeGroup === group.name" class="bg-gray-50 pb-2">
              <li v-for="category in group.items" :key="category.id">
                <router-link 
                  :to="'/category/' + category.slug" 
                  class="block px-4 py-2 hover:bg-white hover:text-primary-600 transition truncate text-gray-600 font-medium pl-6"
                  active-class="bg-white text-blue-700 font-bold border-l-4 border-blue-500"
                >
                  {{ category.name }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>
        
      </div>
    </aside>

    <main class="w-full md:w-3/4 lg:w-4/5 flex-grow">
      <slot></slot>
    </main>
  </div>
</template>