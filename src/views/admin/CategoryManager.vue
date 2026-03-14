<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/utils/axios'
import { 
  Plus, Pencil, Trash2, RefreshCw, X, 
  Layers, Search, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon, 
  UploadCloud, FolderTree, CornerDownRight, Link as LinkIcon
} from 'lucide-vue-next'

const categories = ref([])
const loading = ref(true)
const isSubmitting = ref(false)
const search = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const imagePreview = ref(null)
const fileInput = ref(null)

const currentPage = ref(1)
const itemsPerPage = 10

const form = ref({ name: '', slug: '', image_url: '', parent_id: null })

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await axios.get('/services/categories')
    categories.value = res.data || []
  } catch (err) {
    console.error("Lỗi fetch:", err)
  } finally {
    loading.value = false
  }
}

const parentCategoriesList = computed(() => {
  return categories.value.filter(c => c.parent_id === null && c.id !== currentId.value)
})

const filteredParents = computed(() => {
  let parents = categories.value.filter(c => c.parent_id === null)
  
  if (search.value) {
    const s = search.value.toLowerCase()
    parents = parents.filter(p => {
      const matchP = p.name.toLowerCase().includes(s)
      const matchC = categories.value.some(c => c.parent_id === p.id && c.name.toLowerCase().includes(s))
      return matchP || matchC
    })
  }
  return parents
})

const totalPages = computed(() => Math.ceil(filteredParents.value.length / itemsPerPage))

const displayTreeRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  const paginatedParents = filteredParents.value.slice(start, end)

  const result = []
  paginatedParents.forEach(p => {
    result.push({ ...p, isParentRow: true })
    
    let children = categories.value.filter(c => c.parent_id === p.id)
    if (search.value) {
      const s = search.value.toLowerCase()
      children = children.filter(c => c.name.toLowerCase().includes(s) || p.name.toLowerCase().includes(s))
    }
    
    children.forEach(c => {
      result.push({ ...c, isChildRow: true })
    })
  })
  
  return result
})

const resetForm = () => {
  form.value = { name: '', slug: '', image_url: '', parent_id: null }
  imagePreview.value = null
  isEditing.value = false
  currentId.value = null
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
  } catch (err) { alert("Lỗi tải ảnh!") }
}

const openEditModal = (cat) => {
  isEditing.value = true
  currentId.value = cat.id
  form.value = { 
    name: cat.name, 
    slug: cat.slug, 
    image_url: cat.image_url, 
    parent_id: cat.parent_id 
  }
  imagePreview.value = cat.image_url
  showModal.value = true
}

const deleteCategory = async (id) => {
  if (!confirm("Xóa danh mục này có thể ảnh hưởng đến sản phẩm liên quan. Bạn chắc chắn chứ?")) return
  try {
    await axios.delete(`/admin/categories/${id}`)
    fetchCategories()
  } catch (err) { alert("Lỗi xóa!") }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    if (isEditing.value) {
      await axios.put(`/admin/categories/${currentId.value}`, form.value, config)
    } else {
      await axios.post('/admin/categories', form.value, config)
    }
    showModal.value = false
    fetchCategories()
  } catch (err) {
    alert("Lỗi lưu dữ liệu!")
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchCategories)
</script>

<template>
  <div class="p-4 md:p-8 max-w-[1400px] mx-auto font-sans min-h-screen bg-[#F8FAFC]">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
          <h1 class="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Quản lý Danh Mục</h1>
        </h1>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 ">Cấu trúc phân loại hệ thống</p>
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <button @click="fetchCategories" class="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl text-slate-500 hover:text-red-600 hover:shadow-md transition-all active:scale-95">
          <RefreshCw :class="['w-5 h-5', loading ? 'animate-spin' : '']" />
        </button>
        <button @click="showModal = true; isEditing = false; resetForm()" class="flex-1 md:flex-none bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-slate-900/20 active:scale-95 group">
          <Plus class="w-5 h-5 group-hover:rotate-90 transition-transform" /> Thêm danh mục
        </button>
      </div>
    </div>

    <div class="relative mb-8 flex items-center group max-w-md">
      <Search class="absolute left-5 text-gray-400 w-5 h-5 z-10 pointer-events-none transition-colors group-focus-within:text-red-500"/>
      <input 
        v-model="search" 
        @input="currentPage = 1" 
        placeholder="Tìm kiếm danh mục..." 
        class="w-full py-4 pr-4 pl-14 bg-white rounded-2xl border border-gray-100 shadow-sm focus:border-red-400 focus:ring-4 focus:ring-red-500/10 outline-none font-semibold text-slate-700 transition-all placeholder:font-medium"
      />
    </div>

    <div class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col">
      <div class="flex-1 overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr class="bg-white border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400 tracking-widest">
              <th class="px-8 py-5 rounded-tl-[2rem]">Ảnh đại diện</th>
              <th class="px-8 py-5">Tên danh mục</th>
              <th class="px-8 py-5">Cấp bậc</th>
              <th class="px-8 py-5">Đường dẫn (Slug)</th>
              <th class="px-8 py-5 text-right rounded-tr-[2rem]">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100/50">
            <tr v-if="loading">
              <td colspan="5" class="px-8 py-32 text-center">
                <Loader2 class="w-10 h-10 animate-spin mx-auto text-red-500 mb-4" />
                <p class="text-sm font-bold text-slate-400">Đang tải cấu trúc danh mục...</p>
              </td>
            </tr>
            
            <tr v-else-if="displayTreeRows.length === 0" class="bg-white">
              <td colspan="5" class="px-8 py-32 text-center">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderTree class="w-10 h-10 text-slate-300" />
                </div>
                <p class="text-sm font-bold text-slate-500 mb-1">Không tìm thấy dữ liệu</p>
                <p class="text-xs text-slate-400">Chưa có danh mục nào hoặc không khớp với tìm kiếm.</p>
              </td>
            </tr>

            <tr v-for="cat in displayTreeRows" :key="cat.id" 
                class="group transition-all duration-200 relative"
                :class="cat.isParentRow 
                  ? 'bg-slate-100/80 border-t-2 border-slate-200/70 hover:bg-slate-200/50 z-10' 
                  : 'bg-white hover:bg-slate-50 border-b border-slate-50'">
              
              <td class="px-8 py-4 relative">
                <div v-if="cat.isParentRow" class="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.1)]"></div>
                
                <div class="flex items-center" :class="{'ml-12 relative': cat.isChildRow}">
                  <CornerDownRight v-if="cat.isChildRow" stroke-width="2.5" class="w-6 h-6 text-slate-300 absolute -left-8 -top-1" />
                  
                  <div class="rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm flex justify-center items-center"
                       :class="cat.isParentRow ? 'w-14 h-14 ring-4 ring-white' : 'w-11 h-11'">
                    <img v-if="cat.image_url" :src="cat.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                    <ImageIcon v-else class="w-5 h-5 text-slate-300"/>
                  </div>
                </div>
              </td>
              
              <td class="px-8 py-4">
                <span class="transition-colors block"
                      :class="cat.isParentRow 
                        ? 'font-black text-[15px] uppercase tracking-wider text-slate-900 group-hover:text-red-600' 
                        : 'font-bold text-[14px] text-slate-600 group-hover:text-red-500'">
                  {{ cat.name }}
                </span>
              </td>
              
              <td class="px-8 py-4">
                <div v-if="cat.isParentRow" class="inline-flex items-center gap-1.5 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-slate-900/10">
                  <FolderTree class="w-3.5 h-3.5" /> Gốc (Cha)
                </div>
                <div v-else class="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  Mục con
                </div>
              </td>
              
              <td class="px-8 py-4">
                <div class="inline-flex items-center gap-2 text-xs font-mono rounded-lg px-2 py-1"
                     :class="cat.isParentRow ? 'text-slate-500' : 'bg-slate-50 border border-slate-100 text-slate-400'">
                  <span class="text-slate-300">/</span>{{ cat.slug }}
                </div>
              </td>
              
<td class="px-8 py-6 text-right">
              <div class="flex justify-end gap-3">
                <button @click="openEditModal(cat)" 
                  class="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all active:scale-90 flex items-center justify-center group/btn">
                  <Pencil class="w-4 h-4 group-hover/btn:rotate-12 transition-transform"/>
                </button>
                <button @click="deleteCategory(cat.id)" 
                  class="p-3 bg-red-50 text-red-500 border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_8px_20px_-6px_rgba(220,38,38,0.5)] transition-all active:scale-90 flex items-center justify-center group/btn">
                  <Trash2 class="w-4 h-4 group-hover/btn:shake transition-transform"/>
                </button>
              </div>
            </td>

            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 rounded-b-[2rem]">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Đang xem trang <span class="text-slate-800">{{ currentPage }} / {{ totalPages || 1 }}</span>
        </p>
        
        <div class="flex items-center gap-2" v-if="totalPages > 1">
          <button @click="currentPage--" :disabled="currentPage === 1" class="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-all shadow-sm">
            <ChevronLeft class="w-4 h-4 text-slate-600" />
          </button>
          <div class="flex gap-1">
            <button v-for="page in totalPages" :key="page" @click="currentPage = page"
              class="w-9 h-9 rounded-xl text-xs font-black transition-all border"
              :class="currentPage === page ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-500 shadow-sm'">
              {{ page }}
            </button>
          </div>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-all shadow-sm">
            <ChevronRight class="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showModal = false"></div>
      
      <div class="relative bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl animate-modal-in overflow-hidden">
        
        <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
              <Layers class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-2xl font-black uppercase tracking-tight text-slate-900">
                {{ isEditing ? 'Chỉnh sửa Danh mục' : 'Thêm mới Danh mục' }}
              </h3>
              <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {{ isEditing ? 'Cập nhật thông tin phân loại' : 'Tạo một phân loại sản phẩm mới' }}
              </p>
            </div>
          </div>
          <button @click="showModal = false" class="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
            <X class="w-5 h-5"/>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div class="flex flex-col lg:flex-row gap-10">
            
            <div class="w-full lg:w-1/3 flex flex-col gap-3">
              <label class="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <ImageIcon class="w-4 h-4" /> Ảnh đại diện
              </label>
              <div @click="triggerUpload" class="group relative w-full aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all overflow-hidden shadow-inner">
                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div v-else class="text-center p-6">
                  <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud class="w-8 h-8 text-slate-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <p class="text-sm font-bold text-slate-600 mb-1">Tải ảnh lên</p>
                  <p class="text-[11px] font-medium text-slate-400">PNG, JPG, WEBP</p>
                </div>
                <div v-if="imagePreview" class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span class="bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                    <RefreshCw class="w-4 h-4" /> Đổi ảnh
                  </span>
                </div>
                <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*">
              </div>
            </div>

            <div class="w-full lg:w-2/3 space-y-6">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2 block ml-1">Tên danh mục <span class="text-red-500">*</span></label>
                  <input v-model="form.name" type="text" placeholder="VD: In Tờ Rơi" class="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 border border-slate-100 transition-all shadow-sm">
                </div>
                <div>
                  <label class="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2 block ml-1 flex items-center gap-1.5"><FolderTree class="w-3.5 h-3.5"/> Thuộc cụm (Cấp cha)</label>
                  <select v-model="form.parent_id" class="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 border border-slate-100 transition-all shadow-sm cursor-pointer appearance-none">
                    <option :value="null">-- Không có (Làm danh mục Gốc) --</option>
                    <option v-for="p in parentCategoriesList" :key="p.id" :value="p.id" class="font-medium">
                      {{ p.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label class="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2 block ml-1 flex items-center gap-1.5"><LinkIcon class="w-3.5 h-3.5"/> Đường dẫn tĩnh (Slug)</label>
                <div class="flex items-center">
                  <span class="bg-slate-100 border border-slate-200 border-r-0 px-4 py-4 rounded-l-2xl text-slate-400 font-mono text-sm hidden sm:block">domain.com/</span>
                  <input v-model="form.slug" type="text" placeholder="in-to-roi" class="w-full px-5 py-4 bg-slate-50 sm:rounded-l-none rounded-2xl font-mono text-sm text-slate-600 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 border border-slate-100 transition-all shadow-sm">
                </div>
                <p class="text-[10px] text-slate-400 mt-2 ml-1 font-medium">Để trống hệ thống sẽ tự động tạo dựa trên Tên danh mục.</p>
              </div>

            </div>
          </div>
        </div>

        <div class="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3 z-10">
          <button @click="showModal = false; resetForm()" class="px-6 py-3.5 font-bold uppercase text-xs text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm">
            Hủy bỏ
          </button>
          <button @click="handleSubmit" :disabled="isSubmitting || !form.name" class="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black uppercase text-xs shadow-lg shadow-slate-900/20 hover:bg-red-600 hover:shadow-red-600/30 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin"/>
            {{ isEditing ? 'Lưu cập nhật' : 'Tạo mới danh mục' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }

.animate-modal-in { 
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>