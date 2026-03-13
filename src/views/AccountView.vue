<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, Package, LogOut, Mail, Phone, MapPin, 
  Edit2, Loader2, ChevronRight, X, PenTool, FileText, Image as ImageIcon, XCircle 
} from 'lucide-vue-next'
import MainLayout from '../components/layout/MainLayout.vue'
import axios from '@/utils/axios'

const router = useRouter()
const activeTab = ref('profile') 
const loadingOrders = ref(false)

const isDetailOpen = ref(false)
const selectedOrder = ref(null)

const openOrderDetail = (order) => {
  selectedOrder.value = order
  isDetailOpen.value = true
}

const closeOrderDetail = () => {
  isDetailOpen.value = false
  selectedOrder.value = null
}

const filterOptions = (options) => {
  if (!options) return {}
  const filtered = { ...options }
  delete filtered.design_request
  delete filtered.note
  return filtered
}

const userInfo = ref({
  full_name: '',
  email: '',
  phone: '',
  address: ''
})

const myOrders = ref([])

const fetchMyOrders = async () => {
  loadingOrders.value = true
  try {
    const response = await axios.get('/orders/my')
    myOrders.value = response.data
  } catch (error) {
    console.error("Lỗi lấy lịch sử đơn hàng:", error)
  } finally {
    loadingOrders.value = false
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'orders' && myOrders.value.length === 0) {
    fetchMyOrders()
  }
})

onMounted(() => {
  const jwtToken = localStorage.getItem('token')
  if (!jwtToken) {
    router.push('/auth')
    return
  }

  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (savedUser) {
      userInfo.value = {
        full_name: savedUser.full_name || savedUser.name, 
        email: savedUser.email,
        phone: savedUser.phone,
        address: savedUser.address || 'Chưa cập nhật'
      }
    }
  } catch (error) {
    console.error("Lỗi đọc thông tin user")
  }
  
  if (activeTab.value === 'orders') fetchMyOrders()
})

const handleLogout = () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('auth-change'))
    router.push('/') 
  }
}

const getStatusLabel = (status) => {
  const map = {
    'pending': { text: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-700' },
    'processing': { text: 'Đang xử lý', class: 'bg-blue-100 text-blue-700' },
    'completed': { text: 'Đã giao hàng', class: 'bg-green-100 text-green-700' },
    'cancelled': { text: 'Đã hủy', class: 'bg-red-100 text-red-700' }
  }
  return map[status] || { text: status, class: 'bg-gray-100 text-gray-700' }
}
</script>

<template>
  <MainLayout>
    <div class="bg-gray-50 min-h-screen pb-12 font-sans">
      <div class="bg-white border-b border-gray-200 py-6 mb-8 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 flex items-center gap-4">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black text-2xl uppercase shadow-sm border border-red-200">
            {{ userInfo.full_name ? userInfo.full_name.charAt(0) : 'U' }}
          </div>
          <div>
            <h1 class="text-2xl font-black text-gray-900">Xin chào, {{ userInfo.full_name || 'Khách hàng' }}!</h1>
            <p class="text-sm text-gray-500 mt-1 tracking-tight">Cảm ơn quý khách đã đồng hành cùng In ClickIn</p>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        <div class="w-full md:w-64 flex-shrink-0">
          <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <button @click="activeTab = 'profile'" :class="['w-full flex items-center gap-3 px-6 py-4 text-left font-bold transition-all border-l-4', activeTab === 'profile' ? 'bg-red-50 text-red-700 border-red-600' : 'text-gray-600 border-transparent hover:bg-gray-50']">
              <User class="w-5 h-5" /> Thông tin cá nhân
            </button>
            <button @click="activeTab = 'orders'" :class="['w-full flex items-center gap-3 px-6 py-4 text-left font-bold transition-all border-l-4 border-t border-t-gray-100', activeTab === 'orders' ? 'bg-red-50 text-red-700 border-red-600' : 'text-gray-600 border-transparent hover:bg-gray-50']">
              <Package class="w-5 h-5" /> Lịch sử đơn hàng
            </button>
            <button @click="handleLogout" class="w-full flex items-center gap-3 px-6 py-4 text-left font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border-t border-gray-100 border-l-4 border-transparent">
              <LogOut class="w-5 h-5" /> Đăng xuất
            </button>
          </div>
        </div>

        <div class="flex-grow">
          <div v-if="activeTab === 'profile'" class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight">Hồ sơ cá nhân</h2>
              <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                <Edit2 class="w-4 h-4" /> Chỉnh sửa
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm shrink-0"><User class="w-5 h-5" /></div>
                <div><div class="text-xs text-gray-400 font-bold uppercase mb-1">Họ và tên</div><div class="text-gray-900 font-bold">{{ userInfo.full_name || 'Chưa cập nhật' }}</div></div>
              </div>
              <div class="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm shrink-0"><Mail class="w-5 h-5" /></div>
                <div><div class="text-xs text-gray-400 font-bold uppercase mb-1">Email</div><div class="text-gray-900 font-bold">{{ userInfo.email }}</div></div>
              </div>
              <div class="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm shrink-0"><Phone class="w-5 h-5" /></div>
                <div><div class="text-xs text-gray-400 font-bold uppercase mb-1">Số điện thoại</div><div class="text-gray-900 font-bold">{{ userInfo.phone || 'Chưa cập nhật' }}</div></div>
              </div>
              <div class="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm shrink-0"><MapPin class="w-5 h-5" /></div>
                <div><div class="text-xs text-gray-400 font-bold uppercase mb-1">Địa chỉ nhận hàng</div><div class="text-gray-900 font-bold">{{ userInfo.address || 'Chưa cập nhật' }}</div></div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'orders'" class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight">Lịch sử đơn hàng</h2>
              <button @click="fetchMyOrders" class="text-sm text-gray-400 hover:text-red-600 flex items-center gap-1">Làm mới</button>
            </div>
            
            <div v-if="loadingOrders" class="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 class="w-10 h-10 animate-spin mb-4 text-red-500" /><p class="font-medium">Đang tải đơn hàng...</p>
            </div>

            <div v-else-if="myOrders.length === 0" class="p-20 text-center flex flex-col items-center">
              <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-200"><Package class="w-10 h-10 text-gray-300" /></div>
              <p class="text-gray-500 font-medium">Bạn chưa đặt đơn nào hết á.</p>
              <router-link to="/" class="mt-4 text-red-600 font-bold hover:underline">Đi mua sắm ngay thôi!</router-link>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-[0.1em] font-black">
                    <th class="px-8 py-5">Mã đơn</th>
                    <th class="px-8 py-5">Sản phẩm tiêu biểu</th>
                    <th class="px-8 py-5">Tổng tiền</th>
                    <th class="px-8 py-5 text-center">Trạng thái</th>
                    <th class="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="order in myOrders" :key="order.id" class="hover:bg-gray-50 transition-all group cursor-pointer" @click="openOrderDetail(order)">
                    <td class="px-8 py-6 font-black text-gray-900 text-lg">#{{ order.id }}</td>
                    <td class="px-8 py-6">
                      <div class="flex flex-col">
                        <div class="text-sm font-bold flex items-center gap-2" :class="order.items[0]?.service?.is_deleted ? 'text-gray-400' : 'text-gray-700'">
                          {{ order.items && order.items.length > 0 ? (order.items[0].service?.name || 'Sản phẩm #' + order.items[0].service_id) : 'N/A' }}
                          
                          <span v-if="order.items[0]?.service?.is_deleted" class="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black uppercase">Ngừng</span>
                          
                          <span v-if="order.items.length > 1" class="text-gray-400 font-normal ml-1">(+{{ order.items.length - 1 }} món khác)</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-8 py-6 font-black text-red-600 text-lg">{{ order.total_price.toLocaleString() }}đ</td>
                    <td class="px-8 py-6 text-center">
                      <span :class="['px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm', getStatusLabel(order.status).class]">
                        {{ getStatusLabel(order.status).text }}
                      </span>
                    </td>
                    <td class="px-8 py-6 text-right">
                      <button class="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                        <ChevronRight class="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isDetailOpen && selectedOrder" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="closeOrderDetail">
      <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div class="bg-red-600 p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 class="text-xl font-black uppercase tracking-tight">Chi tiết đơn #{{ selectedOrder.id }}</h3>
            <p class="text-[10px] opacity-80 mt-1 font-black tracking-[0.2em] uppercase">Trạng thái: {{ getStatusLabel(selectedOrder.status).text }}</p>
          </div>
          <button @click="closeOrderDetail" class="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
          <div class="space-y-6">
            <div v-for="item in selectedOrder.items" :key="item.id" class="border border-gray-100 bg-white rounded-3xl p-6 shadow-sm">
              <div class="flex gap-5 items-start mb-6">
                <div :class="['w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-2', item.service?.is_deleted ? 'grayscale opacity-40' : '']">
                  <img v-if="item.service?.image_url" :src="item.service.image_url" class="w-full h-full object-contain" />
                  <ImageIcon v-else class="w-8 h-8 text-gray-200" />
                </div>

                <div class="flex-1">
                  <div class="flex flex-wrap items-center gap-3 mb-2">
                    <h4 :class="['font-black text-lg uppercase leading-none', item.service?.is_deleted ? 'text-gray-400 line-through' : 'text-gray-900']">
                      {{ item.service?.name || 'Sản phẩm #' + item.service_id }}
                    </h4>
                    
                    <span v-if="item.service?.is_deleted" class="bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter animate-pulse shadow-md">
                      Ngừng kinh doanh
                    </span>
                  </div>

                  <div class="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <Package class="w-4 h-4" /> Số lượng: {{ item.quantity.toLocaleString() }}
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-red-600 font-black text-xl">{{ item.item_price.toLocaleString() }}đ</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-6">
                <div v-for="(val, key) in filterOptions(item.selected_options)" :key="key" class="bg-gray-50/50 px-4 py-3 rounded-2xl border border-gray-100">
                  <span class="text-[9px] text-gray-400 font-black uppercase block leading-none mb-1 tracking-widest">{{ key }}</span>
                  <span class="text-sm font-bold text-gray-800">{{ val }}</span>
                </div>
              </div>

              <div class="space-y-3 pt-4 border-t border-dashed border-gray-100">
                <div v-if="item.selected_options?.design_request" class="flex items-center gap-2 text-purple-600 text-[10px] font-black uppercase bg-purple-50 px-3 py-2 rounded-lg inline-flex">
                  <PenTool class="w-4 h-4" /> Có yêu cầu thiết kế (+200k)
                </div>
                <div v-if="item.selected_options?.note" class="flex items-start gap-2 text-sm text-gray-600 italic bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <FileText class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span class="leading-relaxed">"{{ item.selected_options.note }}"</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-8 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
          <div class="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Tổng thanh toán:</div>
          <div class="text-3xl font-black text-red-600">{{ selectedOrder.total_price.toLocaleString() }}đ</div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.animate-in { animation: modalIn 0.3s ease-out; }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.line-through { text-decoration: line-through; }
</style>