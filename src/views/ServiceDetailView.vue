<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// import axios from 'axios'
import PriceCalculator from '../components/PriceCalculator.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import axios from '@/utils/axios'
const route = useRoute()
const service = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    // 1. ĐÃ SỬA: Gọi API trực tiếp vào Backend Python 
   const response = await axios.get(`/services/${route.params.slug}`)
    
    // In ra F12 để ông dễ dàng check xem Backend nhả data ra đủ bảng option và price chưa
    console.log("Dữ liệu Backend trả về nè:", response.data)
    
    service.value = response.data
  } catch (error) {
    console.error('Lỗi khi tải dịch vụ:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <MainLayout>
    <div class="min-h-screen py-12 px-4 bg-gray-50/50">
      
      <div v-if="loading" class="flex justify-center py-20">
         <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="service" class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div class="lg:col-span-2">
          <nav class="flex text-sm text-gray-500 mb-8 gap-2">
            <router-link to="/" class="hover:text-primary-600 transition-colors">Trang chủ</router-link>
            <span>/</span>
            <span class="text-gray-800 font-medium">{{ service.name }}</span>
          </nav>

          <h1 class="text-4xl font-extrabold text-gray-900 mb-6">{{ service.name }}</h1>
          
          <div v-if="service.image_url" class="mb-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white flex justify-center p-4">
            <img 
              :src="service.image_url" 
              :alt="service.name" 
              class="w-full max-w-2xl h-auto object-contain max-h-[450px] rounded-xl" 
              @error="$event.target.style.display='none'" 
            />
          </div>

          <div class="prose prose-primary max-w-none text-gray-600 leading-loose bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-lg mb-8 leading-relaxed">{{ service.description || 'Chưa có mô tả cho dịch vụ này.' }}</p>
            
            <h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">Quy cách in ấn</h2>
            <ul class="space-y-3 list-disc pl-5">
              <li>Kỹ thuật in: Offset/Kỹ thuật số chất lượng cao</li>
              <li>Thời gian hoàn thành: 2-3 ngày làm việc</li>
              <li>Giao hàng toàn quốc</li>
            </ul>

            <div class="mt-12 p-6 bg-primary-50 rounded-xl border border-primary-100 border-l-4">
              <h3 class="font-bold text-primary-800 mb-2">Lưu ý khi đặt in</h3>
              <p class="text-sm text-primary-700">Vui lòng kiểm tra kỹ file thiết kế (hệ màu CMYK, độ phân giải 300dpi) trước khi tải lên để đảm bảo chất lượng in tốt nhất.</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <PriceCalculator :service="service" />
        </div>
        
      </div>

      <div v-else class="text-center py-20">
         <h2 class="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy dịch vụ</h2>
         <p class="text-gray-500 mb-6">Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
         <router-link to="/" class="text-primary-600 font-bold hover:underline">Quay lại Trang chủ</router-link>
      </div>
    </div>
  </MainLayout>
</template>