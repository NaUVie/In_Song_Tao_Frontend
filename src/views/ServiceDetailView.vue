<script setup>
import { ref, onMounted, watch } from 'vue' // 👉 THÊM watch
import { useRoute } from 'vue-router'
import PriceCalculator from '../components/PriceCalculator.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import axios from '@/utils/axios'

const route = useRoute()
const service = ref(null)
const loading = ref(true)

// 👉 TÁCH HÀM LẤY DATA RA ĐỂ GỌI ĐI GỌI LẠI ĐƯỢC
const fetchService = async (slug) => {
  if (!slug) return
  loading.value = true
  try {
    const response = await axios.get(`/services/${slug}`)
    service.value = response.data
  } catch (error) {
    console.error('Lỗi khi tải dịch vụ:', error)
    service.value = null // Reset lại nếu lỗi (nhập sai URL)
  } finally {
    loading.value = false
  }
}

// 1. Gọi lần đầu khi mới vào trang
onMounted(() => {
  fetchService(route.params.slug)
})

// 2. 👉 THEO DÕI URL: Nếu URL đổi (bấm vào icon Bế Tròn, Bo Góc...), lập tức load lại data!
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    fetchService(newSlug)
  }
})
</script>

<template>
  <MainLayout>
    <div class="bg-white min-h-screen pb-24 font-sans text-[#333333] text-[14px] overflow-x-hidden">
      
      <div v-if="loading" class="flex justify-center py-20">
         <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-[#4b8df8]"></div>
      </div>

      <div v-else-if="service" class="max-w-[1150px] mx-auto px-4 md:px-0 mt-6">
        
        <ul class="flex items-center text-[13px] text-[#333333] mb-4 gap-2 bg-transparent">
          <li><router-link to="/" class="hover:underline">Trang chủ</router-link></li>
          <li>/</li>
          <li><router-link to="/services" class="hover:underline">Sản phẩm in</router-link></li>
          <li>/</li>
          <li class="font-bold">{{ service.name }}</li>
        </ul>

        <PriceCalculator :service="service" />

      </div>

      <div v-else class="text-center py-20 max-w-[1150px] mx-auto">
         <h2 class="text-[18px] font-bold text-[#6d6e71] mb-2 uppercase tracking-[2px]">Không tìm thấy dịch vụ</h2>
         <router-link to="/" class="text-[#4b8df8] font-bold hover:underline">Quay lại Trang chủ</router-link>
      </div>

    </div>
  </MainLayout>
</template>