<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import axios from '@/utils/axios'
import draggable from 'vuedraggable' 
import { 
  Trash2, Image as ImageIcon, Loader2, Plus, Crop, 
  RotateCw, ZoomIn, ZoomOut, Maximize, Check, 
  Monitor, Edit3, X, Layers, MonitorPlay, GripVertical, SlidersHorizontal, Settings2
} from 'lucide-vue-next'

const Cropper = window.Cropper;
const banners = ref([])
const isUploading = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  title: '', image_url: '', link: '', sort_order: 0, is_active: true, position: 'top'
})

const showCropperModal = ref(false)
const imageToCrop = ref(null) 
const cropperImageRef = ref(null) 
let cropperInstance = null

const fetchBanners = async () => {
  try {
    const response = await axios.get('/banners')
    banners.value = response.data.sort((a, b) => a.sort_order - b.sort_order)
  } catch (error) { console.error(error) }
}

const topBanners = computed({
  get: () => banners.value.filter(b => b.position === 'top'),
  set: (newVal) => {
    const others = banners.value.filter(b => b.position !== 'top')
    banners.value = [...newVal, ...others]
  }
})

const midBanners = computed(() => banners.value.filter(b => b.position === 'mid'))

const onDragEnd = async () => {
  try {
    isSubmitting.value = true
    const updatePromises = topBanners.value.map((banner, index) => {
      const newOrder = index + 1
      if (banner.sort_order !== newOrder) {
        return axios.put(`/banners/${banner.id}`, { ...banner, sort_order: newOrder })
      }
    })
    await Promise.all(updatePromises)
  } catch (error) { console.error(error) } finally { isSubmitting.value = false }
}

const toggleActive = async (banner) => {
  try {
    const newStatus = !banner.is_active
    if (banner.position === 'mid' && newStatus === true) {
      const activeMid = banners.value.find(b => b.position === 'mid' && b.is_active && b.id !== banner.id)
      if (activeMid) {
        await axios.put(`/banners/${activeMid.id}`, { ...activeMid, is_active: false })
        activeMid.is_active = false
      }
    }
    await axios.put(`/banners/${banner.id}`, { ...banner, is_active: newStatus })
    banner.is_active = newStatus
  } catch (error) { alert('Lỗi!') }
}

const editBanner = (banner) => {
  isEditing.value = true; editingId.value = banner.id
  form.value = { ...banner }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  isEditing.value = false; editingId.value = null
  form.value = { title: '', image_url: '', link: '', sort_order: 0, is_active: true, position: 'top' }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    imageToCrop.value = e.target.result; showCropperModal.value = true
    nextTick(() => initCropper())
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const initCropper = () => {
  if (cropperInstance) cropperInstance.destroy()
  const ratio = form.value.position === 'top' ? 3 / 1 : 21 / 9
  cropperInstance = new Cropper(cropperImageRef.value, {
    aspectRatio: ratio, viewMode: 0, dragMode: 'move', autoCropArea: 1, cropBoxMovable: true, cropBoxResizable: true,
  })
}

const zoom = (value) => cropperInstance?.zoom(value)
const rotate = (deg) => cropperInstance?.rotate(deg)
const reset = () => cropperInstance?.reset()

const cropAndUpload = () => {
  if (!cropperInstance) return
  isUploading.value = true
  const canvas = cropperInstance.getCroppedCanvas({ width: 1920, fillColor: '#ffffff', imageSmoothingQuality: 'high' })
  canvas.toBlob(async (blob) => {
    const formData = new FormData(); formData.append('file', blob, 'cropped.jpg')
    try {
      const response = await axios.post('/admin/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      form.value.image_url = response.data.image_url; closeCropper()
    } catch (error) { alert('Lỗi upload') } finally { isUploading.value = false }
  }, 'image/jpeg', 0.9)
}

const closeCropper = () => {
  showCropperModal.value = false
  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null }
}

const saveBanner = async () => {
  if (!form.value.image_url) return
  isSubmitting.value = true
  try {
    if (isEditing.value) { await axios.put(`/banners/${editingId.value}`, form.value) }
    else { form.value.sort_order = topBanners.value.length + 1; await axios.post('/banners', form.value) }
    cancelEdit(); fetchBanners()
  } catch (error) { alert('Lỗi!') } finally { isSubmitting.value = false }
}

onMounted(fetchBanners)
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] p-4 md:p-6 font-sans text-slate-900">
    
<div class="flex justify-between items-center mb-8 relative z-10">
  <div class="flex items-center gap-4">
    <!-- <div class="p-3 bg-red-600 rounded-2xl text-white shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] transition-transform hover:scale-105">
      <MonitorPlay class="w-6 h-6" />
    </div> -->
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">Quản trị Banners</h1>
      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Hệ thống vận hành xưởng ClickIn</p>
    </div>
  </div>

  <div class="flex items-center gap-4">
    <div v-if="isSubmitting" class="flex items-center gap-2 text-[9px] font-black text-red-600 animate-pulse uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full border border-red-100 shadow-sm">
       <Loader2 class="w-3 h-3 animate-spin" /> Đang đồng bộ
    </div>
    
    <button @click="fetchBanners" class="p-3.5 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-red-600 hover:shadow-md transition-all active:scale-90">
      <RefreshCw :class="['w-5 h-5', isSubmitting ? 'animate-spin' : '']" />
    </button>
  </div>
</div>

    <div class="max-w-7xl mx-auto space-y-8">
      
      <div class="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden relative">
        <div v-if="isEditing" class="bg-red-600 text-white text-center py-1.5 text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <Settings2 class="w-3 h-3" /> Chế độ chỉnh sửa banner #{{ editingId }}
        </div>

        <div class="p-6 md:p-8 relative">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-7 space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Vị trí hiển thị</label>
                    <div class="flex p-1 bg-slate-100 rounded-xl gap-1 relative overflow-hidden transition-all">
                      <button @click="form.position = 'top'" class="flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase transition-all z-10" :class="form.position === 'top' ? 'bg-white shadow-sm text-red-600 border border-slate-200' : 'text-slate-400 hover:text-slate-600'">Slider</button>
                      <button @click="form.position = 'mid'" class="flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase transition-all z-10" :class="form.position === 'mid' ? 'bg-white shadow-sm text-red-600 border border-slate-200' : 'text-slate-400 hover:text-slate-600'">Banner Giữa</button>
                    </div>
                  </div>
                  <div class="space-y-1.5 relative">
                    <label class="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Tiêu đề (Nội bộ)</label>
                    <input v-model="form.title" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:bg-white font-bold text-sm transition-colors transition-all relative z-10">
                  </div>
                </div>
                <div class="space-y-1.5 relative">
                  <label class="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Link liên kết (Tùy chọn)</label>
                  <input v-model="form.link" type="text" placeholder="/san-pham/..." class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:bg-white font-medium transition-colors transition-all relative z-10">
                </div>
            </div>

            <div class="lg:col-span-5 flex flex-col relative z-20">
              <div class="flex-1 min-h-[120px] border-2 border-dashed border-slate-300 rounded-3xl relative group cursor-pointer transition-all hover:border-red-400 hover:bg-red-50/30 overflow-hidden flex flex-col items-center justify-center bg-slate-50 shadow-inner">
                <input type="file" @change="handleFileSelect" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-20">
                <div v-if="form.image_url" class="p-2 w-full h-full flex flex-col items-center justify-center transition-all group-hover:scale-105 z-10 relative">
                  <img :src="form.image_url" class="max-h-24 object-contain rounded-xl shadow-md border border-white group-hover:scale-95 transition-transform duration-300 transition-all shadow-[0_5px_15px_-5px_rgba(0,0,0,0.2)]">
                  <p class="mt-2 text-[9px] font-black text-red-600 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm inline-block z-10 relative border border-slate-100 hover:scale-110 transition-transform">Thay ảnh mới</p>
                </div>
                <div v-else class="text-center z-10 relative transition-all group-hover:scale-105 py-6">
                  <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-2 text-slate-400 group-hover:text-red-500 transition-colors shadow-[0_5px_15px_-5px_rgba(0,0,0,0.1)]">
                    <Plus class="w-5 h-5" />
                  </div>
                  <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest transition-colors group-hover:text-slate-800">Tải & Cắt Ảnh</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-5 border-t border-slate-100 flex justify-end gap-3 relative z-20">
            <button v-if="isEditing" @click="cancelEdit" class="px-5 py-2.5 text-[10px] font-black uppercase text-slate-500 hover:text-red-600 transition-colors z-10 relative hover:scale-105 active:scale-95">Hủy sửa</button>
            <button @click="saveBanner" :disabled="isSubmitting || !form.image_url" class="px-10 py-3 bg-slate-950 hover:bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:scale-105 disabled:opacity-30 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 z-10 relative shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:shadow-red-200">
              <Loader2 v-if="isSubmitting" class="w-3 h-3 animate-spin" />
              <span>{{ isEditing ? 'CẬP NHẬT THAY ĐỔI' : 'ĐĂNG BANNER MỚI' }}</span>
            </button>
          </div>
          <div class="absolute inset-0 opacity-[0.02] pointer-events-none z-0" style="background-image: radial-gradient(#000000 1px, transparent 1px); background-size: 24px 24px;"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        <div class="space-y-4 relative">
          <div class="flex items-center gap-2 px-1 z-10 relative">
            <div class="p-1 bg-red-100 text-red-600 rounded-lg shadow-inner"><SlidersHorizontal class="w-3.5 h-3.5" /></div>
            <h2 class="text-[11px] font-black text-slate-900 uppercase tracking-widest z-10 relative">Slider trình chiếu <span class="text-slate-400">({{topBanners.length}})</span></h2>
          </div>
          
          <draggable v-model="topBanners" item-key="id" handle=".drag-handle" @end="onDragEnd" ghost-class="drag-ghost" drag-class="drag-active" :animation="300" class="space-y-2.5 z-10 relative">
            <template #item="{ element: banner }">
              <div class="bg-white/80 backdrop-blur-sm p-4 rounded-[1.2rem] border border-white/50 shadow-sm flex items-center gap-3 group hover:border-slate-300 hover:bg-white transition-all relative transition-all hover:scale-[1.01] active:scale-[0.98]">
                
                <div class="drag-handle p-1.5 text-slate-300 hover:text-red-600 cursor-grab active:cursor-grabbing bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors active:scale-95">
                  <GripVertical class="w-4 h-4" />
                </div>
                
                <div class="w-32 h-12 aspect-[3/1] bg-slate-100 rounded-lg border border-slate-200 flex-shrink-0 relative shadow-sm flex items-center justify-center overflow-hidden">
                   <img :src="banner.image_url" class="w-full h-full object-contain">
                   <div v-if="!banner.is_active" class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                </div>
                
                <div class="flex-1 min-w-0 z-10 relative pl-1">
                  <h3 class="font-black text-slate-800 text-[11px] truncate tracking-tight mb-1.5 transition-colors group-hover:text-red-600" :class="!banner.is_active && 'text-slate-400 line-through'">{{ banner.title || 'Slider' }}</h3>
                  
                  <div class="flex items-center gap-2 z-10 relative">
                    <button @click="toggleActive(banner)" class="relative inline-flex h-4 w-7 items-center rounded-full transition-colors border border-transparent focus:outline-none z-10" :class="banner.is_active ? 'bg-red-500 border-red-600 shadow-sm shadow-red-200' : 'bg-slate-200 border-slate-300'">
                      <span class="inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform shadow-sm transition-all" :class="banner.is_active ? 'translate-x-3.5' : 'translate-x-0.5'" />
                    </button>
                    <span class="text-[9px] font-black uppercase tracking-widest transition-colors z-10 relative" :class="banner.is_active ? 'text-red-500' : 'text-slate-400'">{{ banner.is_active ? 'Hiện' : 'Ẩn' }}</span>
                  </div>
                </div>

                <div class="flex gap-1.5 z-10 relative">
                  <button @click="editBanner(banner)" class="w-8 h-8 flex items-center justify-center bg-blue-50/50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors border border-blue-100 hover:scale-110 active:scale-95"><Edit3 class="w-3.5 h-3.5"/></button>
                  <button @click="deleteBanner(banner.id)" class="w-8 h-8 flex items-center justify-center bg-red-50/50 text-red-500 rounded-md hover:bg-red-600 hover:text-white transition-colors border border-red-100 hover:scale-110 active:scale-95"><Trash2 class="w-3.5 h-3.5"/></button>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <div class="space-y-4 relative">
          <div class="flex items-center gap-2 px-1 z-10 relative">
            <div class="p-1 bg-red-100 text-red-600 rounded-lg shadow-inner"><Monitor class="w-3.5 h-3.5" /></div>
            <h2 class="text-[11px] font-black text-slate-900 uppercase tracking-widest z-10 relative">Banner giữa trang <span class="text-slate-400">({{midBanners.length}})</span></h2>
          </div>
          
          <div class="space-y-2.5 z-10 relative">
            <div v-for="banner in midBanners" :key="banner.id" class="bg-white/80 backdrop-blur-sm p-4 rounded-[1.2rem] border flex items-center gap-4 transition-all group hover:border-slate-300 hover:bg-white shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] hover:scale-[1.01] active:scale-[0.98]" :class="banner.is_active ? 'border-red-300 shadow-md bg-red-50/10' : 'border-slate-200'">
              
              <div class="w-32 h-12 aspect-[21/9] bg-slate-100 rounded-lg border border-slate-200 flex-shrink-0 relative shadow-sm flex items-center justify-center overflow-hidden">
                 <img :src="banner.image_url" class="w-full h-full object-contain">
                 <div v-if="!banner.is_active" class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
              </div>

              <div class="flex-1 min-w-0 z-10 relative transition-colors pl-1">
                <h3 class="font-black text-slate-800 text-[11px] truncate tracking-tight mb-1.5 group-hover:text-red-600" :class="!banner.is_active && 'text-slate-400 line-through'">{{ banner.title || 'Mid Banner' }}</h3>
                <div class="flex items-center gap-2 z-10 relative">
                    <button @click="toggleActive(banner)" class="relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none z-10" :class="banner.is_active ? 'bg-red-500 shadow-sm shadow-red-200' : 'bg-slate-200 border border-slate-300'">
                      <span class="inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform shadow-sm transition-all" :class="banner.is_active ? 'translate-x-3.5' : 'translate-x-0.5'" />
                    </button>
                    <span class="text-[9px] font-black uppercase tracking-widest transition-colors z-10 relative" :class="banner.is_active ? 'text-red-600' : 'text-slate-400'">{{ banner.is_active ? 'Đang bật' : 'Chờ' }}</span>
                </div>
              </div>
              
              <div class="flex gap-1.5 z-10 relative">
                <button @click="editBanner(banner)" class="w-8 h-8 flex items-center justify-center bg-blue-50/50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors border border-blue-100 hover:scale-110 active:scale-95"><Edit3 class="w-3.5 h-3.5"/></button>
                <button @click="deleteBanner(banner.id)" class="w-8 h-8 flex items-center justify-center bg-red-50/50 text-red-500 rounded-md hover:bg-red-600 hover:text-white transition-colors border border-red-100 hover:scale-110 active:scale-95"><Trash2 class="w-3.5 h-3.5"/></button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-if="showCropperModal" class="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-300">
      
      <div class="relative w-full h-full max-w-5xl flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-[2.5rem] border border-white/80 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)]">
        
        <button @click="closeCropper" class="absolute top-5 right-5 z-50 w-10 h-10 bg-white/40 hover:bg-red-50 backdrop-blur-xl border-t border-l border-white/60 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 transition-all shadow-[0_5px_15px_-5px_rgba(0,0,0,0.15)] hover:scale-110 group active:scale-95">
          <X class="w-5 h-5 transition-transform group-hover:rotate-90" />
        </button>

        <div class="absolute top-5 left-8 z-40 bg-white/10 backdrop-blur-3xl border border-white/40 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.2)]">
           <div class="p-1 bg-red-500 rounded-lg text-white shadow-md"><Crop class="w-3.5 h-3.5" /></div>
           <div class="flex flex-col">
             <span class="text-xs font-black text-slate-950 uppercase tracking-widest leading-none">Edit Studio</span>
             <span class="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 leading-none">{{ form.position === 'top' ? 'Slider 3:1 (Ngang)' : 'Mid Banner 21:9 (Rộng)' }}</span>
           </div>
        </div>

        <div class="w-[90%] h-[75%] mt-[4rem] mb-[5rem] bg-white rounded-[2rem] overflow-hidden border border-slate-100 flex items-center justify-center relative shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)]">
          <img ref="cropperImageRef" :src="imageToCrop" class="max-w-full block z-10 relative">
          <div class="absolute inset-0 z-0 pointer-events-none transition-all shadow-[inner_0_0_60px_rgba(255,255,255,0.8)]"></div>
          <div class="absolute inset-0 opacity-[0.015] pointer-events-none z-0" style="background-image: radial-gradient(#000000 1px, transparent 1px); background-size: 32px 32px;"></div>
        </div>

        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-white/20 backdrop-blur-3xl border border-white/70 p-2.5 rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] hover:bg-white/30 hover:scale-105 active:scale-95 transition-all">
          
          <div class="flex items-center gap-1.5">
            <button @click="zoom(0.1)" class="w-10 h-10 rounded-[1rem] bg-transparent hover:bg-white/40 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all active:scale-95 border border-transparent hover:border-white/50 shadow-sm group">
              <ZoomIn class="w-4 h-4 group-hover:scale-110" />
            </button>
            <button @click="zoom(-0.1)" class="w-10 h-10 rounded-[1rem] bg-transparent hover:bg-white/40 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all active:scale-95 border border-transparent hover:border-white/50 shadow-sm group">
              <ZoomOut class="w-4 h-4 group-hover:scale-110" />
            </button>
            <div class="w-px h-6 bg-slate-400/30 mx-1"></div>
            <button @click="rotate(90)" class="w-10 h-10 rounded-[1rem] bg-transparent hover:bg-white/40 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all active:scale-95 border border-transparent hover:border-white/50 shadow-sm group">
              <RotateCw class="w-4 h-4 group-hover:scale-110" />
            </button>
            <button @click="reset" class="w-10 h-10 rounded-[1rem] bg-transparent hover:bg-white/40 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all active:scale-95 border border-transparent hover:border-white/50 shadow-sm group">
              <Maximize class="w-4 h-4 group-hover:scale-110" />
            </button>
          </div>

          <div class="w-px h-8 bg-slate-400/30 mx-1.5"></div>

          <button @click="cropAndUpload" :disabled="isUploading" class="h-10 px-6 bg-slate-950 hover:bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg disabled:opacity-50 transition-all active:scale-95 group flex items-center gap-2">
            <Loader2 v-if="isUploading" class="w-3.5 h-3.5 animate-spin" />
            <span class="group-hover:scale-105">{{ isUploading ? 'LƯU...' : 'XÁC NHẬN CẮT' }}</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap');
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }

/* KÉO THẢ VISUALS */
.drag-ghost { opacity: 0; }
.drag-active {
  transform: scale(1.02) rotate(1deg);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #ef4444 !important;
  background: white !important;
  z-index: 50;
}

/* CUSTOM SCROLLBAR CHO SẠCH */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* CROPPER PHA LÊ TRONG SUỐT */
:deep(.cropper-view-box) { 
  outline: 2px solid #ef4444; 
  box-shadow: 0 0 0 4000px rgba(241, 245, 249, 0.7); 
  transition: all 0.3s ease;
}
:deep(.cropper-view-box:hover) {
  outline-width: 3px;
  box-shadow: 0 0 0 4000px rgba(241, 245, 249, 0.85); 
}
:deep(.cropper-line) { background-color: rgba(239, 68, 68, 0.6); } 
:deep(.cropper-point) { 
  background-color: #ef4444; 
  width: 8px; height: 8px; border-radius: 50%; opacity: 1;
  transition: all 0.2s ease;
}
:deep(.cropper-point:hover) {
  transform: scale(1.5);
  background-color: #fecaca; 
}
:deep(.cropper-center) { display: none; }
</style>