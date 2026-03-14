<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { Plus, Pencil, Trash2, Image as ImageIcon, Check, X, Loader2, Upload, Newspaper, Globe, Power } from 'lucide-vue-next'
import axios from '@/utils/axios'
import Swal from 'sweetalert2' 

// --- BỘ SOẠN THẢO QUILL ---
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const newsList = ref([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isUploading = ref(false) 
const fileInput = ref(null) 

const form = ref({
  id: null,
  title: '',
  slug: '',
  summary: '',
  content: '',
  image_url: '',
  is_active: true
})

// 1. Lấy danh sách (NewsShort - Nhẹ máy)
const fetchNews = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/news/')
    newsList.value = response.data.data || response.data
  } catch (error) { console.error(error) } finally { isLoading.value = false }
}

// 2. Upload ảnh
const triggerFileInput = () => fileInput.value.click()
const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  isUploading.value = true
  try {
    const res = await axios.post('/admin/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (res.data.image_url) {
      form.value.image_url = res.data.image_url
      Swal.fire({ title: 'Đã tải ảnh!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 })
    }
  } catch (error) { Swal.fire('Lỗi', 'Không up được ảnh', 'error') } finally { isUploading.value = false }
}

// 3. Logic Slug
const generateSlug = (title) => {
  let slug = title.toLowerCase()
  const map = { 'a': /á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'e': /é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'i': /i|í|ì|ỉ|ĩ|ị/g, 'o': /ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'u': /ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'y': /ý|ỳ|ỷ|ỹ|ỵ/g, 'd': /đ/g }
  for (let key in map) slug = slug.replace(map[key], key)
  form.value.slug = slug.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}
watch(() => form.value.title, (newVal) => { if(!form.value.id) generateSlug(newVal) })

// 4. Mở Modal - ĐÃ SỬA ĐỂ LẤY FULL NỘI DUNG (CONTENT)
const openModal = async (item = null) => {
  if (item) {
    // Hiển thị loading xoay xoay cho chuyên nghiệp
    Swal.fire({
      title: 'Đang tải nội dung...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading() }
    });
    
    try {
      // Gọi API lấy đầy đủ thông tin bài viết (bao gồm cả Content)
      const res = await axios.get(`/news/${item.slug}`)
      form.value = { ...res.data }
      Swal.close();
    } catch (error) {
      console.error(error)
      Swal.fire('Lỗi', 'Không lấy được nội dung chi tiết!', 'error')
      return
    }
  } else {
    // Reset form khi viết bài mới
    form.value = { id: null, title: '', slug: '', summary: '', content: '', image_url: '', is_active: true }
  }
  
  isModalOpen.value = true
}

// 5. Lưu dữ liệu
const saveNews = async () => {
  isSubmitting.value = true
  try {
    const { id, created_at, ...payload } = form.value;
    if (id) await axios.put(`/news/${id}`, payload)
    else await axios.post('/news/', payload)
    isModalOpen.value = false
    fetchNews()
    Swal.fire('Thành công', 'Đã lưu bài viết!', 'success')
  } catch (error) { Swal.fire('Lỗi', 'Check lại Backend nhé sếp', 'error') } finally { isSubmitting.value = false }
}

// 6. Xóa bài viết
const confirmDelete = (id) => {
  Swal.fire({ title: 'Xóa bài này?', icon: 'warning', showCancelButton: true }).then(async (r) => {
    if (r.isConfirmed) { await axios.delete(`/news/${id}`); fetchNews() }
  })
}

onMounted(fetchNews)
</script>

<template>
  <div class="p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
          <Newspaper class="w-9 h-9 text-red-600" /> Quản lý tin tức
        </h1>
        <p class="text-slate-500 text-sm font-medium mt-1">Hệ thống biên tập ClickIn</p>
      </div>
      <button @click="openModal()" class="bg-red-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-100 flex items-center gap-2 active:scale-95 group">
        <Plus class="w-5 h-5 group-hover:rotate-90 transition-transform" /> Viết bài mới
      </button>
    </div>

    <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400">
          <tr>
            <th class="px-8 py-5">Bản tin</th>
            <th class="px-8 py-5 text-center">Trạng thái</th>
            <th class="px-8 py-5 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="item in newsList" :key="item.id" class="group hover:bg-slate-50/50 transition-all">
            <td class="px-8 py-6">
              <div class="flex items-center gap-4">
                <img :src="item.image_url" class="w-20 h-12 rounded-xl object-cover shadow-sm bg-slate-100">
                <span class="font-bold text-slate-800 line-clamp-1">{{ item.title }}</span>
              </div>
            </td>
            <td class="px-8 py-6 text-center">
              <span v-if="item.is_active" class="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase">Đang hiện</span>
              <span v-else class="px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase">Đã ẩn</span>
            </td>
            <td class="px-8 py-6 text-right">
              <button @click="openModal(item)" class="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Pencil class="w-5 h-5"/></button>
              <button @click="confirmDelete(item.id)" class="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 class="w-5 h-5"/></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md" @click="isModalOpen = false"></div>
      
      <div class="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[92vh] overflow-hidden relative z-10 shadow-2xl border border-white flex flex-col">
        
        <div class="px-10 py-6 border-b flex justify-between items-center bg-white shrink-0">
          <h2 class="text-2xl font-black uppercase italic italic flex items-center gap-3">
             <Pencil class="text-red-600 w-6 h-6" /> {{ form.id ? 'Cập nhật tin tức' : 'Biên tập tin mới' }}
          </h2>
          <button @click="isModalOpen = false" class="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white transition-all transform hover:rotate-90"><X class="w-6 h-6" /></button>
        </div>

        <div class="p-10 overflow-y-auto flex-1 bg-[#fcfdfe]">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div class="lg:col-span-4 space-y-8">
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ảnh đại diện</label>
                <div @click="triggerFileInput" class="aspect-video rounded-[2rem] overflow-hidden bg-slate-100 border-4 border-white shadow-xl relative group cursor-pointer hover:border-red-600 transition-all">
                  <img :src="form.image_url" @error="$event.target.src='https://via.placeholder.com/600x400?text=Bấm+để+chọn+ảnh'" class="w-full h-full object-cover">
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload class="text-white w-10 h-10" />
                  </div>
                  <div v-if="isUploading" class="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 class="animate-spin text-red-600" /></div>
                </div>
                <input type="file" ref="fileInput" class="hidden" @change="handleUpload" accept="image/*">
              </div>

              <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                <div class="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                  <span class="text-[10px] font-black text-red-600 uppercase italic flex items-center gap-2"><Power class="w-3 h-3"/> Trạng thái hiển thị</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="form.is_active" class="sr-only peer">
                    <div class="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>

                <div>
                  <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block">Slug đường dẫn</label>
                  <div class="p-4 bg-slate-50 rounded-2xl text-[10px] font-mono font-bold text-slate-500 break-all">{{ form.slug || 'chua-co-slug' }}</div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-8 space-y-6">
              <div>
                <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Tiêu đề bài viết</label>
                <input v-model="form.title" type="text" placeholder="Nhập tiêu đề..." class="w-full px-8 py-5 rounded-[1.5rem] border-2 border-slate-100 focus:border-red-600 outline-none font-black text-xl shadow-sm transition-all">
              </div>

              <div>
                <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Tóm tắt ngắn</label>
                <textarea v-model="form.summary" rows="2" class="w-full px-8 py-4 rounded-[1.5rem] border-2 border-slate-100 focus:border-red-600 outline-none text-sm transition-all"></textarea>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-slate-400 block ml-2 font-black italic">Nội dung chi tiết (Sếp cứ gõ như Word)</label>
                <div v-if="isModalOpen" class="bg-white rounded-[1.5rem] border-2 border-slate-100 overflow-hidden shadow-sm flex flex-col min-h-[400px]">
                  <QuillEditor 
                    v-model:content="form.content" 
                    contentType="html"
                    theme="snow"
                    toolbar="full"
                    placeholder="Viết nội dung tin tức ClickIn tại đây..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-10 py-8 border-t bg-white shrink-0">
          <button @click="saveNews" :disabled="isSubmitting || isUploading" class="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-red-600 shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
            <Loader2 v-if="isSubmitting" class="animate-spin" /> Lưu & Xuất bản ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.ql-toolbar.ql-snow {
  border: none !important;
  border-bottom: 1px solid #f1f5f9 !important;
  background: #fcfdfe !important;
  padding: 12px 20px !important;
}
.ql-container.ql-snow {
  border: none !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 16px !important;
}
.ql-editor {
  min-height: 320px;
  padding: 24px !important;
  line-height: 1.7;
}
.ql-editor.ql-blank::before {
  color: #cbd5e1 !important;
  font-style: italic;
}
</style>