<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/utils/axios' 
import { 
  RefreshCw, X, ImageIcon, DownloadCloud, ChevronRight, FileText, 
  Layers, Check, Tag, Loader2, ChevronLeft, ChevronRight as ChevronRightIcon, Calendar, Eye,
  MapPin 
} from 'lucide-vue-next'

const orders = ref([])
const loading = ref(true)
const selectedOrder = ref(null)
const showDetailModal = ref(false)

// PHÂN TRANG & BỘ LỌC
const currentPage = ref(1)
const itemsPerPage = 10
const startDate = ref('')
const endDate = ref('')

/** * 🛠 LOGIC LINK TƯƠNG ĐỐI (KHÔNG DÙNG LINK CỨNG)
 * Chạy local nhờ proxy trong vite.config.js
 * Chạy deploy nhờ rewrites trong vercel.json
 */

// 1. Hàm lấy link XEM (Dùng cho ảnh sản phẩm qua /static)
const getPreviewUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // Đảm bảo luôn bắt đầu bằng dấu / (ví dụ: /static/uploads/...)
  return url.startsWith('/') ? url : `/${url}`
}

// 2. Hàm lấy link TẢI (Dùng cho Artwork qua /api)
const getDownloadUrl = (url) => {
  if (!url) return ''
  const filename = url.split('/').pop()
  // Gọi trực tiếp qua endpoint tương đối
  return `/api/admin/download-artwork/${filename}`
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await axios.get('/admin/orders')
    orders.value = response.data
  } catch (error) {
    console.error('Lỗi bốc đơn hàng:', error)
  } finally {
    loading.value = false
  }
}

// XỬ LÝ LỌC & PHÂN TRANG
const filteredOrders = computed(() => {
  let result = [...orders.value]
  if (startDate.value) {
    result = result.filter(o => new Date(o.created_at) >= new Date(startDate.value))
  }
  if (endDate.value) {
    const end = new Date(endDate.value)
    end.setHours(23, 59, 59)
    result = result.filter(o => new Date(o.created_at) <= end)
  }
  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage) || 1)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredOrders.value.slice(start, start + itemsPerPage)
})

const handleFilterChange = () => {
  currentPage.value = 1
}

const openOrderDetail = (order) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

const updateStatus = async (orderId, newStatus) => {
  try {
    await axios.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
    const order = orders.value.find(o => o.id === orderId)
    if (order) order.status = newStatus
  } catch (error) {
    alert('Lỗi cập nhật!')
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200'
    case 'printing': return 'bg-blue-50 text-blue-600 border-blue-200'
    case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-200'
    case 'completed': return 'bg-green-50 text-green-600 border-green-200'
    case 'cancelled': return 'bg-red-50 text-red-600 border-red-200'
    default: return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="p-4 max-w-7xl mx-auto font-sans min-h-screen bg-[#F8FAFC]">
    
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Quản lý Đơn hàng</h1>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Hệ thống vận hành xưởng ClickIn</p>
      </div>
      <button @click="fetchOrders" class="p-3 bg-white shadow-sm border rounded-2xl text-red-600 hover:shadow-md transition-all active:scale-90">
        <RefreshCw :class="['w-6 h-6', loading ? 'animate-spin' : '']" />
      </button>
    </div>

    <div class="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm mb-8 flex flex-wrap items-center gap-6">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-slate-100 rounded-xl text-slate-500"><Calendar class="w-5 h-5"/></div>
        <span class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lọc theo ngày</span>
      </div>
      
      <div class="flex items-center gap-2">
        <input type="date" v-model="startDate" @change="handleFilterChange" 
          class="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"/>
        <span class="text-gray-300 font-bold">→</span>
        <input type="date" v-model="endDate" @change="handleFilterChange"
          class="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"/>
      </div>

      <button v-if="startDate || endDate" @click="startDate = ''; endDate = ''; handleFilterChange()" 
        class="text-[10px] font-black text-red-500 uppercase hover:underline">Xóa lọc</button>
    </div>

    <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-gray-100 overflow-hidden flex flex-col">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <th class="px-8 py-5">Đơn hàng</th>
              <th class="px-8 py-5">Thông tin khách</th>
              <th class="px-8 py-5">Thanh toán</th>
              <th class="px-8 py-5">Trạng thái</th>
              <th class="px-8 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading">
               <td colspan="5" class="px-8 py-24 text-center">
                  <Loader2 class="w-10 h-10 animate-spin mx-auto text-red-200 mb-4" />
                  <p class="text-xs font-bold text-gray-300 uppercase italic">Đang bốc dữ liệu...</p>
               </td>
            </tr>
            <tr v-else-if="paginatedOrders.length === 0">
               <td colspan="5" class="px-8 py-20 text-center text-gray-300 uppercase font-black italic text-sm">Không có đơn hàng nào</td>
            </tr>
            <tr v-for="order in paginatedOrders" :key="order.id" 
                class="group hover:bg-red-50/20 transition-all cursor-pointer"
                @click="openOrderDetail(order)">
              <td class="px-8 py-6">
                <span class="font-black text-lg text-slate-900 leading-none group-hover:text-red-600">#{{ order.id }}</span>
                <p class="text-[9px] font-mono text-gray-400 mt-1 uppercase">{{ new Date(order.created_at).toLocaleDateString('vi-VN') }}</p>
              </td>
              <td class="px-8 py-6">
                <p class="font-black text-sm uppercase text-slate-800">{{ order.user?.full_name || 'Khách vãng lai' }}</p>
                <p class="text-xs font-medium text-gray-500">{{ order.user?.phone || 'N/A' }}</p>
              </td>
              <td class="px-8 py-6">
                <p class="font-black text-red-600 text-base">{{ order.total_price.toLocaleString() }}đ</p>
              </td>
              <td class="px-8 py-6">
                <span class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all" :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-8 py-6 text-right" @click.stop>
                <select 
                  :value="order.status"
                  @change="updateStatus(order.id, $event.target.value)"
                  class="text-[10px] font-black uppercase border-2 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm cursor-pointer hover:border-red-200 transition-all"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="printing">Đang in</option>
                  <option value="shipped">Đã gửi</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Hủy đơn</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 bg-gray-50/50 border-t flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Trang {{ currentPage }} / {{ totalPages }}
        </p>
        <div class="flex items-center gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" 
            class="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button @click="currentPage++" :disabled="currentPage >= totalPages" 
            class="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm">
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div class="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-modal-in">
        <div class="p-10 border-b flex justify-between items-center bg-gray-50/50">
          <div class="flex items-center gap-5">
            <div class="p-4 bg-black rounded-2xl text-white"><FileText class="w-6 h-6" /></div>
            <h3 class="text-3xl font-black uppercase italic tracking-tighter">Đơn #{{ selectedOrder.id }}</h3>
          </div>
          <button @click="showDetailModal = false" class="p-4 hover:bg-red-600 hover:text-white rounded-full transition-all transform hover:rotate-90"><X class="w-6 h-6 text-gray-400 hover:text-white" /></button>
        </div>

        <div class="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div class="bg-blue-50/50 rounded-[2.5rem] p-8 border border-blue-100 shadow-inner">
            <div class="flex items-center gap-2 mb-6">
              <MapPin class="w-5 h-5 text-blue-600" />
              <h4 class="text-sm font-black uppercase tracking-widest text-slate-800">Thông tin giao hàng</h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase mb-1">Người nhận</p>
                <p class="text-sm font-black text-slate-900 uppercase">{{ selectedOrder.recipient_name || selectedOrder.user?.full_name || 'Khách vãng lai' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase mb-1">Số điện thoại</p>
                <p class="text-sm font-black text-red-600">{{ selectedOrder.phone_number || selectedOrder.user?.phone || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-400 uppercase mb-1">Địa chỉ</p>
                <p class="text-sm font-bold text-slate-700 leading-relaxed">{{ selectedOrder.address || 'Nhận tại xưởng' }}</p>
              </div>
            </div>
          </div>

          <div v-for="item in selectedOrder.items" :key="item.id" class="group bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 hover:border-red-500/30 transition-all shadow-sm">
            <div class="flex flex-col md:flex-row gap-8">
              <div class="w-32 h-32 rounded-3xl bg-gray-50 border overflow-hidden shrink-0">
                <img v-if="item.service?.image_url" :src="getPreviewUrl(item.service.image_url)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon class="w-10 h-10" /></div>
              </div>
              <div class="flex-1 space-y-4">
                <h4 class="font-black text-xl uppercase italic text-gray-900 leading-none mb-1">{{ item.service?.name || 'Dịch vụ đã xóa' }}</h4>
                
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p class="text-[9px] font-black text-gray-400 uppercase mb-1">Số lượng</p>
                    <p class="text-base font-black">{{ item.quantity.toLocaleString() }} <span class="text-xs">cái</span></p>
                  </div>
                  <div class="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p class="text-[9px] font-black text-red-400 uppercase mb-1">Thành tiền</p>
                    <p class="text-base font-black text-red-600">{{ item.item_price.toLocaleString() }}đ</p>
                  </div>
                </div>

                <div class="space-y-3">
                  <p class="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2"><Layers class="w-3 h-3" /> Chi tiết gia công</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div v-for="(value, key) in item.selected_options" :key="key" class="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <div class="flex flex-col">
                        <span class="text-[9px] font-black text-blue-400 uppercase">{{ key }}</span>
                        <span class="text-sm font-black text-blue-900 italic">{{ value }}</span>
                      </div>
                      <Check class="w-4 h-4 text-blue-500" stroke-width="4" />
                    </div>
                  </div>
                </div>
                
                <div v-if="item.artwork_url" class="pt-2 flex flex-col sm:flex-row gap-3">
                  <a :href="getPreviewUrl(item.artwork_url)" target="_blank" class="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-slate-900 text-slate-900 py-3 rounded-2xl text-[11px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">
                    <Eye class="w-4 h-4" /> Xem file
                  </a>
                  <a :href="getDownloadUrl(item.artwork_url)" download class="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-2xl text-[11px] font-black uppercase hover:bg-slate-900 transition-all shadow-xl">
                    <DownloadCloud class="w-4 h-4" /> Tải về máy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-10 bg-gray-50 border-t flex justify-between items-center">
          <div class="flex items-center gap-6">
            <div class="w-14 h-14 bg-white rounded-2xl border flex items-center justify-center text-red-600 shadow-sm"><Tag class="w-6 h-6" /></div>
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase">Tổng cộng</p>
              <p class="text-4xl font-black text-red-600 tracking-tighter">{{ selectedOrder.total_price.toLocaleString() }}đ</p>
            </div>
          </div>
          <button @click="showDetailModal = false" class="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all">Đóng</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap');
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
.animate-modal-in { animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(40px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>