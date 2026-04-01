<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from '@/utils/axios'
import { 
  Plus, Pencil, Trash2, RefreshCw, X, 
  Layers, Search, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon, 
  UploadCloud, FolderTree, CornerDownRight, Link as LinkIcon, AlertCircle
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
const selectedIds = ref([])

// Reset lựa chọn khi đổi trang hoặc tìm kiếm
watch([currentPage, search], () => {
  selectedIds.value = []
})

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await axios.get('/services/categories')
    categories.value = res.data || []
    selectedIds.value = []
  } catch (err) {
    console.error("Lỗi fetch:", err)
  } finally {
    loading.value = false
  }
}

// 1. LOGIC ĐỆ QUY: Danh sách chọn cấp cha (Dùng cho Select trong Modal)
const parentCategoriesList = computed(() => {
  const list = []
  const traverse = (parentId, depth = 0) => {
    // Sử dụng == để tránh lỗi type string/number từ API
    const children = categories.value.filter(c => c.parent_id == parentId && c.id != currentId.value)
    children.forEach(c => {
      list.push({ ...c, displayName: `${'|— '.repeat(depth)}${c.name}` })
      traverse(c.id, depth + 1) // Gọi đệ quy cho tầng tiếp theo
    })
  }
  traverse(null, 0)
  return list
})

// 2. LOGIC ĐỆ QUY: Lọc các danh mục gốc để phân trang
const filteredRootParents = computed(() => {
  let roots = categories.value.filter(c => c.parent_id === null || c.parent_id == 0)
  
  if (search.value) {
    const s = search.value.toLowerCase()
    roots = roots.filter(p => {
      const matchP = p.name.toLowerCase().includes(s)
      const matchAnyChild = categories.value.some(c => 
        c.name.toLowerCase().includes(s) && isDescendantOf(c, p.id)
      )
      return matchP || matchAnyChild
    })
  }
  return roots
})

// Hàm phụ hỗ trợ kiểm tra quan hệ cha-con đa tầng
const isDescendantOf = (child, parentId) => {
  if (!child.parent_id) return false
  if (child.parent_id == parentId) return true
  const parent = categories.value.find(c => c.id == child.parent_id)
  return parent ? isDescendantOf(parent, parentId) : false
}

const totalPages = computed(() => Math.ceil(filteredRootParents.value.length / itemsPerPage))

// 3. LOGIC ĐỆ QUY: Hiển thị bảng dạng cây (Vẽ toàn bộ các tầng con)
const displayTreeRows = computed(() => {
  const result = []
  const s = search.value.toLowerCase()

  const start = (currentPage.value - 1) * itemsPerPage
  const paginatedRoots = filteredRootParents.value.slice(start, start + itemsPerPage)

  const traverse = (parentId, depth = 0) => {
    const children = categories.value.filter(c => c.parent_id == parentId)
    children.forEach(cat => {
      const matchSelf = cat.name.toLowerCase().includes(s) || cat.slug.toLowerCase().includes(s)
      const matchDescendant = categories.value.some(child => 
        child.name.toLowerCase().includes(s) && isDescendantOf(child, cat.id)
      )

      if (!s || matchSelf || matchDescendant) {
        result.push({ 
          ...cat, 
          depth, 
          isParentRow: cat.parent_id === null || cat.parent_id == 0,
          isChildRow: cat.parent_id !== null && cat.parent_id != 0 
        })
        traverse(cat.id, depth + 1) // Đệ quy liên tục cho đến khi hết con
      }
    })
  }

  paginatedRoots.forEach(root => {
    result.push({ ...root, depth: 0, isParentRow: true, isChildRow: false })
    traverse(root.id, 1)
  })

  return result
})

const isAllSelected = computed(() => {
  return displayTreeRows.value.length > 0 && selectedIds.value.length === displayTreeRows.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = displayTreeRows.value.map(c => c.id)
  }
}

const bulkDelete = async () => {
  if (!selectedIds.value.length) return
  if (!confirm(`Xóa ${selectedIds.value.length} danh mục? Toàn bộ con của chúng cũng sẽ bị ảnh hưởng!`)) return

  isSubmitting.value = true
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    await Promise.allSettled(
      selectedIds.value.map(id => axios.delete(`/admin/categories/${id}`, config))
    )
    fetchCategories()
  } catch (err) {
    alert("Lỗi xóa hàng loạt!")
  } finally {
    isSubmitting.value = false
  }
}

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
  form.value = { name: cat.name, slug: cat.slug, image_url: cat.image_url, parent_id: cat.parent_id }
  imagePreview.value = cat.image_url
  showModal.value = true
}

const deleteCategory = async (id) => {
  if (!confirm("Xác nhận xóa?")) return
  try {
    const token = localStorage.getItem('token')
    await axios.delete(`/admin/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } })
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
        <h1 class="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Quản lý Danh Mục</h1>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 ">Cấu trúc phân loại đa cấp hệ thống</p>
      </div>
      <div class="flex flex-wrap gap-3 w-full md:w-auto">
        <button v-if="selectedIds.length > 0" @click="bulkDelete" class="flex-1 md:flex-none bg-red-50 text-red-600 px-6 py-3 border border-red-200 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 group">
          <Trash2 class="w-5 h-5 group-hover:shake" /> Xóa ({{ selectedIds.length }})
        </button>
        <button @click="fetchCategories" class="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl text-slate-500 hover:text-blue-600 hover:shadow-md transition-all active:scale-95">
          <RefreshCw :class="['w-5 h-5', loading ? 'animate-spin' : '']" />
        </button>
        <button @click="showModal = true; isEditing = false; resetForm()" class="flex-1 md:flex-none bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
          <Plus class="w-5 h-5" /> Thêm danh mục
        </button>
      </div>
    </div>

    <div class="relative mb-8 flex items-center group max-w-md">
      <Search class="absolute left-5 text-gray-400 w-5 h-5 z-10 pointer-events-none group-focus-within:text-blue-500"/>
      <input v-model="search" @input="currentPage = 1" placeholder="Tìm kiếm danh mục..." class="w-full py-4 pl-14 bg-white rounded-2xl border border-gray-100 shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none font-semibold text-slate-700 transition-all" />
    </div>

    <div class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr class="bg-white border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400 tracking-widest">
              <th class="pl-8 pr-4 py-5 w-16">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded cursor-pointer accent-blue-600" />
              </th>
              <th class="px-4 py-5">Danh mục & Cấu trúc</th>
              <th class="px-8 py-5">Cấp bậc</th>
              <th class="px-8 py-5">Slug</th>
              <th class="px-8 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100/50">
            <tr v-if="loading">
              <td colspan="5" class="px-8 py-32 text-center"><Loader2 class="w-10 h-10 animate-spin mx-auto text-blue-500" /></td>
            </tr>
            
            <tr v-for="cat in displayTreeRows" :key="cat.id" 
                class="group transition-all duration-200 relative"
                :class="cat.depth === 0 ? 'bg-slate-50/50 border-t-2 border-slate-100' : 'bg-white hover:bg-slate-50'">
              
              <td class="pl-8 pr-4 py-4"><input type="checkbox" :value="cat.id" v-model="selectedIds" class="w-5 h-5 accent-blue-600" /></td>

              <td class="px-4 py-4 relative">
                <template v-for="i in cat.depth" :key="i">
                  <div class="absolute top-0 bottom-0 border-l-2 border-slate-200" 
                       :style="{ left: `${(i - 1) * 2.5 + 1.5}rem` }"></div>
                </template>

                <div class="flex items-center relative" :style="{ marginLeft: `${cat.depth * 2.5}rem` }">
                  <div v-if="cat.depth === 0" class="absolute left-[-2rem] top-0 bottom-0 w-1.5 bg-slate-800 rounded-full"></div>
                  <div v-if="cat.depth > 0" class="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-slate-200"></div>
                  
                  <div class="rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm flex justify-center items-center group-hover:scale-110 transition-transform"
                       :class="cat.depth === 0 ? 'w-12 h-12 ring-4 ring-white' : 'w-9 h-9'">
                    <img v-if="cat.image_url" :src="cat.image_url" class="w-full h-full object-cover"/>
                    <ImageIcon v-else class="w-4 h-4 text-slate-300"/>
                  </div>
                  
                  <div class="ml-3">
                    <span class="block" :class="cat.depth === 0 ? 'font-black text-[14px] uppercase text-slate-900' : 'font-bold text-[13px] text-slate-600'">
                      {{ cat.name }}
                    </span>
                    <span v-if="cat.depth > 1" class="text-[9px] font-bold text-blue-400 uppercase">Tầng {{ cat.depth }}</span>
                  </div>
                </div>
              </td>
              
              <td class="px-8 py-4">
                <span v-if="cat.depth === 0" class="bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-black uppercase">Root</span>
                <span v-else class="text-[10px] font-bold text-slate-400 uppercase">Cấp {{ cat.depth }}</span>
              </td>
              
              <td class="px-8 py-4 text-xs font-mono text-slate-400">/{{ cat.slug }}</td>
              
              <td class="px-8 py-6 text-right">
                <div class="flex justify-end gap-3">
                  <button @click="openEditModal(cat)" class="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90"><Pencil class="w-4 h-4"/></button>
                  <button @click="deleteCategory(cat.id)" class="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90"><Trash2 class="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 bg-white border-t border-slate-100 flex justify-between items-center rounded-b-[2rem]">
        <p class="text-xs font-bold text-slate-400 uppercase">Trang {{ currentPage }} / {{ totalPages || 1 }}</p>
        <div class="flex items-center gap-1.5">
          <button @click="currentPage--" :disabled="currentPage === 1" class="w-10 h-10 flex items-center justify-center bg-white border rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-all"><ChevronLeft class="w-4 h-4"/></button>
          <button v-for="page in totalPages" :key="page" @click="currentPage = page" class="w-10 h-10 rounded-xl text-xs font-black transition-all border-2" :class="currentPage === page ? 'bg-slate-800 border-slate-800 text-white shadow-lg' : 'bg-white border-transparent text-slate-500 hover:border-slate-200'">{{ page }}</button>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="w-10 h-10 flex items-center justify-center bg-white border rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-all"><ChevronRight class="w-4 h-4"/></button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="relative bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl animate-modal-in overflow-hidden">
        <div class="px-8 py-6 border-b flex justify-between items-center bg-white z-10">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><Layers class="w-6 h-6" /></div>
            <h3 class="text-2xl font-black uppercase tracking-tight text-slate-900">{{ isEditing ? 'Cập nhật' : 'Thêm mới' }}</h3>
          </div>
          <button @click="showModal = false" class="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-500 rounded-full hover:text-red-500 transition-colors"><X class="w-5 h-5"/></button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div class="flex flex-col lg:flex-row gap-10">
            <div class="w-full lg:w-1/3 flex flex-col gap-3">
              <label class="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-2"><ImageIcon class="w-4 h-4" /> Ảnh đại diện</label>
              <div @click="triggerUpload" class="relative w-full aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden shadow-inner">
                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover">
                <UploadCloud v-else class="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*">
              </div>
            </div>

            <div class="w-full lg:w-2/3 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2 block">Tên danh mục</label>
                  <input v-model="form.name" type="text" class="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold border border-slate-100 outline-none focus:bg-white focus:border-blue-400 transition-all shadow-sm">
                </div>
                <div>
                  <label class="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2 block">Danh mục cha</label>
                  <select v-model="form.parent_id" class="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-blue-400 border border-slate-100 transition-all shadow-sm cursor-pointer appearance-none">
                    <option :value="null">-- Không có (Gốc) --</option>
                    <option v-for="p in parentCategoriesList" :key="p.id" :value="p.id">{{ p.displayName }}</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2 block">Slug</label>
                <input v-model="form.slug" type="text" class="w-full px-5 py-4 bg-slate-50 rounded-2xl font-mono text-sm border border-slate-100 focus:bg-white transition-all shadow-sm">
              </div>
            </div>
          </div>
        </div>

        <div class="px-8 py-6 bg-slate-50 border-t flex justify-end gap-3">
          <button @click="showModal = false" class="px-6 py-3.5 font-bold uppercase text-xs text-slate-500 hover:text-slate-800">Hủy bỏ</button>
          <button @click="handleSubmit" :disabled="isSubmitting || !form.name" class="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black uppercase text-xs shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2">
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin"/>
            {{ isEditing ? 'Lưu cập nhật' : 'Tạo mới' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
.animate-modal-in { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
.group:hover .group-hover\:shake { animation: shake 0.4s ease-in-out; }
</style>