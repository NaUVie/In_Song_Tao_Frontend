<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '../../stores/app'

const store = useAppStore()

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories()
  }
})

// Thuật toán chia cột cho Mega Menu
const categoryGroups = [
  { name: '🏢 Ấn phẩm Văn phòng', slugs: ['danh-thiep', 'bao-thu', 'bia-ho-so', 'giay-tieu-de', 'bieu-mau', 'ghi-chu', 'bia-dung-the-tu', 'bang-khen'] },
  { name: '📢 Quảng cáo & Marketing', slugs: ['to-roi-to-gap', 'catalogue', 'banner-poster', 'voucher-coupon', 'standee-de-ban', 'quat', 'buu-anh', 'phieu-tich-diem'] },
  { name: '📦 Tem Nhãn & Bao bì', slugs: ['hop-giay', 'tui-giay', 'nhan-decal', 'decal-giay', 'tem-bao-hanh', 'nhan-treo', 'nhan-co-chai', 'phieu-bao-hanh'] },
  { name: '🍽️ F&B (Nhà hàng)', slugs: ['menu', 'de-lot-ly', 'giay-lot-ban-an', 've-giu-xe'] },
  { name: '🎉 Sự kiện & Lễ Tết', slugs: ['cuoi-hoi-su-kien', 'thiep-cuoi', 'bao-li-xi', 'lich', 'photobook'] },
  { name: '✨ Dịch vụ Đặc biệt', slugs: ['thiet-ke-logo', 'in-nhanh', 'in-tren-nhua', 'inproof', 'color-chart'] }
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
</script>

<template>
  <nav class="bg-primary-700 text-white hidden md:block font-sans shadow-md relative z-40 border-b-2 border-red-600">
    <div class="max-w-7xl mx-auto px-4">
      <ul class="flex items-center text-[13px] font-bold uppercase tracking-wider">
        <li>
          <router-link to="/" class="block py-3 px-5 hover:bg-primary-600 transition" active-class="bg-primary-900 border-b-2 border-yellow-400">
            Trang chủ
          </router-link>
        </li>
        
        <li class="relative group cursor-pointer hover:bg-primary-600 transition">
          <div class="block py-3 px-5 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            Sản phẩm in ấn
          </div>
          
          <div class="absolute top-full left-0 w-[800px] bg-white text-gray-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border-t-2 border-red-600 rounded-b-lg">
            <div class="p-6">
              <div class="grid grid-cols-3 gap-6">
                <div v-for="group in groupedCategories" :key="group.name" class="flex flex-col">
                  <h3 class="text-sm font-black text-primary-700 uppercase tracking-wide mb-3 border-b border-gray-100 pb-2">
                    {{ group.name }}
                  </h3>
                  <ul class="space-y-1.5 flex-grow">
                    <li v-for="cat in group.items" :key="cat.id">
                      <router-link :to="'/category/' + cat.slug" class="block py-1 hover:text-red-600 hover:translate-x-1 transition-all text-xs font-medium capitalize text-gray-600">
                        {{ cat.name }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </li>

        <li><router-link to="/intro" class="block py-3 px-5 hover:bg-primary-600 transition border-l border-primary-600" active-class="bg-primary-900 border-b-2 border-yellow-400">Giới thiệu</router-link></li>
        <li><router-link to="/services" class="block py-3 px-5 hover:bg-primary-600 transition border-l border-primary-600" active-class="bg-primary-900 border-b-2 border-yellow-400">Dịch vụ in</router-link></li>
        <li><router-link to="/guide" class="block py-3 px-5 hover:bg-primary-600 transition border-l border-primary-600" active-class="bg-primary-900 border-b-2 border-yellow-400">Thiết kế</router-link></li>
        <li><router-link to="/news" class="block py-3 px-5 hover:bg-primary-600 transition border-l border-primary-600" active-class="bg-primary-900 border-b-2 border-yellow-400">Tin tức</router-link></li>
        <li><router-link to="/contact" class="block py-3 px-5 hover:bg-primary-600 transition border-l border-primary-600" active-class="bg-primary-900 border-b-2 border-yellow-400">Liên hệ</router-link></li>
      </ul>
    </div>
  </nav>
</template>