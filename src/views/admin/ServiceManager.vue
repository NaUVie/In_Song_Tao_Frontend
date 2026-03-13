<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/utils/axios'
import { 
  Plus, Pencil, Trash2, Image as ImageIcon, 
  RefreshCw, X, UploadCloud, Layers, 
  Check, AlertCircle, ChevronDown, Search, Tag, Loader2,
  ChevronLeft, ChevronRight
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
const isSubmitting = ref(false)

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
  price_rules: [] 
})

const resetForm = () => {
  form.value = { name:'', category_id:'', description:'', image_url:'', slug:'', option_groups:[], price_rules: [] }
  imagePreview.value = null
  isEditing.value = false
  currentServiceId.value = null
}

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
    alert("Lỗi tải ảnh lên!")
  }
}

const addPriceRule = () => form.value.price_rules.push({ min_qty: 1, max_qty: null, unit_price: 0 })
const removePriceRule = (index) => form.value.price_rules.splice(index, 1)

const addOptionGroup = () => form.value.option_groups.push({ name: '', is_required: true, options: [{ label: '', price_modifier: 0 }] })
const removeGroup = (index) => form.value.option_groups.splice(index, 1)
const addOption = (gIdx) => form.value.option_groups[gIdx].options.push({ label: '', price_modifier: 0 })
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

// XỬ LÝ LỌC + PHÂN TRANG
const filteredServices = computed(() => {
  if (!services.value) return []
  return services.value.filter(s => {
    const name = s.name || ''
    const matchName = name.toLowerCase().includes(search.value.toLowerCase())
    const matchCategory = !filterCategory.value || s.category_id == filterCategory.value
    return matchName && matchCategory
  })
})

const totalPages = computed(() => Math.ceil(filteredServices.value.length / itemsPerPage))

const paginatedServices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredServices.value.slice(start, end)
})

// Hàm reset về trang 1 khi search hoặc filter
const handleFilterChange = () => {
  currentPage.value = 1
}

const openEditModal = (service) => {
  isEditing.value = true
  currentServiceId.value = service.id
  form.value = JSON.parse(JSON.stringify(service))
  if(!form.value.option_groups) form.value.option_groups = []
  if(!form.value.price_rules) form.value.price_rules = []
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

    if (isEditing.value) {
      await axios.put(`/admin/services/${currentServiceId.value}`, form.value, config)
    } else {
      await axios.post('/admin/services', form.value, config)
    }
    
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
    
    <input 
      v-model="search" 
      @input="handleFilterChange" 
      placeholder="Tìm tên sản phẩm, dịch vụ..." 
      class="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:border-red-500 outline-none font-bold text-sm transition-all"
      style="padding-left: 3.5rem !important;" 
    />
  </div>

  <div class="md:col-span-4 relative flex items-center">
    <select 
      v-model="filterCategory" 
      @change="handleFilterChange" 
      class="w-full p-4 bg-white rounded-2xl border border-gray-100 shadow-sm font-black text-xs uppercase outline-none focus:border-red-500 appearance-none transition-all cursor-pointer"
      style="padding-right: 3rem;"
    >
      <option value="">Tất cả danh mục</option>
      <option v-for="c in categories" :key="c.id" :value="c.id">{{c.name}}</option>
    </select>
    <ChevronDown class="absolute right-5 text-gray-400 w-4 h-4 pointer-events-none"/>
  </div>
</div>
    <div class="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-gray-100 overflow-hidden flex flex-col">
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
          <tr v-else v-for="service in paginatedServices" :key="service.id" 
              class="group hover:bg-red-50/20 transition-all">
            <td class="px-8 py-6 flex items-center gap-6">
              <div class="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <img v-if="service.image_url" :src="service.image_url" class="w-full h-full object-cover"/>
                <div v-else class="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon class="w-6 h-6"/></div>
              </div>
              <div>
                <h3 class="font-black text-base uppercase italic text-slate-900 leading-none mb-1.5">{{service.name}}</h3>
                <div class="flex items-center gap-2">
                   <span class="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">
                     {{categories.find(c=>c.id===service.category_id)?.name || 'N/A'}}
                   </span>
                   <span class="text-[10px] font-mono text-gray-400 font-bold">/{{service.slug}}</span>
                </div>
              </div>
            </td>
            <td class="px-8 py-6">
              <div v-if="service.price_rules?.length">
                  <p class="text-lg font-black text-blue-600 leading-none">{{ service.price_rules[0].unit_price?.toLocaleString() }}đ</p>
                  <p class="text-[9px] font-bold text-gray-400 uppercase italic mt-1">{{service.price_rules.length}} mốc giá</p>
              </div>
              <span v-else class="text-[10px] font-black text-gray-300 uppercase italic">Chưa cài giá</span>
            </td>
            <td class="px-8 py-6 text-right">
              <div class="flex justify-end gap-3">
                <button @click="openEditModal(service)" 
                  class="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all active:scale-90 flex items-center justify-center group/btn">
                  <Pencil class="w-4 h-4 group-hover/btn:rotate-12 transition-transform"/>
                </button>
                <button @click="deleteService(service.id)" 
                  class="p-3 bg-red-50 text-red-500 border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_8px_20px_-6px_rgba(220,38,38,0.5)] transition-all active:scale-90 flex items-center justify-center group/btn">
                  <Trash2 class="w-4 h-4 group-hover/btn:shake transition-transform"/>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

 <div class="p-6 bg-gray-50/50 border-t flex flex-col md:flex-row justify-between items-center gap-4">
  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
    Hiển thị {{ paginatedServices.length }} / {{ filteredServices.length }} sản phẩm
  </p>
  
  <div class="flex items-center gap-2">
    <button 
      @click="currentPage--; window.scrollTo({ top: 0, behavior: 'smooth' })" 
      :disabled="currentPage === 1"
      class="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <div class="flex items-center gap-1">
      <button 
        v-for="page in totalPages" 
        :key="page"
        @click="currentPage = page; window.scrollTo({ top: 0, behavior: 'smooth' })"
        class="w-9 h-9 rounded-xl text-[11px] font-black transition-all border"
        :class="currentPage === page 
          ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200' 
          : 'bg-white text-slate-500 border-gray-100 hover:border-red-500 hover:text-red-500 shadow-sm'"
      >
        {{ page }}
      </button>
    </div>

    <button 
      @click="currentPage++; window.scrollTo({ top: 0, behavior: 'smooth' })" 
      :disabled="currentPage === totalPages || totalPages === 0"
      class="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-90"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div class="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-modal-in">
        <div class="p-10 border-b flex justify-between items-center bg-gray-50/50">
          <div class="flex items-center gap-5">
            <div class="p-4 bg-black rounded-2xl text-white"><Layers class="w-6 h-6" /></div>
            <div>
              <h3 class="text-3xl font-black uppercase italic tracking-tighter text-slate-900">{{ isEditing ? 'Cấu hình Dịch vụ' : 'Thêm Dịch vụ mới' }}</h3>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Thông tin cơ bản & Bảng giá</p>
            </div>
          </div>
          <button @click="showModal = false" class="p-4 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-gray-200"><X class="w-6 h-6 text-gray-400" /></button>
        </div>

        <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-white">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div class="md:col-span-4">
              <div @click="triggerUpload" class="w-full aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-all overflow-hidden relative group shadow-inner">
                  <img v-if="imagePreview || form.image_url" :src="imagePreview || form.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                  <div v-else class="text-center">
                    <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center text-gray-300 group-hover:text-red-500 mb-3 shadow-sm mx-auto transition-colors"><UploadCloud class="w-6 h-6" /></div>
                    <p class="text-[10px] font-black uppercase text-gray-400">Tải ảnh lên</p>
                  </div>
                  <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*">
              </div>
            </div>
            <div class="md:col-span-8 space-y-5">
              <div>
                <label class="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Tên dịch vụ hiển thị</label>
                <input v-model="form.name" type="text" class="w-full p-4 bg-gray-50 rounded-2xl font-black text-sm border border-transparent focus:bg-white focus:border-red-500 outline-none shadow-sm transition-all" placeholder="VD: In Tờ Rơi A5">
              </div>
              <div class="grid grid-cols-2 gap-5">
                <div>
                  <label class="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Thuộc danh mục</label>
                  <select v-model="form.category_id" class="w-full p-4 bg-gray-50 rounded-2xl font-black text-xs border border-transparent focus:bg-white focus:border-red-500 outline-none shadow-sm appearance-none uppercase transition-all">
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{cat.name}}</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Slug (URL)</label>
                  <input v-model="form.slug" type="text" class="w-full p-4 bg-gray-50 rounded-2xl font-mono text-xs border border-transparent focus:bg-white focus:border-red-500 outline-none shadow-sm transition-all" placeholder="in-to-roi">
                </div>
              </div>
              <div>
                <label class="text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest">Mô tả tóm tắt</label>
                <textarea v-model="form.description" class="w-full p-4 bg-gray-50 rounded-2xl font-medium text-xs border border-transparent focus:bg-white focus:border-red-500 outline-none shadow-sm h-24 transition-all"></textarea>
              </div>
            </div>
          </div>
          <hr class="border-gray-100">
          <div class="space-y-6">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-black uppercase text-xl italic text-slate-900 mb-1">Bảng giá bậc thang</h4>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chiết khấu theo số lượng in</p>
              </div>
              <button @click="addPriceRule" class="text-[10px] font-black bg-blue-50 text-blue-600 px-5 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase shadow-sm flex items-center gap-2">
                <Plus class="w-4 h-4"/> Thêm mốc giá
              </button>
            </div>
            <div class="space-y-3">
              <div v-for="(rule, rIdx) in form.price_rules" :key="rIdx" class="flex items-center gap-4 bg-gray-50 p-5 rounded-[1.5rem] border border-transparent hover:border-blue-200 transition-all">
                <div class="flex-1 grid grid-cols-3 gap-6">
                  <div>
                    <label class="text-[9px] font-black text-gray-400 uppercase mb-1.5 block">Từ (SL)</label>
                    <input v-model.number="rule.min_qty" type="number" class="w-full p-3.5 bg-white rounded-xl font-black text-sm outline-none shadow-sm border border-gray-100" placeholder="1">
                  </div>
                  <div>
                    <label class="text-[9px] font-black text-gray-400 uppercase mb-1.5 block">Đến (SL)</label>
                    <input v-model.number="rule.max_qty" type="number" class="w-full p-3.5 bg-white rounded-xl font-black text-sm outline-none shadow-sm border border-gray-100" placeholder="∞">
                  </div>
                  <div>
                    <label class="text-[9px] font-black text-red-500 uppercase mb-1.5 block">Đơn giá (đ)</label>
                    <input v-model.number="rule.unit_price" type="number" class="w-full p-3.5 bg-white rounded-xl font-black text-sm text-red-600 outline-none shadow-sm border border-red-100 focus:border-red-500" placeholder="0">
                  </div>
                </div>
                <button @click="removePriceRule(rIdx)" class="p-4 bg-white rounded-xl text-gray-300 hover:text-red-500 shadow-sm border border-gray-100 mt-5 transition-colors"><Trash2 class="w-5 h-5"/></button>
              </div>
            </div>
          </div>
          <hr class="border-gray-100">
          <div class="space-y-6">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-black uppercase text-xl italic text-slate-900 mb-1">Gia công (Options)</h4>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cán màng, cấn bế, ép nhũ...</p>
              </div>
              <button @click="addOptionGroup" class="text-[10px] font-black bg-black text-white px-5 py-3 rounded-xl hover:bg-red-600 transition-all uppercase shadow-md flex items-center gap-2">
                <Plus class="w-4 h-4"/> Thêm nhóm
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="(group, gIdx) in form.option_groups" :key="gIdx" class="bg-gray-50 p-6 rounded-[2rem] relative border border-gray-100 shadow-sm">
                <button @click="removeGroup(gIdx)" class="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"><Trash2 class="w-5 h-5"/></button>
                <div class="mb-5 pr-10">
                    <label class="text-[9px] font-black text-gray-400 uppercase mb-1.5 block tracking-widest">Tên nhóm (VD: Cán Màng)</label>
                    <input v-model="group.name" placeholder="Nhập tên nhóm..." class="bg-white p-4 rounded-xl font-black text-sm w-full border border-gray-100 shadow-sm outline-none focus:border-red-500 transition-colors">
                </div>
                <div class="space-y-3">
                  <div v-for="(opt, oIdx) in group.options" :key="oIdx" class="flex gap-2 items-center bg-white p-2 pl-4 rounded-xl shadow-sm border border-gray-100">
                    <input v-model="opt.label" placeholder="Thuộc tính (Cán mờ)" class="flex-1 text-xs font-bold border-none outline-none">
                    <div class="flex items-center gap-1 border-l pl-3">
                      <span class="text-[10px] font-black text-green-500">+</span>
                      <input v-model.number="opt.price_modifier" type="number" class="w-16 text-xs font-black text-slate-800 border-none outline-none text-right bg-gray-50 rounded p-1" placeholder="0">
                      <span class="text-[9px] font-black text-gray-400 uppercase">đ</span>
                    </div>
                    <button @click="removeOption(gIdx, oIdx)" class="p-2 text-slate-300 hover:text-red-500"><X class="w-4 h-4"/></button>
                  </div>
                  <button @click="addOption(gIdx)" class="w-full py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black text-gray-400 uppercase hover:border-red-500 hover:text-red-500 transition-colors mt-2">+ Thêm thuộc tính</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-10 bg-gray-50 border-t flex justify-end gap-4 items-center">
          <button @click="showModal = false; resetForm()" class="px-8 py-4 font-black uppercase text-xs text-gray-500 hover:text-black transition-colors">Huỷ bỏ</button>
          <button @click="handleSubmit" :disabled="isSubmitting" class="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-red-600 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin"/>
            {{ isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm mới' }}
          </button>
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
.animate-modal-in { animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(40px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
</style>