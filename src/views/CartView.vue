<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()
const processing = ref(false)

const subtotal = computed(() => {
  return store.cart.reduce((sum, item) => sum + item.totalPrice, 0)
})

const vat = computed(() => subtotal.value * 0.08)
const total = computed(() => subtotal.value + vat.value)

const checkout = async () => {
  if (!store.token) {
    alert('Vui lòng đăng nhập để thanh toán')
    router.push('/auth')
    return
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
        artwork_url: null // Todo: Implement file upload
      }))

      await store.checkout({ items })
      alert('Đặt hàng thành công!')
      router.push('/') // Redirect to order history/list
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
    <div class="min-h-screen py-12 px-4 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag class="w-8 h-8 text-primary-600" />
          Giỏ hàng của bạn
        </h1>

        <div v-if="store.cart.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <ShoppingBag class="w-10 h-10" />
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Giỏ hàng đang trống</h2>
          <p class="text-gray-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          <router-link to="/" class="bg-primary-600 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-700 transition inline-flex items-center gap-2">
            Tiếp tục mua sắm <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-6">
            <div 
              v-for="(item, index) in store.cart" 
              :key="index"
              class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center"
            >
              <div class="w-full md:w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  :src="item.service.image || 'https://via.placeholder.com/150'" 
                  alt="Service Image" 
                  class="w-full h-full object-cover"
                >
              </div>
              
              <div class="flex-grow">
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ item.service.name }}</h3>
                <div class="text-sm text-gray-500 space-y-1">
                  <p>Số lượng: <span class="font-medium text-gray-800">{{ item.quantity }}</span></p>
                  <p v-for="(val, key) in item.selectedOptions" :key="key">
                    {{ key }}: <span class="font-medium text-gray-800">{{ val }}</span>
                  </p>
                  <p v-if="item.designRequest" class="text-purple-600 font-medium flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-purple-600"></span>
                    Yêu cầu thiết kế (+200k)
                  </p>
                  <p v-if="item.file" class="text-blue-600 text-xs truncate max-w-[200px]" title="File thiết kế">
                    📎 {{ item.file.name }}
                  </p>
                  <p v-if="item.note" class="text-gray-500 italic text-xs mt-1 border-l-2 border-gray-300 pl-2">
                    "{{ item.note }}"
                  </p>
                </div>
              </div>

              <div class="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                <span class="text-xl font-bold text-primary-600">{{ item.totalPrice.toLocaleString() }} đ</span>
                <button 
                  @click="store.removeFromCart(index)"
                  class="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full"
                  title="Xóa sản phẩm"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Checkout Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h3 class="text-xl font-bold text-gray-900 mb-6">Tổng đơn hàng</h3>
              
              <div class="space-y-4 mb-6 pb-6 border-b border-gray-100">
                <div class="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span class="font-medium">{{ subtotal.toLocaleString() }} đ</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>VAT (8%):</span>
                  <span class="font-medium">{{ vat.toLocaleString() }} đ</span>
                </div>
              </div>

              <div class="flex justify-between items-center mb-8">
                <span class="text-lg font-bold text-gray-900">Tổng cộng:</span>
                <span class="text-2xl font-extrabold text-primary-600">{{ total.toLocaleString() }} đ</span>
              </div>

              <button 
                @click="checkout"
                class="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 mb-4"
              >
                Tiến hành đặt hàng
              </button>
              
              <p class="text-xs text-center text-gray-400">
                Bằng việc đặt hàng, bạn đồng ý với <a href="#" class="text-primary-600 hover:underline">Điều khoản dịch vụ</a> của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
