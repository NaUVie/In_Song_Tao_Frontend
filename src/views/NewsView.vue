<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../components/layout/MainLayout.vue'
import { Calendar, ArrowRight, Loader2, Newspaper, X, Clock, Share2 } from 'lucide-vue-next'
import axios from '@/utils/axios'
import Swal from 'sweetalert2'

const newsList = ref([])
const isLoading = ref(false)

// State cho Modal xem chi tiết
const isViewModalOpen = ref(false)
const selectedNews = ref(null)
const isDetailLoading = ref(false)

// 1. Lấy danh sách tin tức
const fetchNews = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/news/')
    newsList.value = response.data.data || response.data
  } catch (error) { console.error(error) } finally { isLoading.value = false }
}

// 2. Mở Modal xem chi tiết
const openViewModal = async (slug) => {
  isDetailLoading.value = true
  isViewModalOpen.value = true
  selectedNews.value = null
  
  try {
    const res = await axios.get(`/news/${slug}`)
    selectedNews.value = res.data
  } catch (error) {
    Swal.fire('Lỗi', 'Không thể tải nội dung bài viết', 'error')
    isViewModalOpen.value = false
  } finally {
    isDetailLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(fetchNews)
</script>

<template>
  <MainLayout>
    <div class="bg-[#fcfdfe] min-h-screen py-16">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="mb-16">
          <h1 class="text-6xl font-black text-slate-900 uppercase italic tracking-tighter">
            Bản tin <span class="text-red-600">ClickIn</span>
          </h1>
          <div class="h-2 w-32 bg-red-600 mt-4 rounded-full"></div>
        </div>

        <div v-if="isLoading" class="py-20 flex justify-center"><Loader2 class="animate-spin text-red-600 w-12 h-12" /></div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div v-for="item in newsList" :key="item.id" 
               @click="openViewModal(item.slug)"
               class="group cursor-pointer bg-white rounded-[3rem] border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(239,68,68,0.15)] transition-all duration-500 overflow-hidden flex flex-col h-full">
            <div class="h-64 overflow-hidden relative">
              <img :src="item.image_url" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
              <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            <div class="p-10 flex flex-col flex-grow">
              <span class="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                <Calendar class="w-3.5 h-3.5" /> {{ formatDate(item.created_at) }}
              </span>
              <h3 class="text-2xl font-black text-slate-800 mb-4 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">{{ item.title }}</h3>
              <p class="text-slate-500 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed">{{ item.summary }}</p>
              <div class="flex items-center gap-3 text-xs font-black uppercase tracking-widest group-hover:gap-5 transition-all text-slate-900">
                Khám phá ngay <ArrowRight class="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isViewModalOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
      <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" @click="isViewModalOpen = false"></div>
      
      <div class="bg-white rounded-[3.5rem] w-full max-w-6xl max-h-[95vh] overflow-hidden relative z-10 shadow-2xl flex flex-col border border-white/20 animate-in fade-in zoom-in duration-300">
        
        <button @click="isViewModalOpen = false" class="absolute top-8 right-8 z-30 p-4 bg-white hover:bg-red-600 text-slate-900 hover:text-white rounded-2xl shadow-2xl transition-all transform hover:rotate-90">
          <X class="w-6 h-6" />
        </button>

        <div class="overflow-y-auto flex-1 custom-scrollbar">
          
          <div v-if="isDetailLoading" class="p-60 flex flex-col items-center justify-center">
            <Loader2 class="w-16 h-16 text-red-600 animate-spin mb-6" />
            <p class="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Đang chuẩn bị nội dung...</p>
          </div>

          <article v-else-if="selectedNews" class="relative">
            <div class="w-full h-[500px] relative shrink-0">
              <img :src="selectedNews.image_url" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
            </div>

            <div class="px-6 md:px-20 -mt-48 relative z-10 pb-24">
              <div class="bg-white rounded-[4rem] p-10 md:p-20 shadow-2xl border border-slate-50">
                
                <div class="flex flex-wrap items-center gap-6 text-xs font-black uppercase tracking-widest text-red-600 mb-10">
                  <span class="bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2">
                    <Calendar class="w-4 h-4"/> {{ formatDate(selectedNews.created_at) }}
                  </span>
                  <span class="text-slate-300 hidden md:block">|</span>
                  <span class="text-slate-400 flex items-center gap-2">
                    <Share2 class="w-4 h-4"/> ClickIn Editorial
                  </span>
                </div>

                <h1 class="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-10 italic uppercase tracking-tighter">
                  {{ selectedNews.title }}
                </h1>

                <div class="h-2 w-32 bg-red-600 rounded-full mb-16"></div>

                <div class="news-content-rich" v-html="selectedNews.content"></div>

                <div class="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
                   <p class="text-slate-400 text-xs font-medium italic">© 2026 ClickIn Printing Solutions. All rights reserved.</p>
                   <button @click="isViewModalOpen = false" class="text-slate-900 font-black uppercase text-xs tracking-widest hover:text-red-600 transition-colors flex items-center gap-2">
                     Đóng bài viết <X class="w-4 h-4"/>
                   </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
/* TYPOGRAPHY CHO TẠP CHÍ */
.news-content-rich :deep(p) { 
  margin-bottom: 2rem; 
  font-size: 1.25rem; /* Tăng size chữ lên 20px */
  line-height: 1.8; 
  color: #334155;
  font-weight: 400;
}
.news-content-rich :deep(h2) { 
  font-size: 2.5rem; 
  font-weight: 900; 
  color: #0f172a; 
  margin: 3.5rem 0 1.5rem; 
  text-transform: uppercase; 
  font-style: italic;
  letter-spacing: -0.05em;
}
.news-content-rich :deep(img) { 
  border-radius: 2.5rem; 
  margin: 3rem auto; 
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15);
  max-width: 100%;
}
.news-content-rich :deep(ul) { 
  list-style-type: disc; 
  margin-left: 2rem; 
  margin-bottom: 2rem; 
  font-size: 1.25rem;
  color: #334155;
}
.news-content-rich :deep(strong) { 
  color: #0f172a; 
  font-weight: 800; 
}

.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>