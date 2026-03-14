<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import { 
  Trash2, ArrowRight, ShoppingBag, 
  MapPin, User, Phone, CreditCard, RefreshCw
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()
const processing = ref(false)
const phoneError = ref('') // Lưu lỗi số điện thoại

// 1. KHAI BÁO FORM THÔNG TIN GIAO HÀNG
const shippingInfo = ref({
  recipient_name: '',
  phone_number: '',
  address: ''
})

// 2. TỰ ĐỘNG ĐIỀN THÔNG TIN NẾU ĐÃ ĐĂNG NHẬP
onMounted(() => {
  if (store.user) {
    shippingInfo.value.recipient_name = store.user.full_name || ''
    shippingInfo.value.phone_number = store.user.phone || ''
    shippingInfo.value.address = store.user.address || ''
  }
})

// HÀM XỬ LÝ SĐT (CHUẨN VN - ĐÚNG 10 SỐ)
const handlePhoneInput = (e) => {
  const originalValue = e.target.value
  
  // Lọc hết chữ, CHỈ GIỮ LẠI SỐ và CẮT TỐI ĐA 10 SỐ
  let numericValue = originalValue.replace(/\D/g, '').slice(0, 10)
  
  // Ép UI hiển thị đúng số đã lọc
  e.target.value = numericValue
  shippingInfo.value.phone_number = numericValue

  // LOGIC BÁO LỖI NGAY LẬP TỨC
  if (originalValue !== originalValue.replace(/\D/g, '')) {
    phoneError.value = 'Chỉ được nhập số !'
  } else if (numericValue.length > 0 && numericValue.length < 10) {
    phoneError.value = `Số điện thoại phải đúng 10 số!`
  } else {
    phoneError.value = '' // Đủ 10 số là tắt báo lỗi
  }
}

const subtotal = computed(() => {
  return store.cart.reduce((sum, item) => sum + item.totalPrice, 0)
})

const vat = computed(() => subtotal.value * 0.08)
const total = computed(() => subtotal.value + vat.value)

const checkout = async () => {
  if (!store.token) {
    alert('Vui lòng đăng nhập để thanh toán')
    router.push('/auth'); return
  }

  // KIỂM TRA TRỐNG THÔNG TIN
  if (!shippingInfo.value.recipient_name) {
    alert('Bạn chưa nhập tên người nhận!'); return
  }
  
  if (!shippingInfo.value.phone_number) {
    alert('Số điện thoại không được để trống!'); return
  }

  // Check cứng lại lần nữa trước khi gửi (ĐÚNG 10 SỐ)
  if (shippingInfo.value.phone_number.length !== 10) {
    alert('Số điện thoại không hợp lệ! Vui lòng nhập đủ 10 số.'); return
  }

  if (!shippingInfo.value.address) {
    alert('Vui lòng nhập địa chỉ nhận hàng!'); return
  }

  if (confirm('Xác nhận đặt hàng?')) {
    processing.value = true
    try {
      const items = store.cart.map(item => ({
        service_id: item.service.id,
        quantity: item.quantity,
        selected_options: {
          ...item.selectedOptions,
          design_request: item.designRequest,
          note: item.note
        },
        artwork_url: item.artwork_url || null 
      }))

      await store.checkout({ 
        items,
        ...shippingInfo.value 
      })
      
      alert('Đặt hàng thành công!')
      router.push('/') 
    } catch (error) {
      alert('Đặt hàng thất bại: ' + (error.response?.data?.detail || error.message))
    } finally {
      processing.value = false
    }
  }
}
</script>

<template>
  <MainLayout>
    <div class="min-h-screen py-12 px-4 bg-[#F8FAFC]">
      <div class="max-w-7xl mx-auto font-sans">
        <h1 class="text-4xl font-black text-slate-900 mb-10 flex items-center gap-4 uppercase italic tracking-tighter">
          <ShoppingBag class="w-10 h-10 text-red-600" />
          Giỏ hàng của bạn
        </h1>

        <div v-if="store.cart.length === 0" class="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm">
          <ShoppingBag class="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h2 class="text-2xl font-bold text-slate-800 mb-2">Giỏ hàng đang trống</h2>
          <p class="text-slate-400 mb-10 font-medium text-lg">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          <router-link to="/" class="bg-red-600 text-white px-10 py-4 rounded-full font-black uppercase text-sm hover:scale-105 transition-all shadow-xl shadow-red-200 inline-flex items-center gap-2">
            Tiếp tục mua sắm <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div class="lg:col-span-2 space-y-8">
            
            <div class="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
              <div class="flex items-center gap-3 border-b pb-4 border-red-50">
                <MapPin class="w-6 h-6 text-red-600" />
                <h3 class="text-xl font-black uppercase italic text-slate-800 tracking-tight">Thông tin nhận hàng</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Tên người nhận</label>
                  <div class="relative group">
                    <User class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    <input v-model="shippingInfo.recipient_name" type="text" placeholder="Họ và tên..." class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm text-slate-800">
                  </div>
                </div>
                
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Số điện thoại</label>
                  <div class="relative group">
                    <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    <input 
                      :value="shippingInfo.phone_number"
                      @input="handlePhoneInput"
                      type="tel" 
                      inputmode="numeric"
                      maxlength="10" 
                      placeholder="Nhập 10 số ĐT..." 
                      class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl focus:bg-white outline-none transition-all font-bold text-sm text-slate-800"
                      :class="phoneError ? 'border-red-300 bg-red-50/10' : 'border-transparent focus:border-red-500'"
                    >
                  </div>
                  <p v-if="phoneError" class="text-[10px] text-red-500 font-bold ml-2 italic animate-bounce">{{ phoneError }}</p>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Địa chỉ giao hàng</label>
                <div class="relative group">
                  <MapPin class="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <textarea v-model="shippingInfo.address" rows="2" placeholder="Địa chỉ chi tiết..." class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-red-500 outline-none transition-all font-bold text-sm text-slate-800 resize-none"></textarea>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div 
                v-for="(item, index) in store.cart" 
                :key="index"
                class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-red-100 transition-all"
              >
                <div class="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-inner">
                  <img :src="item.service.image_url || 'https://via.placeholder.com/150'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                </div>
                
                <div class="flex-grow">
                  <h3 class="text-lg font-black text-slate-900 mb-1 uppercase italic tracking-tight">{{ item.service.name }}</h3>
                  <div class="text-[11px] text-slate-500 space-y-1 font-bold uppercase">
                    <p>Số lượng: <span class="text-red-600 font-black">{{ item.quantity }}</span></p>
                    <p v-for="(val, key) in item.selectedOptions" :key="key" class="inline-block mr-4">
                      {{ key }}: <span class="text-slate-800">{{ val }}</span>
                    </p>
                  </div>
                </div>

                <div class="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                  <span class="text-2xl font-black text-slate-900 tracking-tighter">{{ item.totalPrice.toLocaleString() }}đ</span>
                  <button @click="store.removeFromCart(index)" class="text-slate-300 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full">
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-24 space-y-8">
              <h3 class="text-xl font-black uppercase italic tracking-tight text-slate-900">Chi tiết đơn hàng</h3>
              
              <div class="space-y-4 pb-6 border-b border-slate-50">
                <div class="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                  <span>Tạm tính</span>
                  <span class="text-slate-900 font-bold">{{ subtotal.toLocaleString() }}đ</span>
                </div>
                <div class="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                  <span>VAT (8%)</span>
                  <span class="text-slate-900 font-bold">{{ vat.toLocaleString() }}đ</span>
                </div>
              </div>

              <div class="space-y-6">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-black uppercase italic text-slate-900">Tổng cộng</span>
                  <span class="text-3xl font-black text-red-600 tracking-tighter">{{ total.toLocaleString() }}đ</span>
                </div>
                <div class="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center gap-3">
                  <CreditCard class="w-5 h-5 text-red-600" />
                  <span class="text-xs font-black uppercase text-slate-700">Giao hàng & Thu tiền (COD)</span>
                </div>
              </div>

              <button 
                @click="checkout"
                :disabled="processing"
                class="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95 disabled:opacity-50 flex justify-center items-center"
              >
                <RefreshCw v-if="processing" class="w-5 h-5 animate-spin mr-2" />
                {{ processing ? 'Đang gửi đơn...' : 'Xác nhận đặt đơn' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap');
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
</style>