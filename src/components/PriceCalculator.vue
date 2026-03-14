<script setup>
import { ref, computed, watch } from 'vue'
import axios from '@/utils/axios' 
import { ShoppingCart, Check, UploadCloud, FileImage, PenTool, X, ChevronRight, Loader2 } from 'lucide-vue-next'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})

const store = useAppStore()
const router = useRouter()

const selectedOptions = ref({})
const selectedQuantity = ref(0)
const totalPrice = ref(0)
const calculating = ref(false)
const isUploading = ref(false) // Thêm biến trạng thái upload

watch(() => props.service, (newService) => {
  if (newService && newService.option_groups) {
    selectedOptions.value = {}
    newService.option_groups.forEach(group => {
      if (group.options && group.options.length > 0) {
        selectedOptions.value[group.name] = group.options[0].label
      }
    })
    
    if (newService.price_rules && newService.price_rules.length > 0) {
      const sortedRules = [...newService.price_rules].sort((a, b) => a.min_qty - b.min_qty)
      selectedQuantity.value = sortedRules[0].min_qty
    }
  }
}, { immediate: true })

let timeoutId = null
const calculatePrice = async () => {
  if (!selectedQuantity.value || selectedQuantity.value <= 0) return
  
  calculating.value = true
  try {
    const response = await axios.post('/services/calculate-price', {
      service_id: props.service.id,
      quantity: selectedQuantity.value,
      selected_options: selectedOptions.value
    })
    totalPrice.value = response.data.total_price
  } catch (error) {
    console.error('Lỗi tính giá:', error)
  } finally {
    calculating.value = false
  }
}

watch([selectedQuantity, selectedOptions], () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    calculatePrice()
  }, 300)
}, { deep: true })

const designRequest = ref(false)
const note = ref('')
const designFee = 200000

const file = ref(null)
const filePreview = ref(null)
const fileInput = ref(null)

const handleFileUpload = (event) => {
  const selectedFile = event.target.files[0]
  if (selectedFile) {
    // Validate dung lượng (Ví dụ: Max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('File quá lớn! Vui lòng chọn file dưới 50MB.')
      event.target.value = ''
      return
    }

    file.value = selectedFile
    if (selectedFile.type.startsWith('image/')) {
      filePreview.value = URL.createObjectURL(selectedFile)
    } else {
      filePreview.value = null
    }
  }
}

const removeFile = () => {
  file.value = null
  filePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const finalTotalPrice = computed(() => {
  return totalPrice.value + (designRequest.value ? designFee : 0)
})

const unitPrice = computed(() => {
  if (selectedQuantity.value <= 0) return 0
  return (totalPrice.value / selectedQuantity.value).toFixed(0)
})

// HÀM XỬ LÝ ĐẶT HÀNG (ĐÃ THÊM UPLOAD FILE)
const handleAddToCart = async () => {
  let fileUrl = null;

  // Nếu có file, thực hiện upload lên server trước
  if (file.value) {
    isUploading.value = true;
    try {
      const formData = new FormData();
      formData.append('file', file.value);

      // 👉 THAY URL '/upload' THÀNH API UPLOAD THỰC TẾ CỦA ÔNG
    const response = await axios.post('/admin/upload-artwork', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
      
      // Lấy link file trả về từ Backend (Tùy cấu trúc JSON của ông)
      fileUrl = response.data.url; 
      
    } catch (error) {
      console.error('Lỗi upload file:', error);
      alert('Tải file lên thất bại! Vui lòng thử lại.');
      isUploading.value = false;
      return; // Dừng lại, không cho add vào giỏ hàng
    }
    isUploading.value = false;
  }

// Đẩy data vào Store
  store.addToCart({
    service: props.service,
    quantity: selectedQuantity.value,
    selectedOptions: { ...selectedOptions.value },
    totalPrice: finalTotalPrice.value,
    designRequest: designRequest.value,
    note: note.value,
    artwork_url: fileUrl // <--- Đổi tên ở đây cho chuẩn với cột trong DB
  })
  
  alert('Đã thêm vào giỏ hàng thành công!')
  router.push('/cart')
}
</script>
<template>
  <div v-if="service" class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 sticky top-24 overflow-hidden flex flex-col max-h-[85vh]">
    
    <div class="bg-gradient-to-r from-red-50 to-white px-8 py-6 border-b border-red-100 shrink-0">
      <h3 class="text-2xl font-black text-red-700 tracking-tight">Tùy chọn in ấn</h3>
      <p class="text-sm text-gray-500 mt-1">Cấu hình sản phẩm theo nhu cầu của bạn</p>
    </div>
    
    <div class="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
      
      <div v-for="group in service.option_groups" :key="group.name" class="space-y-3">
        <label class="flex items-center gap-2 text-[15px] font-bold text-gray-800">
          <ChevronRight class="w-4 h-4 text-red-500" />
          {{ group.name }}
        </label>
        
        <div class="flex flex-wrap gap-3">
          <label v-for="opt in group.options" :key="opt.label" class="cursor-pointer group relative">
            <input 
              type="radio" 
              v-model="selectedOptions[group.name]" 
              :value="opt.label" 
              :name="group.name"
              class="peer sr-only"
            >
            <div class="px-5 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium text-sm transition-all duration-200 hover:border-red-300 hover:bg-red-50 peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:text-red-700 peer-checked:shadow-sm">
              {{ opt.label }}
              <span v-if="opt.price_modifier > 0" class="block text-[11px] text-gray-400 font-normal mt-0.5 group-hover:text-red-400 peer-checked:text-red-500">
                +{{ opt.price_modifier.toLocaleString() }}đ
              </span>
            </div>
            <div class="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center scale-0 opacity-0 peer-checked:scale-100 peer-checked:opacity-100 transition-all duration-300 shadow-md">
              <Check class="w-3 h-3" stroke-width="3" />
            </div>
          </label>
        </div>
      </div>

      <div v-if="service.price_rules && service.price_rules.length > 0" class="space-y-4">
        <label class="flex items-center gap-2 text-[15px] font-bold text-gray-800">
          <ChevronRight class="w-4 h-4 text-red-500" />
          Số lượng (Cái/Tờ)
        </label>
        
        <div class="flex flex-wrap gap-3">
          <label v-for="rule in [...service.price_rules].sort((a,b)=>a.min_qty - b.min_qty)" :key="rule.min_qty" class="cursor-pointer group relative">
            <input 
              type="radio" 
              v-model="selectedQuantity" 
              :value="rule.min_qty" 
              class="peer sr-only" 
              name="quantity"
            >
            <div class="px-5 py-3 min-w-[80px] text-center rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-bold text-sm transition-all duration-200 hover:border-red-300 hover:bg-red-50 peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:text-red-700 peer-checked:shadow-md">
              {{ rule.min_qty.toLocaleString('vi-VN') }}
            </div>
          </label>
        </div>

        <div class="flex items-center gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 focus-within:border-red-300 transition-colors">
          <span class="text-sm font-medium text-gray-600 flex-1">Hoặc nhập số lượng khác:</span>
          <div class="relative w-36">
            <input 
              type="number" 
              v-model.number="selectedQuantity" 
              min="1"
              class="w-full pl-4 pr-10 py-2.5 border-2 border-gray-300 focus:border-red-500 focus:bg-white rounded-lg outline-none font-black text-gray-800 text-right transition-colors"
            >
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">Cái</span>
          </div>
        </div>
      </div>

      <hr class="border-gray-100">

      <label class="flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer select-none"
        :class="designRequest ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'">
        <div class="pt-1">
          <div class="w-5 h-5 rounded flex items-center justify-center border-2 transition-colors"
            :class="designRequest ? 'bg-purple-600 border-purple-600' : 'border-gray-300'">
            <Check v-if="designRequest" class="w-3.5 h-3.5 text-white" />
          </div>
          <input type="checkbox" v-model="designRequest" class="hidden">
        </div>
        <div>
          <span class="block text-[15px] font-bold" :class="designRequest ? 'text-purple-900' : 'text-gray-800'">
            Yêu cầu thiết kế riêng
          </span>
          <span class="block text-sm mt-1" :class="designRequest ? 'text-purple-700' : 'text-gray-500'">
            Phí dịch vụ: <span class="font-bold">+200.000đ</span>
          </span>
        </div>
      </label>

      <div class="space-y-3">
        <label class="text-[15px] font-bold text-gray-800">Upload File Thiết Kế</label>
        <div class="relative group rounded-2xl border-2 border-dashed transition-all p-6 text-center"
          :class="file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-red-400 bg-gray-50 hover:bg-red-50/30'">
          
          <input type="file" ref="fileInput" @change="handleFileUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.ai,.psd,.jpg,.png,.zip">
          
          <template v-if="!file">
            <div class="pointer-events-none flex flex-col items-center justify-center space-y-3">
              <div class="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-300">
                <UploadCloud class="w-7 h-7 text-red-500" />
              </div>
              <div>
                <span class="block text-sm font-bold text-gray-700">Kéo thả hoặc nhấn để chọn file</span>
                <span class="block text-xs text-gray-400 mt-1">Hỗ trợ: PDF, AI, PSD, JPG (Tối đa 50MB)</span>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="flex items-center gap-4 bg-white p-4 rounded-xl border border-green-200 shadow-sm relative z-10">
              <img v-if="filePreview" :src="filePreview" class="w-16 h-16 object-cover rounded-lg border border-gray-100" />
              <div v-else class="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 text-gray-400">
                <FileImage class="w-8 h-8" />
              </div>
              <div class="flex-1 text-left overflow-hidden">
                <p class="text-sm font-bold text-gray-800 truncate" :title="file.name">{{ file.name }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
              </div>
              <button @click.stop="removeFile" class="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>
          </template>
        </div>
      </div>

      <div class="space-y-3">
        <label class="text-[15px] font-bold text-gray-800">Ghi chú đơn hàng</label>
        <textarea 
          v-model="note"
          rows="2"
          class="w-full px-5 py-4 text-sm bg-gray-50 rounded-2xl border-2 border-gray-100 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none resize-none"
          placeholder="Ví dụ: Cán mờ, đóng gói 100 cái/bọc..."
        ></textarea>
      </div>

    </div>

    <div class="bg-gray-50 border-t border-gray-200 p-8 shrink-0">
      <div class="space-y-2 mb-6">
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span>Đơn giá ({{ selectedQuantity }} cái):</span>
          <span class="font-medium text-gray-700">~{{ Number(unitPrice).toLocaleString('vi-VN') }} đ/cái</span>
        </div>
        <div v-if="designRequest" class="flex justify-between items-center text-sm text-purple-600 font-medium bg-purple-100/50 px-3 py-2 rounded-lg">
          <span>Phí thiết kế riêng:</span>
          <span>+200.000 đ</span>
        </div>
      </div>

      <div class="flex justify-between items-end mb-6">
        <span class="text-lg font-bold text-gray-800 pb-1">Tổng cộng:</span>
        <div v-if="calculating" class="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div v-else class="text-right">
          <span class="text-4xl font-black text-red-600 tracking-tight leading-none">
            {{ finalTotalPrice.toLocaleString('vi-VN') }}<span class="text-xl font-bold ml-1">đ</span>
          </span>
        </div>
      </div>

<button 
        @click="handleAddToCart"
        :disabled="calculating || finalTotalPrice === 0 || isUploading"
        class="w-full bg-red-600 text-white py-4.5 rounded-2xl font-bold text-lg hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center gap-3 shadow-[0_8px_20px_rgb(220,38,38,0.3)] hover:shadow-[0_8px_25px_rgb(220,38,38,0.4)] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
      >
        <template v-if="isUploading">
          <Loader2 class="w-5 h-5 animate-spin" />
          ĐANG TẢI FILE LÊN...
        </template>
        <template v-else>
          <ShoppingCart class="w-5 h-5" />
          ĐẶT HÀNG NGAY
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 10px 0; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>