<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from '@/utils/axios' 
import { ShoppingCart, Check, PenTool, Loader2, Download, UploadCloud } from 'lucide-vue-next'
import { useAppStore } from '../stores/app'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})

const store = useAppStore()
const router = useRouter()
const route = useRoute() 

// Mốc cố định cho các sản phẩm tính theo "Cái/Tờ" (như Bao thư, Tờ rơi...)
const defaultBulkQuantities = [100, 200, 300, 400, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 10000]

// Hàm tự động sinh mảng số lượng
const generateQuantities = (min, max) => {
  const result = []
  for (let i = min; i <= max; i++) {
    result.push(i)
  }
  return result
}

// Lọc mốc số lượng dựa trên Database (Tự động thích ứng Card In Nhanh vs Bao thư)
const availableQuantities = computed(() => {
  if (!props.service || !props.service.price_rules || props.service.price_rules.length === 0) {
    return defaultBulkQuantities
  }
  
  const minQty = Math.min(...props.service.price_rules.map(r => r.min_qty))
  
  // Nếu là Danh thiếp (Card) -> Sinh mốc từ 1 đến max_qty (tối đa 50)
  if (props.service.slug && props.service.slug.includes('card')) {
    let maxQty = Math.max(...props.service.price_rules.map(r => r.max_qty || 50)) 
    // Tránh trường hợp nhập 10000 lốc làm bung Select Box
    if (maxQty > 100) maxQty = 50 
    return generateQuantities(minQty, maxQty)
  }

  // Nếu là các sản phẩm khác (Bao thư...) -> Dùng mốc trăm/ngàn
  let validOpts = defaultBulkQuantities.filter(q => q >= minQty)
  if (!validOpts.includes(minQty)) {
    validOpts.unshift(minQty)
    validOpts.sort((a, b) => a - b)
  }
  return validOpts
})

// Tự động nhận diện Đơn vị tính: Hộp vs Lốc vs Cái
const unitLabel = computed(() => {
  if (!props.service || !props.service.slug) return '(Cái/Tờ)'
  
  const slug = props.service.slug.toLowerCase()
  if (slug.includes('loc') || slug.includes('off')) return '(Lốc)' // Card Lốc 5 (Offset)
  if (slug.includes('hop') || slug.includes('nhanh')) return '(Hộp)' // Card Hộp lẻ (In nhanh)
  
  return '(Cái/Tờ)' // Các món còn lại
})

// State Form & Giá
const selectedOptions = ref({})
const selectedQuantity = ref(100) // Sẽ được gán lại tự động
const calculating = ref(false) 

// State Upload & Add to Cart
const isUploading = ref(false)
const designRequest = ref(false)
const note = ref('')
const designFee = 200000

const file = ref(null)
const fileInput = ref(null)

// State Hình ảnh & Sản phẩm liên quan
const currentImage = ref('')
const galleryImages = ref([])
const relatedServices = ref([]) 

const fetchRelatedServices = async () => {
  if (!props.service || !props.service.category_id) return
  try {
    const res = await axios.get(`/services?category_id=${props.service.category_id}`)
    relatedServices.value = res.data.items || res.data || []
  } catch (error) {
    console.error('Lỗi lấy sản phẩm liên quan:', error)
  }
}

// Init data
watch(() => props.service, async (newService) => { 
  if (newService) {
    if (newService.option_groups) {
      const initialOptions = {}
      newService.option_groups.forEach(group => {
        if (group.options && group.options.length > 0) {
          initialOptions[group.name] = group.options[0].label
        }
      })
      selectedOptions.value = initialOptions
    }

    // Tự động gán Số lượng mặc định theo min_qty
    if (newService.price_rules && newService.price_rules.length > 0) {
      selectedQuantity.value = Math.min(...newService.price_rules.map(r => r.min_qty))
    } else {
      selectedQuantity.value = availableQuantities.value[0] || 100
    }
    
    if (newService.gallery && newService.gallery.length > 0) {
      galleryImages.value = newService.gallery.map(img => img.image_url)
      if (newService.image_url && !galleryImages.value.includes(newService.image_url)) {
        galleryImages.value.unshift(newService.image_url)
      }
      currentImage.value = galleryImages.value[0]
    } else if (newService.image_url) {
      galleryImages.value = [newService.image_url]
      currentImage.value = newService.image_url
    } else {
      galleryImages.value = []
      currentImage.value = ''
    }

    await fetchRelatedServices()
  }
}, { immediate: true, deep: true }) 

const navigateToService = (slug) => {
  router.push(`/service/${slug}`) 
}

const selectOption = (groupName, label) => {
  selectedOptions.value = {
    ...selectedOptions.value,
    [groupName]: label
  }
}

const changeImage = (img) => {
  currentImage.value = img
}

// Tính base price an toàn
const getBasePrice = (qty) => {
  if (!props.service || !props.service.price_rules || props.service.price_rules.length === 0) return 0
  
  const sortedRules = [...props.service.price_rules].sort((a, b) => a.min_qty - b.min_qty)
  let rule = sortedRules.find(r => qty >= r.min_qty && (r.max_qty === null || qty <= r.max_qty))
  
  if (!rule && qty < sortedRules[0].min_qty) rule = sortedRules[0]
  if (!rule && qty > sortedRules[sortedRules.length - 1].max_qty) rule = sortedRules[sortedRules.length - 1]

  return rule ? rule.unit_price : 0
}

// Tính đơn giá
const unitPrice = computed(() => {
  if (!props.service || !props.service.price_rules) return 0
  
  let basePrice = getBasePrice(selectedQuantity.value)

  let extraFeeUnit = 0
  if (props.service.option_groups) {
    props.service.option_groups.forEach(group => {
      const selectedLabel = selectedOptions.value[group.name]
      if (selectedLabel) {
        const option = group.options.find(o => o.label === selectedLabel)
        if (option && option.price_modifier && (!option.apply_to || option.apply_to === 'unit')) {
          if (option.modifier_type === 'percentage') {
            extraFeeUnit += (basePrice * option.price_modifier) / 100
          } else {
            extraFeeUnit += option.price_modifier
          }
        }
      }
    })
  }
  return basePrice + extraFeeUnit
})

// Tính tổng tiền
const totalPrice = computed(() => {
  if (!selectedOptions.value || !selectedQuantity.value) return 0

  let basePrice = getBasePrice(selectedQuantity.value)
  let unitModifiers = 0
  let totalModifiers = 0

  if (props.service.option_groups) {
    props.service.option_groups.forEach(group => {
      const selectedLabel = selectedOptions.value[group.name]
      if (selectedLabel) {
        const option = group.options.find(o => o.label === selectedLabel)
        if (option && option.price_modifier) {
          if (!option.apply_to || option.apply_to === 'unit') {
            if (option.modifier_type === 'percentage') {
              unitModifiers += (basePrice * option.price_modifier) / 100
            } else {
              unitModifiers += option.price_modifier
            }
          } else if (option.apply_to === 'total') {
            totalModifiers += option.price_modifier
          }
        }
      }
    })
  }

  return (selectedQuantity.value * (basePrice + unitModifiers)) + totalModifiers
})

const finalTotalPrice = computed(() => totalPrice.value + (designRequest.value ? designFee : 0))

// Handle File
const triggerFileInput = () => fileInput.value.click()
const handleFileUpload = (event) => {
  const selectedFile = event.target.files[0]
  if (selectedFile) {
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('File quá lớn! Vui lòng chọn file dưới 50MB.')
      event.target.value = ''
      return
    }
    file.value = selectedFile
  }
}
const removeFile = () => {
  file.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// Xử lý giỏ hàng
const handleAddToCart = async () => {
  let fileUrl = null;
  if (file.value) {
    isUploading.value = true;
    try {
      const formData = new FormData();
      formData.append('file', file.value);
      const response = await axios.post('/admin/upload-artwork', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fileUrl = response.data.url; 
    } catch (error) {
      console.error('Lỗi upload file:', error);
      alert('Tải file lên thất bại!');
      isUploading.value = false;
      return; 
    }
    isUploading.value = false;
  }

  store.addToCart({
    service: props.service,
    quantity: selectedQuantity.value,
    selectedOptions: { ...selectedOptions.value },
    totalPrice: finalTotalPrice.value,
    designRequest: designRequest.value,
    note: note.value,
    artwork_url: fileUrl 
  })
  alert('Đã thêm vào giỏ hàng thành công!')
  router.push('/cart')
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex flex-col lg:flex-row gap-6 items-start w-full">
      <div class="w-full lg:w-[60%] flex flex-col gap-6">
        
        <div class="border border-[red] p-4 bg-white">
          <div class="font-bold border-b border-[red] pb-3 mb-5 text-[16px] uppercase text-[#333]">
            {{ service.name }}
          </div>

          <div class="space-y-3">
            <div v-if="relatedServices.length > 1" class="flex flex-col sm:flex-row sm:items-start py-1 border-b border-gray-100 pb-4 mb-2">
              <div class="w-full sm:w-[130px] font-bold shrink-0 mt-2.5 mb-2 sm:mb-0">
                Kiểu dáng / Loại
              </div>
              <div class="flex-1">
                <select 
                  v-if="relatedServices.length > 5"
                  @change="navigateToService($event.target.value)"
                  class="w-full max-w-[450px] border border-[#ccc] h-[38px] px-3 outline-none focus:border-[red] bg-white cursor-pointer text-[13px]"
                >
                  <option 
                    v-for="relService in relatedServices" 
                    :key="relService.id"
                    :value="relService.slug"
                    :selected="service.id === relService.id"
                  >
                    {{ relService.name.split(' ').slice(-2).join(' ') }}
                  </option>
                </select>

                <div v-else class="flex flex-wrap gap-2">
                  <div 
                    v-for="relService in relatedServices" 
                    :key="relService.id"
                    @click="navigateToService(relService.slug)"
                    class="cursor-pointer transition-all select-none min-w-[80px] min-h-[42px] py-1 px-3 flex flex-col items-center justify-center border"
                    :class="[
                      service.id === relService.id 
                        ? 'border-[red] shadow-[0_0_0_1px_red] text-[red] bg-white font-bold' 
                        : 'border-[#dedee0] hover:border-[red] hover:text-[red] text-[#333] bg-white'
                    ]"
                  >
                    <span class="text-[13px] text-center leading-none">
                      {{ relService.name.split(' ').slice(-2).join(' ') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-for="group in service.option_groups" :key="group.name" class="flex flex-col sm:flex-row sm:items-start py-1">
              <div class="w-full sm:w-[130px] font-bold shrink-0 mt-2.5 mb-2 sm:mb-0">
                {{ group.name }}
              </div>
              <div class="flex-1">
                <select 
                  v-if="group.options.length > 5 && !group.options.some(o => o.image_url)"
                  v-model="selectedOptions[group.name]"
                  class="w-full max-w-[450px] border border-[#ccc] h-[38px] px-3 outline-none focus:border-[red] bg-white cursor-pointer text-[13px]"
                >
                  <option 
                    v-for="opt in group.options" 
                    :key="opt.label" 
                    :value="opt.label"
                  >
                    {{ opt.label }}
                    <template v-if="opt.price_modifier && opt.price_modifier > 0">
                      <template v-if="opt.modifier_type === 'percentage'"> (+{{ opt.price_modifier }}%)</template>
                      <template v-else> (+{{ opt.price_modifier.toLocaleString('vi-VN') }}đ{{ opt.apply_to === 'total' ? '/Đơn' : '' }})</template>
                    </template>
                    <template v-else-if="opt.price_modifier && opt.price_modifier < 0">
                      <template v-if="opt.modifier_type === 'percentage'"> ({{ opt.price_modifier }}%)</template>
                      <template v-else> ({{ opt.price_modifier.toLocaleString('vi-VN') }}đ{{ opt.apply_to === 'total' ? '/Đơn' : '' }})</template>
                    </template>
                  </option>
                </select>

                <div v-else class="flex flex-wrap gap-2">
                  <div 
                    v-for="opt in group.options" 
                    :key="opt.label"
                    @click="selectOption(group.name, opt.label)"
                    class="cursor-pointer transition-all select-none"
                    :class="[
                      opt.image_url 
                        ? 'flex flex-col items-center justify-end min-w-[80px] h-[80px] gap-1 border-0' 
                        : 'min-w-[107px] min-h-[42px] py-1 px-3 flex flex-col items-center justify-center border',
                      selectedOptions[group.name] === opt.label 
                        ? (opt.image_url ? 'text-[red] font-bold' : 'border-[red] shadow-[0_0_0_1px_red] text-[red] bg-white font-bold') 
                        : (opt.image_url ? 'text-[#7B7C7F] hover:text-[red]' : 'border-[#dedee0] hover:border-[red] hover:text-[red] text-[#333] bg-white')
                    ]"
                  >
                    <template v-if="opt.image_url">
                      <img 
                        :src="opt.image_url" 
                        :alt="opt.label" 
                        class="h-[35px] w-auto object-contain transition-opacity"
                        :class="selectedOptions[group.name] === opt.label ? 'opacity-100' : 'opacity-60 hover:opacity-100'"
                      />
                      <div class="flex flex-col items-center text-center mt-1">
                        <span class="text-[12px] whitespace-nowrap leading-none">{{ opt.label }}</span>
                        <span v-if="opt.price_modifier && opt.price_modifier > 0" class="text-[11px] mt-1 leading-none" :class="selectedOptions[group.name] === opt.label ? 'text-[red]' : 'text-gray-400'">
                          +{{ opt.modifier_type === 'percentage' ? opt.price_modifier + '%' : opt.price_modifier.toLocaleString('vi-VN') + 'đ' }}
                        </span>
                      </div>
                    </template>
                    
                    <template v-else>
                      <span class="text-[13px] text-center leading-none">{{ opt.label }}</span>
                      <span v-if="opt.price_modifier && opt.price_modifier !== 0" class="text-[11px] mt-1 leading-none" :class="selectedOptions[group.name] === opt.label ? 'text-[red]' : 'text-gray-400 font-normal'">
                        {{ opt.price_modifier > 0 ? '+' : '' }}{{ opt.modifier_type === 'percentage' ? opt.price_modifier + '%' : opt.price_modifier.toLocaleString('vi-VN') + 'đ' }}
                        <span v-if="opt.apply_to === 'total' && opt.modifier_type !== 'percentage'" class="text-[9px]">/Đơn</span>
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center py-1 pt-3">
              <div class="w-full sm:w-[130px] font-bold shrink-0 mb-2 sm:mb-0">
                Số lượng
              </div>
              <div class="flex-1">
                <select 
                  v-model="selectedQuantity" 
                  class="w-full max-w-[450px] border border-[#ccc] h-[38px] px-3 outline-none focus:border-[red] bg-white cursor-pointer"
                >
                  <option 
                    v-for="qty in availableQuantities" 
                    :key="qty" 
                    :value="qty"
                  >
                    {{ qty.toLocaleString('vi-VN') }} {{ unitLabel }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="mt-6 pt-4 border-t border-dashed border-gray-300 text-[13px] leading-relaxed">
            <ul class="list-[square] pl-6 marker:text-black space-y-1">
              <li v-if="service.slug && service.slug.includes('card')">
                <b style="color: red;">Lưu ý:</b> Thời gian có hàng trên chỉ áp dụng tại <b>Chi nhánh Quận 7</b>.
                Các Chi nhánh khác, nếu Đơn hàng được xác nhận chuyển in trước 11h sáng thì sẽ được giao trong ngày.
              </li>
              <li v-else>Không in màu nền. Không lót trắng dưới phần tử in, màu được in thẳng lên nền giấy.</li>
              <li>Khuyến mãi: Đặt hàng Online giảm 10.000đ, đến hết 27/03/2026<br><i class="text-gray-500">(Không cộng giá thành phẩm vào Khuyến mãi.)</i></li>
            </ul>
          </div>
        </div>

        <div class="border border-[#cccccc] p-4 bg-white">
          <div class="font-bold border-b border-[#cccccc] mb-4 pb-3 uppercase text-[14px]">
            DOWNLOAD KHUÔN BẾ / HƯỚNG DẪN
          </div>
          <div class="text-[14px] leading-loose text-[#333]">
            <ul class="list-[square] pl-6 mb-4 space-y-1 marker:text-black">
              <li>{{ service.description || 'Kỹ thuật in: Offset / Kỹ thuật số chất lượng cao.' }}</li>
              <li>Có duyệt mẫu (thời gian từ 6 - 24 tiếng): cộng thêm 50.000đ</li>
              <li>Giá chưa bao gồm thiết kế mẫu, vui lòng thêm 8% VAT khi thanh toán.</li>
              <li>Liên hệ phòng kinh doanh: <strong>0969 296 540</strong></li>
            </ul>
          </div>
          <div class="text-center mt-6 flex justify-center gap-4">
            <button class="border border-[#ccc] bg-white px-4 h-[34px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <Download class="w-4 h-4 text-[#33ccff]" /> Khuôn bế
            </button>
            <button class="border border-[#ccc] bg-white px-4 h-[34px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <Download class="w-4 h-4 text-[#33ccff]" /> Hướng dẫn
            </button>
          </div>
        </div>

      </div>

      <div class="w-full lg:w-[40%] flex flex-col gap-6 lg:sticky lg:top-4">
        
        <div class="border border-[red] p-4 bg-white">
          <div class="space-y-3 pb-4">
            <div class="flex items-center">
              <div class="w-[100px] sm:w-[120px] font-bold pl-2 sm:pl-6 shrink-0 text-[14px]">Đơn giá</div>
              <div class="flex-1 text-right pr-2 sm:pr-6 text-[14px]">
                <span v-if="calculating" class="text-gray-400">Đang tính...</span>
                <span v-else>
                  {{ Math.round(unitPrice).toLocaleString('vi-VN') }}đ 
                  <span class="px-1 text-gray-500">x</span> 
                  {{ selectedQuantity.toLocaleString('vi-VN') }} 
                  <span class="px-1 text-gray-500">=</span> 
                  <strong class="text-[14px]">{{ totalPrice.toLocaleString('vi-VN') }}đ</strong>
                </span>
              </div>
            </div>

            <div class="flex items-center">
              <div class="w-[100px] sm:w-[120px] font-bold pl-2 sm:pl-6 shrink-0 text-[14px]">Phí thiết kế</div>
              <div class="flex-1 text-right pr-2 sm:pr-6 text-[14px]">
                <label class="inline-flex items-center cursor-pointer justify-end w-full">
                  <input type="checkbox" v-model="designRequest" class="mr-2 w-4 h-4 accent-[red]">
                  Yêu cầu <strong class="ml-1">(+{{ designFee.toLocaleString('vi-VN') }}đ)</strong>
                </label>
              </div>
            </div>

            <div class="flex items-center pt-2">
              <div class="w-[100px] sm:w-[120px] font-bold pl-2 sm:pl-6 shrink-0 text-[14px]">Thành tiền</div>
              <div class="flex-1 text-right pr-2 sm:pr-6">
                <div v-if="calculating" class="h-6 w-24 bg-gray-200 animate-pulse ml-auto"></div>
                <div v-else class="font-bold text-[18pt] text-[#ed1651]">
                  {{ finalTotalPrice.toLocaleString('vi-VN') }}đ
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 px-2 sm:px-6">
            <div class="flex items-stretch border border-[#ccc] h-[34px] bg-white">
              <button @click="triggerFileInput" class="bg-gray-100 border-r border-[#ccc] px-3 text-[13px] hover:bg-gray-200 transition-colors shrink-0">
                Chọn tệp
              </button>
              <div class="flex-1 px-3 flex items-center text-[13px] text-gray-500 overflow-hidden whitespace-nowrap">
                {{ file ? file.name : 'Chưa có file nào được chọn' }}
              </div>
              <button v-if="file" @click="removeFile" class="px-3 text-red-500 font-bold hover:bg-red-50 border-l border-[#ccc]">
                X
              </button>
            </div>
            <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" accept=".pdf,.ai,.psd,.jpg,.png,.zip">
          </div>

          <div class="mt-4 px-2 sm:px-6">
            <textarea 
              v-model="note" 
              placeholder="Ghi chú" 
              class="w-full border border-[#ccc] p-2 h-[60px] outline-none focus:border-[red] resize-none text-[13px]"
            ></textarea>
          </div>

          <div class="mt-4 px-2 sm:px-6 flex items-stretch h-[34px]">
            <input type="text" placeholder="Nhập mã giảm giá nếu có" class="flex-1 border border-[#ccc] border-r-0 px-3 text-[13px] outline-none focus:border-[red]">
            <button class="bg-[red] text-white px-4 text-[13px] hover:bg-[#d41146] transition-colors shrink-0 flex items-center gap-1">
              áp dụng
            </button>
          </div>

          <div class="mt-6 px-2 sm:px-6 flex gap-3">
            <button 
              @click="handleAddToCart"
              :disabled="calculating || finalTotalPrice === 0 || isUploading"
              class="flex-1 bg-[#44c8f5] text-white h-[42px] text-[14px] flex items-center justify-center gap-2 hover:bg-[#20b2e2] disabled:bg-[#cccccc] transition-colors font-bold"
            >
              <template v-if="isUploading">
                <Loader2 class="w-4 h-4 animate-spin" /> Đang tải...
              </template>
              <template v-else>
                <ShoppingCart class="w-4 h-4" /> Đặt hàng
              </template>
            </button>
            
            <button class="flex-1 bg-[#ed1651] text-white h-[42px] text-[14px] flex items-center justify-center gap-2 hover:bg-[#d41146] transition-colors font-bold">
              <PenTool class="w-4 h-4" /> Thiết kế online
            </button>
          </div>
        </div>

        <div class="w-full bg-white p-4 border border-[#cccccc]">
          <div v-if="currentImage" class="relative w-full text-center mb-4">
            <img 
              :src="currentImage" 
              :alt="service.name" 
              class="w-full h-auto object-contain max-h-[400px] mx-auto" 
              @error="$event.target.style.display='none'" 
            />
          </div>
          <div v-else class="h-[200px] bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200 w-full mx-auto mb-4">
            Chưa có hình ảnh minh họa
          </div>

          <div v-if="galleryImages.length > 1" class="flex flex-wrap justify-center gap-2 pt-2 border-t border-gray-100">
            <div 
              v-for="(img, idx) in galleryImages" 
              :key="idx"
              @click="changeImage(img)"
              class="w-[70px] h-[70px] shrink-0 cursor-pointer border-2 transition-all p-1 bg-white"
              :class="currentImage === img ? 'border-[red]' : 'border-transparent hover:border-gray-300'"
            >
              <img :src="img" class="w-full h-full object-contain" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>