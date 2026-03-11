<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/utils/axios'
import { 
  Plus, Pencil, Trash2, Image as ImageIcon, 
  RefreshCw, X, UploadCloud, Layers, 
  Check, AlertCircle, ChevronDown, Search, Tag
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

    // 3. QUAN TRỌNG NHẤT: Lấy link thật từ Server (/static/uploads/...) gán vào form
    form.value.image_url = res.data.image_url
    
    console.log("Thành công:", res.data.image_url)
  } catch (err) {
    console.error("Lỗi upload:", err)
    alert("Không up được ảnh! Check lại Backend folder static/uploads xem có chưa.")
  }
}

// Logic cho Price Rules (Bảng giá số lượng)
const addPriceRule = () => {
  form.value.price_rules.push({ min_qty: 1, max_qty: null, unit_price: 0 })
}
const removePriceRule = (index) => form.value.price_rules.splice(index, 1)

// Logic cho Option Groups (Gia công)
const addOptionGroup = () => {
  form.value.option_groups.push({
    name: '',
    is_required: true,
    options: [{ label: '', price_modifier: 0 }]
  })
}
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

const filteredServices = computed(() => {
  if (!services.value) return []
  return services.value.filter(s => {
    const name = s.name || ''
    const matchName = name.toLowerCase().includes(search.value.toLowerCase())
    const matchCategory = !filterCategory.value || s.category_id == filterCategory.value
    return matchName && matchCategory
  })
})

const openEditModal = (service) => {
  isEditing.value = true
  currentServiceId.value = service.id
  // Deep copy để tránh sửa trực tiếp vào mảng chính
  form.value = JSON.parse(JSON.stringify(service))
  if(!form.value.option_groups) form.value.option_groups = []
  if(!form.value.price_rules) form.value.price_rules = []
  showModal.value = true
}

const deleteService = async (id) => {
  if(!confirm("Xác nhận xóa dịch vụ này?")) return
  try {
    await axios.delete(`/admin/services/${id}`)
    fetchServices()
  } catch(err) { alert("Lỗi xóa!") }
}

// Gợi ý cách sửa hàm handleSubmit trong file Vue
const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('token'); 
    
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    if (isEditing.value) {
      // Truyền thêm config có chứa Token vào đây
      await axios.put(`/admin/services/${currentServiceId.value}`, form.value, config);
    } else {
      await axios.post('/admin/services', form.value, config);
    }
    
    showModal.value = false;
    alert("Thành công!");
    fetchServices();
  } catch (err) {
    if (err.response?.status === 401) {
      alert("Hết phiên làm việc, vui lòng đăng nhập lại!");
    } else {
      alert("Lỗi lưu dữ liệu!");
    }
  }
}

onMounted(fetchServices)
</script>

<template>
  <div class="min-h-screen bg-[#F3F4F6] p-4 md:p-8 font-sans text-slate-900">
    
    <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm mb-8 border border-white">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-200">
          <Layers class="w-6 h-6"/>
        </div>
        <div>
          <h1 class="text-2xl font-black uppercase tracking-tighter leading-none">Kho Dịch Vụ</h1>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Xưởng in TYD v2.4</p>
        </div>
      </div>
      
      <button @click="showModal = true; isEditing = false" 
        class="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-red-600 transition-all shadow-xl active:scale-95">
        <Plus class="w-5 h-5" /> Thêm mới
      </button>
    </div>

    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
      <div class="md:col-span-8 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
        <input v-model="search" placeholder="Tìm tên sản phẩm..." 
          class="w-full p-4 pl-12 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-red-600 outline-none font-bold text-sm"/>
      </div>
      <div class="md:col-span-4">
        <select v-model="filterCategory" class="w-full p-4 rounded-xl border-none shadow-sm font-black text-xs uppercase outline-none focus:ring-2 focus:ring-red-600 appearance-none bg-white">
          <option value="">Tất cả danh mục</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{c.name}}</option>
        </select>
      </div>
    </div>

    <div class="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <th class="p-6 text-left">Sản phẩm</th>
              <th class="p-6 text-left">Giá khởi điểm</th>
              <th class="p-6 text-left">Phân loại</th>
              <th class="p-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading">
              <td colspan="4" class="p-20 text-center"><RefreshCw class="animate-spin mx-auto text-red-600 w-8 h-8"/></td>
            </tr>
            
            <tr v-for="service in filteredServices" :key="service.id" class="hover:bg-gray-50/80 transition-all group">
              <td class="p-6 flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 border overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  <img v-if="service.image_url" :src="service.image_url" class="w-full h-full object-cover"/>
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon/></div>
                </div>
                <div>
                  <p class="font-black text-sm uppercase italic text-gray-900 leading-none mb-1">{{service.name}}</p>
                  <p class="text-[9px] font-mono text-gray-400 font-bold tracking-tighter">/{{service.slug}}</p>
                </div>
              </td>
              <td class="p-6">
                <div v-if="service.price_rules?.length" class="flex items-center gap-2">
                    <span class="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        {{ service.price_rules[0].unit_price?.toLocaleString() }}đ
                    </span>
                    <span class="text-[9px] text-gray-400 font-bold italic">({{service.price_rules.length}} mốc)</span>
                </div>
                <span v-else class="text-[10px] text-gray-300 italic">Chưa cài giá</span>
              </td>
              <td class="p-6 text-[10px] font-black uppercase text-slate-500">
                {{categories.find(c=>c.id===service.category_id)?.name || 'N/A'}}
              </td>
              <td class="p-6 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="openEditModal(service)" class="p-3 bg-white border border-gray-200 rounded-xl hover:bg-black hover:text-white transition shadow-sm text-gray-500"><Pencil class="w-4 h-4"/></button>
                  <button @click="deleteService(service.id)" class="p-3 bg-white border border-gray-200 rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm text-gray-500"><Trash2 class="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] shadow-2xl overflow-hidden flex flex-col animate-modal-in">
        
        <div class="p-8 border-b flex justify-between items-center bg-gray-50/30">
          <h3 class="text-xl font-black uppercase italic tracking-tighter">{{ isEditing ? 'Cấu hình sản phẩm' : 'Thêm mới sản phẩm' }}</h3>
          <button @click="showModal = false" class="p-2 hover:bg-gray-100 rounded-full transition-colors"><X/></button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div class="md:col-span-4">
              <div @click="triggerUpload" class="aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-all overflow-hidden relative group">
                  <img v-if="imagePreview || form.image_url" :src="imagePreview || form.image_url" class="w-full h-full object-cover">
                  <UploadCloud v-else class="w-10 h-10 text-gray-300" />
                  <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*">
              </div>
            </div>
            
            <div class="md:col-span-8 space-y-4">
              <div>
                <label class="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Tên dịch vụ</label>
                <input v-model="form.name" type="text" class="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-red-600 outline-none shadow-sm" placeholder="VD: In Tờ Rơi A5">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Danh mục</label>
                  <select v-model="form.category_id" class="w-full p-4 bg-gray-50 rounded-xl font-bold border-none outline-none">
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{cat.name}}</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Slug (URL)</label>
                  <input v-model="form.slug" type="text" class="w-full p-4 bg-gray-50 rounded-xl font-mono text-xs border-none outline-none shadow-sm">
                </div>
              </div>
              <div>
                <label class="text-[10px] font-black uppercase text-gray-400 mb-1 block tracking-widest">Mô tả ngắn</label>
                <textarea v-model="form.description" class="w-full p-4 bg-gray-50 rounded-xl font-medium text-xs border-none outline-none shadow-sm h-16"></textarea>
              </div>
            </div>
          </div>

          <div class="space-y-6 bg-blue-50/40 p-8 rounded-[2.5rem] border border-blue-100">
            <div class="flex justify-between items-center border-b border-blue-200 pb-4">
              <h4 class="font-black uppercase text-sm italic flex items-center gap-2 text-blue-800">
                <Tag class="w-4 h-4"/> Bảng giá theo số lượng (Volume Pricing)
              </h4>
              <button @click="addPriceRule" class="text-[10px] font-black bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-black transition-all uppercase shadow-lg shadow-blue-100">
                + Thêm khoảng giá
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="(rule, rIdx) in form.price_rules" :key="rIdx" 
                class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-white hover:border-blue-300 transition-all group/rule animate-in fade-in slide-in-from-top-2">
                
                <div class="flex-1 grid grid-cols-3 gap-6">
                  <div>
                    <label class="text-[9px] font-black text-gray-400 uppercase mb-1 block">Từ (SL)</label>
                    <input v-model.number="rule.min_qty" type="number" class="w-full p-3 bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500 border-none" placeholder="1">
                  </div>
                  <div>
                    <label class="text-[9px] font-black text-gray-400 uppercase mb-1 block">Đến (SL)</label>
                    <input v-model.number="rule.max_qty" type="number" class="w-full p-3 bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500 border-none" placeholder="∞">
                  </div>
                  <div>
                    <label class="text-[9px] font-black text-red-500 uppercase mb-1 block">Đơn giá (đ)</label>
                    <input v-model.number="rule.unit_price" type="number" class="w-full p-3 bg-red-50 rounded-xl font-black text-xs text-red-600 outline-none focus:ring-2 focus:ring-red-600 border-none" placeholder="0">
                  </div>
                </div>

                <button @click="removePriceRule(rIdx)" class="p-2 text-gray-200 hover:text-red-500 transition-colors mt-4">
                  <X class="w-5 h-5"/>
                </button>
              </div>
              
              <div v-if="form.price_rules.length === 0" class="text-center py-10">
                <AlertCircle class="w-8 h-8 mx-auto text-blue-200 mb-2"/>
                <p class="text-[10px] font-bold text-blue-300 uppercase italic">Chưa có bảng giá. Vui lòng thêm ít nhất 1 mốc giá.</p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex justify-between items-center border-b pb-4 text-slate-800">
              <h4 class="font-black uppercase text-sm italic flex items-center gap-2">
                <Layers class="w-4 h-4 text-red-600"/> Tùy chọn gia công (Options)
              </h4>
              <button @click="addOptionGroup" class="text-[10px] font-black bg-black text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors uppercase">+ Thêm nhóm gia công</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="(group, gIdx) in form.option_groups" :key="gIdx" class="bg-gray-50 p-6 rounded-[2.5rem] relative border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <button @click="removeGroup(gIdx)" class="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4"/></button>
                
                <div class="mb-4 pr-10">
                    <label class="text-[9px] font-black text-gray-400 uppercase mb-1 block tracking-widest">Tên nhóm gia công</label>
                    <input v-model="group.name" placeholder="VD: Loại cán màng" class="bg-white p-4 rounded-xl font-black text-xs w-full border-none shadow-sm outline-none focus:ring-2 focus:ring-red-500">
                </div>

                <div class="space-y-2">
                  <div v-for="(opt, oIdx) in group.options" :key="oIdx" class="flex gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-white transition-all hover:border-red-100">
                    <input v-model="opt.label" placeholder="VD: Màng mờ" class="flex-1 px-3 text-[11px] font-bold border-none outline-none">
                    <div class="flex items-center gap-1 border-l pl-3">
                      <span class="text-[9px] font-black text-gray-300">+</span>
                      <input v-model.number="opt.price_modifier" type="number" class="w-16 text-[11px] font-black text-red-600 border-none outline-none" placeholder="0">
                      <span class="text-[9px] font-black text-gray-400 uppercase ml-1">đ</span>
                    </div>
                    <button @click="removeOption(gIdx, oIdx)" class="p-1 text-gray-200 hover:text-red-500"><X class="w-4 h-4"/></button>
                  </div>
                  <button @click="addOption(gIdx)" class="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-[9px] font-black text-gray-400 uppercase hover:border-red-500 hover:text-red-500 transition-all mt-2">
                    + Thêm dòng giá trị
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-8 bg-gray-50 border-t flex gap-4">
          <button @click="showModal = false; resetForm()" class="px-8 py-4 font-black uppercase text-xs text-gray-400 hover:text-black transition-colors">Huỷ bỏ</button>
          <button @click="handleSubmit" class="flex-1 bg-black text-white py-4 rounded-xl font-black uppercase text-xs shadow-xl shadow-slate-200 hover:bg-red-600 transition-all active:scale-[0.98]">
            {{ isEditing ? 'Cập nhật cấu hình dịch vụ' : 'Xác nhận kích hoạt sản phẩm' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
.font-sans { font-family: 'Inter', sans-serif; }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }

.animate-modal-in { animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.animate-in {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
.fade-in { animation-name: fadeIn; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.slide-in-from-top-2 { animation-name: slideInTop; }
@keyframes slideInTop { from { transform: translateY(-0.5rem); } to { transform: translateY(0); } }
</style>