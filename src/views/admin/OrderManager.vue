<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios' 
import { RefreshCw, X, ImageIcon, UploadCloud, ChevronRight, FileText } from 'lucide-vue-next'

const orders = ref([])
const loading = ref(true)
const selectedOrder = ref(null)
const showDetailModal = ref(false)

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

const formatOptions = (options) => {
  if (!options) return 'Không có tùy chọn gia công'
  return Object.entries(options).map(([key, val]) => `${key}: ${val}`).join(' | ')
}

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'printing': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'completed': return 'bg-green-100 text-green-700 border-green-200'
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto font-sans">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Quản lý Đơn hàng</h1>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Hệ thống vận hành xưởng TYD v3.0</p>
      </div>
      <button @click="fetchOrders" class="p-3 bg-white shadow-sm border rounded-2xl text-red-600 hover:shadow-md transition-all active:scale-90">
        <RefreshCw :class="['w-6 h-6', loading ? 'animate-spin' : '']" />
      </button>
    </div>

    <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
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
                <RefreshCw class="w-10 h-10 animate-spin mx-auto text-red-200" />
                <p class="mt-4 text-xs font-bold text-gray-300 uppercase italic">Đang bốc dữ liệu...</p>
             </td>
          </tr>
          <tr v-for="order in orders" :key="order.id" 
              class="group hover:bg-red-50/20 transition-all cursor-pointer relative"
              @click="openOrderDetail(order)">
            <td class="px-8 py-6">
              <span class="font-black text-lg text-slate-900 leading-none">#{{ order.id }}</span>
              <p class="text-[9px] font-mono text-gray-400 mt-1 uppercase">{{ new Date().toLocaleDateString('vi-VN') }}</p>
            </td>
            <td class="px-8 py-6">
              <p class="font-black text-sm uppercase text-slate-800">{{ order.user?.full_name || 'Khách vãng lai' }}</p>
              <p class="text-xs font-medium text-gray-500">{{ order.user?.phone || 'N/A' }}</p>
            </td>
            <td class="px-8 py-6">
              <p class="font-black text-red-600 text-base">{{ order.total_price.toLocaleString() }}đ</p>
              <p class="text-[9px] font-bold text-gray-400 uppercase italic">Đã bao gồm VAT</p>
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

    <div v-if="showDetailModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div class="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-modal-in">
        
        <div class="p-10 border-b flex justify-between items-center bg-gray-50/50">
          <div class="flex items-center gap-5">
            <div class="p-4 bg-black rounded-2xl text-white">
              <FileText class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Chi tiết đơn #{{ selectedOrder.id }}</h3>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">{{ selectedOrder.status }}</span>
                <span class="text-[10px] font-bold text-gray-400 uppercase italic">Khách hàng: {{ selectedOrder.user?.full_name }}</span>
              </div>
            </div>
          </div>
          <button @click="showDetailModal = false" class="p-4 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-gray-200">
            <X class="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div v-for="item in selectedOrder.items" :key="item.id" class="group bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 hover:border-red-500/30 transition-all shadow-sm">
            <div class="flex gap-8">
              <div class="w-32 h-32 rounded-3xl bg-gray-50 border overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <img v-if="item.service?.image_url" :src="item.service.image_url" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon class="w-10 h-10" /></div>
              </div>

        <div class="flex-1 space-y-4">
  <div class="flex justify-between items-start">
    <div>
      <h4 class="font-black text-xl uppercase italic text-gray-900 leading-none mb-1">{{ item.service?.name || 'Dịch vụ đã xóa' }}</h4>
      <p class="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-tighter">SKU: TYD-{{ item.service_id }}-{{ item.id }}</p>
    </div>
    <div class="text-right">
      <p class="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Đơn giá/Cái (Gồm gia công)</p>
      <span class="text-lg font-black text-blue-600">
        {{ Math.round(item.item_price / item.quantity).toLocaleString() }}đ
      </span>
    </div>
  </div>
  
  <div class="grid grid-cols-3 gap-4">
    <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <p class="text-[9px] font-black text-gray-400 uppercase mb-1">Số lượng đặt</p>
      <p class="text-base font-black text-slate-800">{{ item.quantity.toLocaleString() }} <span class="text-[10px] text-gray-400 font-bold">cái</span></p>
    </div>
    <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <p class="text-[9px] font-black text-red-400 uppercase mb-1 tracking-widest italic">Thành tiền món này</p>
      <p class="text-base font-black text-red-600">{{ item.item_price.toLocaleString() }}đ</p>
    </div>
    <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <p class="text-[9px] font-black text-gray-400 uppercase mb-1">Trạng thái kho</p>
      <p class="text-[10px] font-black text-green-600 uppercase italic">Sẵn sàng in</p>
    </div>
  </div>

  <div class="space-y-3">
  <p class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
    <Layers class="w-3 h-3" /> Chi tiết yêu cầu gia công
  </p>
  
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div v-for="(value, key) in item.selected_options" :key="key" 
      class="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100 group/opt hover:bg-blue-100/50 transition-all">
      
      <div class="flex flex-col">
        <span class="text-[9px] font-black text-blue-400 uppercase tracking-tighter">{{ key }}</span>
        <span class="text-sm font-black text-blue-900 italic">{{ value }}</span>
      </div>
      
      <div class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
        <Check class="w-3 h-3" stroke-width="4" />
      </div>
    </div>

    <div v-if="selectedOrder.note" class="col-span-full bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
      <p class="text-[9px] font-black text-yellow-600 uppercase mb-1">Ghi chú từ khách:</p>
      <p class="text-xs font-bold text-yellow-900 italic">"{{ selectedOrder.note }}"</p>
    </div>
  </div>
</div>


                <div v-if="item.artwork_url" class="pt-2">
                  <a :href="item.artwork_url" target="_blank" class="w-full inline-flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95 group/btn">
                    <UploadCloud class="w-5 h-5 group-hover/btn:-translate-y-1 transition-transform" /> Tải file thiết kế gốc
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-10 bg-gray-50 border-t flex justify-between items-center">
          <div class="flex items-center gap-6">
            <div class="w-14 h-14 bg-white rounded-2xl border flex items-center justify-center text-red-600 shadow-sm">
              <Tag class="w-6 h-6" />
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng thanh toán đơn hàng</p>
              <p class="text-4xl font-black text-red-600 tracking-tighter leading-none mt-1">{{ selectedOrder.total_price.toLocaleString() }}đ</p>
            </div>
          </div>
          <button @click="showDetailModal = false" class="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all">Đóng chi tiết</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
.animate-modal-in { animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.9) translateY(40px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>