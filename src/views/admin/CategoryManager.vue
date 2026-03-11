<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from '@/utils/axios'
import { Plus, Pencil, Trash2, FolderTree, X, Image as ImageIcon, UploadCloud } from 'lucide-vue-next'

const categories = ref([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)

const form = ref({ name: '', slug: '', image_url: '' })
const imagePreview = ref(null)
const fileInput = ref(null)

// Tự động tạo Slug khi gõ Tên
watch(() => form.value.name, (newVal) => {
  if (!isEditing.value && newVal) {
    form.value.slug = newVal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }
})

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await axios.get('/admin/categories')
    categories.value = res.data
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

const openModal = (cat = null) => {
  if (cat) {
    isEditing.value = true
    currentId.value = cat.id
    form.value = { name: cat.name, slug: cat.slug, image_url: cat.image_url }
    imagePreview.value = cat.image_url ? cat.image_url : null
  } else {
    isEditing.value = false
    form.value = { name: '', slug: '', image_url: '' }
    imagePreview.value = null
  }
  showModal.value = true
}

// 🔴 FIX 1: Thêm kiểm tra và log lỗi nếu không thấy thẻ input
const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  } else {
    console.error("Không tìm thấy thẻ input file!")
  }
}

// 🔴 FIX 2: Thêm reset value cho input để không bị kẹt khi up cùng 1 ảnh nhiều lần
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
    alert("Lỗi upload ảnh!") 
    console.error(err)
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await axios.put(`/admin/categories/${currentId.value}`, form.value)
    } else {
      await axios.post('/admin/categories', form.value)
    }
    showModal.value = false
    fetchCategories()
  } catch (err) { alert("Lỗi lưu dữ liệu!") }
}

const deleteCategory = async (id) => {
  if (!confirm("Xóa danh mục này là sẽ liên kết sản phẩm, bạn chắc chắn chứ?")) return
  try {
    await axios.delete(`/admin/categories/${id}`)
    fetchCategories()
  } catch (err) { alert("Lỗi xóa danh mục!") }
}

onMounted(fetchCategories)
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto font-sans">
    <div class="flex justify-between items-center mb-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div class="flex items-center gap-5">
        <div class="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
          <FolderTree class="w-8 h-8"/>
        </div>
        <div>
          <h1 class="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Danh Mục Sản Phẩm</h1>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Quản lý hình ảnh và phân loại xưởng TYD</p>
        </div>
      </div>
      <button @click="openModal()" class="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-indigo-600 transition-all shadow-xl flex items-center gap-2">
        <Plus class="w-5 h-5"/> Thêm nhóm mới
      </button>
    </div>

    <div class="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
      <table class="w-full">
        <thead class="bg-gray-50/50 border-b">
          <tr class="text-[10px] font-black uppercase text-gray-400 tracking-widest text-left">
            <th class="p-8">Danh mục</th>
            <th class="p-8">Đường dẫn (Slug)</th>
            <th class="p-8 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading">
             <td colspan="3" class="p-8 text-center text-gray-400 font-bold italic">Đang tải dữ liệu...</td>
          </tr>
          <tr v-for="cat in categories" :key="cat.id" class="hover:bg-indigo-50/30 transition-all group cursor-pointer" @click="openModal(cat)">
            <td class="p-8 flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-gray-50 border overflow-hidden shrink-0 shadow-sm">
                <img v-if="cat.image_url" :src="cat.image_url" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon class="w-6 h-6" /></div>
              </div>
              <p class="font-black text-lg text-slate-800 uppercase italic leading-none">{{ cat.name }}</p>
            </td>
            <td class="p-8 font-mono text-xs text-indigo-500 font-bold">/{{ cat.slug }}</td>
            <td class="p-8 text-right" @click.stop>
              <div class="flex justify-end gap-2">
                <button @click="openModal(cat)" class="p-3 bg-white border border-gray-200 rounded-xl hover:bg-black hover:text-white transition shadow-sm"><Pencil class="w-4 h-4"/></button>
                <button @click="deleteCategory(cat.id)" class="p-3 bg-white border border-gray-200 rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm"><Trash2 class="w-4 h-4"/></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div class="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-modal-in">
        <div class="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <h3 class="text-2xl font-black uppercase italic tracking-tighter">{{ isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục mới' }}</h3>
          <button @click="showModal = false" class="p-3 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-gray-200"><X class="text-gray-400"/></button>
        </div>
        
        <div class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div class="md:col-span-4">
              <label class="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Ảnh đại diện</label>
              
              <div @click="triggerUpload" class="aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden relative group">
                  <img v-if="imagePreview || form.image_url" :src="imagePreview || form.image_url" class="w-full h-full object-cover">
                  <UploadCloud v-else class="w-10 h-10 text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept="image/*">
              
            </div>

            <div class="md:col-span-8 space-y-4">
              <div>
                <label class="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Tên danh mục</label>
                <input v-model="form.name" type="text" class="w-full p-4 bg-gray-50 rounded-2xl font-black text-sm border-none outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="VD: In Tờ Rơi">
              </div>
              <div>
                <label class="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest flex items-center justify-between">
                  <span>Slug (URL)</span>
                  <span class="text-indigo-400 text-[8px]">Tự động tạo</span>
                </label>
                <input v-model="form.slug" type="text" class="w-full p-4 bg-indigo-50/50 text-indigo-600 rounded-2xl font-mono text-xs border-none outline-none focus:ring-2 focus:ring-indigo-500" placeholder="in-to-roi">
              </div>
            </div>
          </div>
        </div>

        <div class="p-8 bg-gray-50 border-t flex gap-4">
          <button @click="showModal = false" class="px-8 py-4 font-black uppercase text-xs text-gray-400 hover:text-black transition-colors">Huỷ bỏ</button>
          <button @click="handleSubmit" class="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-indigo-600 transition-all">
            {{ isEditing ? 'Lưu thay đổi' : 'Tạo danh mục' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-modal-in { animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>