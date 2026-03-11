<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios' 
import MainLayout from '../components/layout/MainLayout.vue'
import { Package, Clock, ChevronRight, XCircle, Info } from 'lucide-vue-next'

const orders = ref([])
const loading = ref(true)

const fetchOrders = async () => {
  try {
    const response = await axios.get('/orders/my-orders')
    orders.value = response.data
  } catch (error) {
    console.error('Lỗi lấy lịch sử đơn hàng:', error)
  } finally {
    loading.value = false
  }
}

// 🔴 Cập nhật hàm formatOptions để "né" mọi loại lỗi dữ liệu
const formatOptions = (options) => {
  if (!options) return 'Tiêu chuẩn'
  let data = options
  if (typeof options === 'string') {
    try { data = JSON.parse(options) } catch (e) { return options }
  }
  if (typeof data !== 'object') return data
  return Object.entries(data)
    .filter(([key]) => key !== 'note' && key !== 'design_request') 
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ')
}

const getStatusStyle = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'completed': return 'bg-green-100 text-green-700 border-green-200'
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getStatusText = (status) => {
  const map = {
    'pending': 'Chờ duyệt',
    'processing': 'Đang xử lý',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy'
  }
  return map[status] || status
}

const formatDate = (dateStr) => {
  if (!dateStr) return '---'
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(fetchOrders)
</script>

<template>
  <MainLayout>
    <div class="min-h-screen py-12 px-4 bg-[#f8f9fa]">
      <div class="max-w-5xl mx-auto">
        
        <div class="flex items-end justify-between mb-10">
          <div>
            <h1 class="text-4xl font-black text-slate-900 flex items-center gap-3 italic uppercase tracking-tighter">
              <Package class="w-10 h-10 text-primary-600" />
              Lịch sử đơn hàng
            </h1>
            <p class="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Kiểm tra đơn hàng đã đặt</p>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center py-24">
          <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-r-transparent"></div>
        </div>

        <div v-else-if="orders.length === 0" class="bg-white p-20 rounded-[3rem] text-center shadow-xl border border-gray-100">
          <h2 class="text-2xl font-black uppercase italic text-slate-800 mb-2 text-center">Chưa có đơn nào!</h2>
          <router-link to="/" class="mt-6 inline-block bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-xs hover:bg-primary-600 transition-all">
            Quay lại trang chủ
          </router-link>
        </div>

        <div v-else class="space-y-8">
          <div v-for="order in orders" :key="order.id" 
               class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
            
            <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/30">
              <div class="flex items-center gap-6">
                <div class="px-6 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
                  <span class="text-[9px] font-black uppercase text-gray-400 block">Đơn số</span>
                  <span class="font-black text-xl text-primary-600">#{{ order.id }}</span>
                </div>
                <div>
                  <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock class="w-3 h-3" /> {{ formatDate(order.created_at) }}
                  </div>
                  <p class="text-2xl font-black text-slate-900 mt-1 tracking-tighter">{{ order.total_price.toLocaleString() }}đ</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span :class="['px-6 py-2 rounded-xl text-[10px] font-black uppercase border shadow-sm', getStatusStyle(order.status)]">
                  {{ getStatusText(order.status) }}
                </span>
                <button class="p-3 bg-white border border-gray-200 rounded-xl hover:bg-black hover:text-white transition-all">
                  <ChevronRight class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="p-8 space-y-4">
              <div v-for="item in order.items" :key="item.id" 
                   :class="[
                     'relative flex justify-between items-center p-5 rounded-3xl border transition-all',
                     item.service?.is_deleted ? 'bg-red-50/40 border-red-100 shadow-inner' : 'bg-white border-gray-100 hover:border-primary-200 shadow-sm'
                   ]">
                
                <div class="flex gap-4 items-start">
                  <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Info class="w-5 h-5 text-gray-300" />
                  </div>
                  
                  <div class="flex flex-col">
                    <div class="flex items-center gap-3">
                      <span :class="['font-black text-lg uppercase italic transition-all', item.service?.is_deleted ? 'text-gray-400 line-through' : 'text-slate-800']">
                        {{ item.service?.name || 'Dịch vụ đã gỡ bỏ' }}
                      </span>
                      
                      <div v-if="item.service?.is_deleted" 
                           class="flex items-center gap-1.5 text-[9px] font-black bg-red-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg animate-pulse">
                        <XCircle class="w-3 h-3" /> Ngừng kinh doanh
                      </div>
                    </div>
                    
                    <p class="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider italic">
                      {{ formatOptions(item.selected_options) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-8 text-right">
                  <div class="flex flex-col items-end">
                    <span class="text-[9px] font-black text-gray-300 uppercase">Số lượng</span>
                    <span class="font-black text-slate-700">x{{ item.quantity }}</span>
                  </div>
                  <div class="flex flex-col items-end min-w-[120px]">
                    <span class="text-[9px] font-black text-gray-300 uppercase">Thành tiền</span>
                    <span class="font-black text-primary-600 text-lg">{{ item.item_price.toLocaleString() }}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
/* Hiệu ứng hover cho toàn bộ khối order */
.group:hover {
  transform: translateY(-2px);
}
</style>