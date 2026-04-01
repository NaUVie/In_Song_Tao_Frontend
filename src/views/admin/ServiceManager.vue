<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/utils/axios'
import { 
  Plus, Pencil, Trash2, Image as ImageIcon, 
  RefreshCw, X, UploadCloud, Layers, 
  ChevronDown, Search, Loader2, ChevronLeft, ChevronRight, Tag
} from 'lucide-vue-next'

const services = ref([])
const categories = ref([])
const loading = ref(true)
const search = ref('')
const filterCategory = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const currentServiceId = ref(null)

const imagePreview = ref(null)
const fileInput = ref(null)
const fileInputMultiple = ref(null) 
const isUploadingGallery = ref(false) 

const isSubmitting = ref(false)

// BIẾN ĐỂ LƯU ẢNH ĐANG ĐƯỢC HOVER (Dùng cho Zoom)
const zoomedImageUrl = ref(null)

// Logic quản lý đóng mở Dropdown trong Modal
const expandedGroups = ref([])
const isPriceExpanded = ref(true) 

// PHÂN TRANG LOGIC
const currentPage = ref(1)
const itemsPerPage = 10

const form = ref({
  name:'',
  category_id:'',
  description:'',
  image_url:'',
  slug:'',
  option_groups:[],
  price_rules: [],
  gallery_urls: [] 
})

const resetForm = () => {
  form.value = { name:'', category_id:'', description:'', image_url:'', slug:'', option_groups:[], price_rules: [], gallery_urls: [] }
  imagePreview.value = null
  isEditing.value = false
  currentServiceId.value = null
  expandedGroups.value = [] 
  isPriceExpanded.value = true 
}

// Upload ảnh chính
const triggerUpload = () => fileInput.value.click()
const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  imagePreview.value = URL.createObjectURL(file)
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await axios.post('/admin/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.value.image_url = res.data.image_url
  } catch (err) {
    alert("Lỗi tải ảnh chính!")
  }
}

// HÀM XÓA ẢNH CHÍNH
const removeMainImage = () => {
  if(confirm('Xóa ảnh đại diện?')) { 
    form.value.image_url = ''; 
    imagePreview.value = null;
    zoomedImageUrl.value = null;
  }
}

// Logic Upload mảng ảnh phụ (Gallery)
const triggerMultipleUpload = () => fileInputMultiple.value.click()
const handleMultipleFileChange = async (e) => {
  const files = Array.from(e.target.files)
  if (!files.length) return

  isUploadingGallery.value = true
  try {
    const uploadPromises = files.map(file => {
      const formData = new FormData()
      formData.append('file', file)
      return axios.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data.image_url) 
    })

    const uploadedUrls = await Promise.all(uploadPromises)
    form.value.gallery_urls = [...(form.value.gallery_urls || []), ...uploadedUrls]
  } catch (err) {
    alert("Có lỗi khi tải ảnh phụ lên!")
  } finally {
    isUploadingGallery.value = false
    e.target.value = '' 
  }
}

// CÁC HÀM XÓA ẢNH PHỤ
const removeGalleryImage = (index) => {
  if(confirm('Bạn chắc chắn muốn xóa ảnh này?')) {
    form.value.gallery_urls.splice(index, 1)
    zoomedImageUrl.value = null;
  }
}

const clearGallery = () => {
  if(confirm('Bạn muốn xóa toàn bộ ảnh chi tiết?')) {
    form.value.gallery_urls = []
    zoomedImageUrl.value = null;
  }
}

const addPriceRule = () => form.value.price_rules.push({ min_qty: 1, max_qty: null, unit_price: 0 })
const removePriceRule = (index) => form.value.price_rules.splice(index, 1)

const toggleGroupExpand = (idx) => {
  const pos = expandedGroups.value.indexOf(idx)
  if (pos > -1) expandedGroups.value.splice(pos, 1)
  else expandedGroups.value.push(idx)
}

// KHỞI TẠO OPTION VỚI CÁC TRƯỜNG MỚI
const addOptionGroup = () => {
  form.value.option_groups.push({ 
    name: '', 
    is_required: true, 
    options: [{ 
      label: '', 
      price_modifier: 0,
      modifier_type: 'fixed',
      apply_to: 'unit'
    }] 
  })
  expandedGroups.value.push(form.value.option_groups.length - 1)
}

const removeGroup = (index) => {
  form.value.option_groups.splice(index, 1)
  const pos = expandedGroups.value.indexOf(index)
  if(pos > -1) expandedGroups.value.splice(pos, 1)
}

// KHỞI TẠO OPTION LẺ VỚI CÁC TRƯỜNG MỚI
const addOption = (gIdx) => {
  form.value.option_groups[gIdx].options.push({ 
    label: '', 
    price_modifier: 0,
    modifier_type: 'fixed',
    apply_to: 'unit'
  })
}

const removeOption = (gIdx, oIdx) => form.value.option_groups[gIdx].options.splice(oIdx, 1)

const fetchServices = async () => {
  loading.value = true
  try {
    const [res, catRes] = await Promise.all([
      axios.get('/admin/services'),
      axios.get('/services/categories')
    ]).catch(() => [[], []])
    services.value = res?.data || []
    categories.value = catRes?.data || []
  } catch(err) {
    console.error("Lỗi fetch:", err)
  } finally {
    loading.value = false
  }
}

const filteredServices = computed(() => {
  if (!services.value) return []
  return services.value.filter(s => {
    const name = s.name || ''
    const matchName = name.toLowerCase().includes(search.value.toLowerCase())
    const matchCategory = !filterCategory.value || s.category_id == filterCategory.value
    return matchName && matchCategory
  })
})

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredServices.value.slice(start, start + itemsPerPage)
})

const groupedPaginatedServices = computed(() => {
  const groups = []
  paginatedServices.value.forEach(service => {
    const catName = categories.value.find(c => c.id === service.category_id)?.name || 'Chưa phân loại'
    let group = groups.find(g => g.categoryName === catName)
    if (!group) {
      group = { categoryName: catName, items: [] }
      groups.push(group)
    }
    group.items.push(service)
  })
  return groups
})

const totalPages = computed(() => Math.ceil(filteredServices.value.length / itemsPerPage))
const handleFilterChange = () => currentPage.value = 1

const openEditModal = (service) => {
  isEditing.value = true
  currentServiceId.value = service.id
  form.value = JSON.parse(JSON.stringify(service))
  if(!form.value.option_groups) form.value.option_groups = []
  if(!form.value.price_rules) form.value.price_rules = []
  
  if(service.gallery && service.gallery.length > 0) {
    form.value.gallery_urls = service.gallery.map(img => img.image_url)
  } else {
    form.value.gallery_urls = []
  }

  // Đảm bảo các option cũ (nếu có) không bị thiếu field
  form.value.option_groups.forEach(g => {
    g.options.forEach(o => {
      if(!o.modifier_type) o.modifier_type = 'fixed';
      if(!o.apply_to) o.apply_to = 'unit';
    });
  });

  expandedGroups.value = []
  isPriceExpanded.value = true 
  showModal.value = true
}

const deleteService = async (id) => {
  if(!confirm("Chắc chắn xóa dịch vụ này?")) return
  try {
    await axios.delete(`/admin/services/${id}`)
    fetchServices()
  } catch(err) { alert("Lỗi xóa!") }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    if (isEditing.value) await axios.put(`/admin/services/${currentServiceId.value}`, form.value, config)
    else await axios.post('/admin/services', form.value, config)
    showModal.value = false
    fetchServices()
  } catch (err) {
    alert("Lỗi lưu dữ liệu!")
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchServices)
</script>

<template>
  <div class="p-4 max-w-7xl mx-auto font-sans min-h-screen bg-[#F8FAFC]">
    
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Quản Lý Dịch Vụ</h1>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Hệ thống vận hành xưởng ClickIn</p>
      </div>
      <div class="flex gap-3">
        <button @click="fetchServices" class="p-3 bg-white shadow-sm border rounded-2xl text-red-600 hover:shadow-md transition-all active:scale-90">
          <RefreshCw :class="['w-6 h-6', loading ? 'animate-spin' : '']" />
        </button>
        <button @click="showModal = true; isEditing = false; resetForm()" class="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl active:scale-95">
          <Plus class="w-5 h-5" /> Thêm mới
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
      <div class="md:col-span-8 relative flex items-center">
        <Search class="absolute left-5 text-gray-400 w-4 h-4 z-10 pointer-events-none"/>
        <input v-model="search" @input="handleFilterChange" placeholder="Tìm tên sản phẩm, dịch vụ..." class="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:border-red-500 outline-none font-bold text-sm transition-all" style="padding-left: 3.5rem !important;">
      </div>
      <div class="md:col-span-4 relative flex items-center">
        <select v-model="filterCategory" @change="handleFilterChange" class="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm font-black text-xs uppercase outline-none focus:border-red-500 appearance-none transition-all cursor-pointer">
          <option value="">Tất cả danh mục</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{c.name}}</option>
        </select>
        <ChevronDown class="absolute right-5 text-gray-400 w-4 h-4 pointer-events-none"/>
      </div>
    </div>

    <div class="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden flex flex-col">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <th class="px-8 py-5">Sản phẩm & Phân loại</th>
            <th class="px-8 py-5">Giá khởi điểm</th>
            <th class="px-8 py-5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading">
             <td colspan="3" class="px-8 py-24 text-center">
                <Loader2 class="w-10 h-10 animate-spin mx-auto text-red-200" />
                <p class="mt-4 text-xs font-bold text-gray-300 uppercase italic">Đang bốc dữ liệu...</p>
             </td>
          </tr>
          <tr v-else-if="paginatedServices.length === 0">
              <td colspan="3" class="px-8 py-20 text-center text-gray-300 uppercase font-black italic text-sm">Không tìm thấy sản phẩm nào</td>
          </tr>

          <template v-else v-for="group in groupedPaginatedServices" :key="group.categoryName">
            <tr class="bg-slate-50/80">
              <td colspan="3" class="px-8 py-2.5">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-4 bg-red-500 rounded-full"></div>
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">{{ group.categoryName }}</span>
                </div>
              </td>
            </tr>
            <tr v-for="service in group.items" :key="service.id" class="group hover:bg-red-50/10 transition-all">
              <td class="px-8 py-6 flex items-center gap-5">
                <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform relative">
                  <img v-if="service.image_url" :src="service.image_url" class="w-full h-full object-cover"/>
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon class="w-5 h-5"/></div>
                </div>
                <div>
                  <h3 class="font-black text-sm uppercase italic text-slate-900 leading-none mb-1.5">{{service.name}}</h3>
                  <span class="text-[10px] font-mono text-gray-400 font-bold">/{{service.slug}}</span>
                </div>
              </td>
              <td class="px-8 py-6">
                <div v-if="service.price_rules?.length">
                    <p class="text-base font-black text-blue-600 leading-none">{{ service.price_rules[0].unit_price?.toLocaleString() }}đ</p>
                    <p class="text-[9px] font-bold text-gray-400 uppercase italic mt-1">{{service.price_rules.length}} mốc giá</p>
                </div>
                <span v-else class="text-[9px] font-black text-gray-300 uppercase italic">Chưa cài giá</span>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="openEditModal(service)" class="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 flex items-center justify-center"><Pencil class="w-4 h-4"/></button>
                  <button @click="deleteService(service.id)" class="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90 flex items-center justify-center"><Trash2 class="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div class="p-4 bg-gray-50/50 border-t flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hiển thị {{ paginatedServices.length }} / {{ filteredServices.length }} sản phẩm</p>
        <div class="flex items-center gap-1.5">
          <button @click="currentPage--" :disabled="currentPage === 1" class="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-30 hover:bg-slate-50 shadow-sm active:scale-90"><ChevronLeft class="w-4 h-4" /></button>
          <div class="flex items-center gap-1">
            <button v-for="page in totalPages" :key="page" @click="currentPage = page" class="w-8 h-8 rounded-lg text-[10px] font-black transition-all border" :class="currentPage === page ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200' : 'bg-white text-slate-500 border-gray-100 hover:border-red-500'">{{ page }}</button>
          </div>
          <button @click="currentPage++;" :disabled="currentPage === totalPages || totalPages === 0" class="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-30 hover:bg-slate-50 shadow-sm active:scale-90"><ChevronRight class="w-4 h-4" /></button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div class="bg-gray-50 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-modal-main-in border border-gray-200 overflow-hidden">
        
        <div class="p-5 border-b border-gray-200 bg-white rounded-t-3xl flex justify-between items-center shrink-0">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-black rounded-xl text-white"><Layers class="w-5 h-5" /></div>
            <div>
              <h3 class="text-xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">{{ isEditing ? 'Cấu hình Dịch vụ' : 'Thêm Dịch vụ mới' }}</h3>
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Thông tin cơ bản & Bảng giá</p>
            </div>
          </div>
          <button @click="showModal = false" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X class="w-5 h-5" /></button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar overflow-x-hidden relative">
          
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
              
              <div class="md:col-span-1 flex flex-col gap-4">
                
                <div>
                  <label class="text-[9px] font-black uppercase text-gray-400 mb-1.5 flex justify-between">
                    <span>Ảnh đại diện</span>
                    <button v-if="form.image_url" @click="removeMainImage" class="text-red-500 hover:text-red-700">Xóa</button>
                  </label>
                  
                  <div 
                    @click="triggerUpload" 
                    @mouseenter="zoomedImageUrl = imagePreview || form.image_url"
                    @mouseleave="zoomedImageUrl = null"
                    class="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50/50 transition-all relative group"
                  >
                      <img v-if="imagePreview || form.image_url" :src="imagePreview || form.image_url" class="w-full h-full object-cover rounded-xl">
                      <div v-else class="text-center">
                        <UploadCloud class="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p class="text-[9px] font-black uppercase text-gray-400">Tải ảnh</p>
                      </div>
                      <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*">
                  </div>
                </div>

                <div>
                  <label class="text-[9px] font-black uppercase text-gray-400 mb-1.5 flex justify-between items-center">
                    <span>Ảnh chi tiết ({{ form.gallery_urls.length }})</span>
                    <div class="flex items-center gap-2">
                      <span v-if="isUploadingGallery" class="text-red-500 animate-pulse font-bold">Đang tải...</span>
                      <button v-if="form.gallery_urls.length > 0" @click="clearGallery" class="text-red-500 hover:text-red-700">Xóa hết</button>
                    </div>
                  </label>
                  
                  <div class="grid grid-cols-3 gap-2">
                    <div @click="triggerMultipleUpload" class="aspect-square bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-red-500 hover:text-red-500 text-gray-400 transition-colors group relative">
                      <Plus class="w-5 h-5 transition-transform group-hover:scale-125" />
                    </div>
                    <input type="file" ref="fileInputMultiple" class="hidden" multiple @change="handleMultipleFileChange" accept="image/*">

                    <div 
                      v-for="(url, idx) in form.gallery_urls" 
                      :key="idx" 
                      @mouseenter="zoomedImageUrl = url"
                      @mouseleave="zoomedImageUrl = null"
                      class="aspect-square bg-gray-50 rounded-xl border border-gray-200 relative group shadow-sm cursor-pointer"
                    >
                      <img :src="url" class="w-full h-full object-cover rounded-xl">
                      
                      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-1 rounded-xl z-10">
                        <button 
                          @click.stop="removeGalleryImage(idx)" 
                          class="p-1 bg-white hover:bg-red-500 hover:text-white text-slate-800 rounded-md shadow-sm transition-colors cursor-pointer transform hover:scale-110"
                          title="Xóa ảnh"
                        >
                          <X class="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div class="md:col-span-3 grid grid-cols-2 gap-4 items-start">
                <div class="col-span-2">
                  <label class="text-[9px] font-black uppercase text-gray-400 mb-1 block">Tên dịch vụ</label>
                  <input v-model="form.name" type="text" class="w-full p-2.5 bg-gray-50 rounded-xl font-black text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 border border-transparent transition-all" placeholder="VD: Nhãn treo bo góc">
                </div>
                <div>
                  <label class="text-[9px] font-black uppercase text-gray-400 mb-1 block">Danh mục</label>
                  <select v-model="form.category_id" class="w-full p-2.5 bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-red-100 border border-transparent transition-all">
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{cat.name}}</option>
                  </select>
                </div>
                <div>
                  <label class="text-[9px] font-black uppercase text-gray-400 mb-1 block">Slug (URL)</label>
                  <input v-model="form.slug" type="text" class="w-full p-2.5 bg-gray-50 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-red-100 border border-transparent transition-all" placeholder="nhan-treo-bo-goc">
                </div>
                <div class="col-span-2">
                  <label class="text-[9px] font-black uppercase text-gray-400 mb-1 block">Mô tả</label>
                  <textarea v-model="form.description" class="w-full p-2.5 bg-gray-50 rounded-xl font-medium text-xs outline-none focus:ring-2 focus:ring-red-100 border border-transparent h-24 transition-all custom-scrollbar"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-visible flex flex-col transition-all" :class="{'ring-2 ring-red-100 border-red-300': isPriceExpanded}">
            <div class="p-4 bg-gray-50 flex items-center justify-between cursor-pointer border-b border-transparent hover:bg-gray-100 transition-colors" :class="{'border-gray-200': isPriceExpanded}" @click="isPriceExpanded = !isPriceExpanded">
              <div class="flex items-center gap-2.5">
                <Tag class="w-4 h-4 text-slate-800" />
                <h4 class="font-black uppercase text-sm text-slate-900 tracking-wide">Bảng giá bậc thang</h4>
                <span class="text-[9px] font-black text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200 ml-2">{{ form.price_rules.length }} mốc</span>
              </div>
              <ChevronDown class="w-4 h-4 text-gray-500 transition-transform" :class="{'rotate-180 text-red-500': isPriceExpanded}"/>
            </div>

            <div v-show="isPriceExpanded" class="p-4 bg-white overflow-visible">
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-start">
                <div v-for="(rule, rIdx) in form.price_rules" :key="rIdx" class="bg-gray-50 border border-gray-200 rounded-xl p-3 relative shadow-sm hover:border-red-300 transition-all group flex flex-col overflow-visible">
                  <button @click="removePriceRule(rIdx)" class="absolute -top-2 -right-2 p-1.5 bg-white text-red-500 border border-red-200 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-[30] hover:bg-red-50">
                    <X class="w-3 h-3 stroke-[4]"/>
                  </button>
                  <div class="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label class="text-[8px] font-black text-gray-400 block mb-1 uppercase">Từ</label>
                      <input v-model.number="rule.min_qty" type="number" class="w-full bg-white border border-gray-200 p-1.5 rounded-lg text-xs font-bold outline-none text-center shadow-sm">
                    </div>
                    <div>
                      <label class="text-[8px] font-black text-gray-400 block mb-1 uppercase">Đến</label>
                      <input v-model.number="rule.max_qty" type="number" class="w-full bg-white border border-gray-200 p-1.5 rounded-lg text-xs font-bold outline-none text-center shadow-sm">
                    </div>
                  </div>
                  <div class="pt-2 border-t border-dashed border-gray-300 text-center font-black text-red-600">
                    {{ rule.unit_price?.toLocaleString() }}đ
                  </div>
                </div>
                <button @click="addPriceRule" class="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-400 hover:bg-red-50/50 transition-all min-h-[110px]">
                  <Plus class="w-6 h-6 mb-1"/><span class="text-[9px] font-black uppercase tracking-widest">Thêm Mốc</span>
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="font-black uppercase text-sm text-slate-900 flex items-center gap-2 px-1"><Layers class="w-4 h-4"/> Gia công (Options)</h4>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              
              <div v-for="(group, gIdx) in form.option_groups" :key="gIdx" class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all" :class="{'ring-2 ring-red-100 border-red-300': expandedGroups.includes(gIdx)}">
                
                <div class="p-3 bg-gray-50 flex items-center justify-between cursor-pointer border-b border-transparent hover:bg-gray-100 transition-colors" :class="{'border-gray-200': expandedGroups.includes(gIdx)}" @click="toggleGroupExpand(gIdx)">
                  <input v-model="group.name" @click.stop class="bg-white px-2.5 py-1.5 rounded-lg text-xs font-black border border-gray-200 outline-none focus:border-red-400 w-2/3 shadow-sm" placeholder="Tên nhóm...">
                  <div class="flex items-center gap-1.5">
                    <button @click.stop="removeGroup(gIdx)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-md transition-colors"><Trash2 class="w-3.5 h-3.5"/></button>
                    <ChevronDown class="w-4 h-4 text-gray-500 transition-transform" :class="{'rotate-180 text-red-500': expandedGroups.includes(gIdx)}"/>
                  </div>
                </div>

                <div v-show="expandedGroups.includes(gIdx)" class="p-3 space-y-3 bg-white">
                  <div v-for="(opt, oIdx) in group.options" :key="oIdx" class="flex flex-col gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    
                    <div class="flex items-center gap-2">
                      <input v-model="opt.label" placeholder="VD: Giao nhanh, Cán mờ..." class="flex-1 bg-white px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 outline-none focus:border-red-400 shadow-sm">
                      <button @click="removeOption(gIdx, oIdx)" class="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                        <X class="w-4 h-4 stroke-[3]"/>
                      </button>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <div class="flex bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm shrink-0">
                        <button type="button" @click="opt.modifier_type = 'fixed'" :class="opt.modifier_type === 'fixed' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:text-slate-600'" class="px-2 py-1 rounded-md text-[10px] font-black transition-all">đ</button>
                        <button type="button" @click="opt.modifier_type = 'percentage'" :class="opt.modifier_type === 'percentage' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:text-slate-600'" class="px-2 py-1 rounded-md text-[10px] font-black transition-all">%</button>
                      </div>

                      <div class="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm w-20 shrink-0">
                        <span class="text-green-500 font-black text-[10px]">+</span>
                        <input v-model.number="opt.price_modifier" type="number" class="w-full text-right text-xs font-black outline-none" placeholder="0">
                      </div>

                      <div class="flex-1 flex bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm min-w-[120px]">
                        <button type="button" @click="opt.apply_to = 'unit'" :class="opt.apply_to === 'unit' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-slate-600'" class="flex-1 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all">Mỗi món</button>
                        <button type="button" @click="opt.apply_to = 'total'" :class="opt.apply_to === 'total' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-slate-600'" class="flex-1 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all">Tổng đơn</button>
                      </div>
                    </div>
                  </div>

                  <button @click="addOption(gIdx)" class="w-full py-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest hover:border-blue-400 transition-colors mt-1">+ Thêm thuộc tính</button>
                </div>

              </div>

              <button @click="addOptionGroup" class="border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 hover:border-red-400 hover:bg-red-50/30 transition-all min-h-[58px]">
                <Plus class="w-4 h-4"/><span class="text-[10px] font-black uppercase">Thêm Nhóm</span>
              </button>
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0 z-20 relative">
          <button @click="showModal = false; resetForm()" class="px-6 py-2.5 font-black uppercase text-[10px] text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Huỷ bỏ</button>
          <button @click="handleSubmit" :disabled="isSubmitting" class="bg-black text-white px-8 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider shadow-lg hover:bg-red-600 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin"/>
            {{ isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm' }}
          </button>
        </div>
      </div>
    </div>

 <Teleport to="body">
      <div 
        v-if="zoomedImageUrl" 
        class="fixed right-10 top-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[6px] border-white z-[9999999] pointer-events-none animate-zoom-side-in overflow-hidden"
      >
        <img :src="zoomedImageUrl" class="w-full h-full object-contain rounded-xl">
        <div class="absolute bottom-3 w-full text-center">
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap');
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }

/* Animation cho Modal chính */
.animate-modal-main-in { 
  animation: modalMainIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
}
@keyframes modalMainIn {
  from { opacity: 0; transform: scale(0.97) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Animation mượt cho khung Zoom (Nảy nhẹ kiểu Apple/TGDĐ) */
.animate-zoom-in { 
  animation: zoomInAnim 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; 
}
@keyframes zoomInAnim {
  from { opacity: 0; transform: scale(0.8) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
</style>