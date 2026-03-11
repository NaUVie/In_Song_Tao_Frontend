<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import { ArrowRight, LayoutGrid, Zap, Star, ShoppingCart, ShieldCheck, Clock } from 'lucide-vue-next'

const store = useAppStore()

// Dữ liệu Slider
const sliderImages = ref([
  'https://songtao.vn/PhoTos/Categories/Large/BannerTop/decal-giay-km-15.png',
  'https://songtao.vn/PhoTos/Categories/Small/hinh%20trang%20chu/hop-C300-giam-10.png'
])

const currentSlide = ref(0)
let slideInterval = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % sliderImages.value.length
}

onMounted(() => {
  store.fetchCategories()
  slideInterval = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})

const hotCategories = computed(() => {
  if (!store.categories) return []
  const hotSlugs = ['nhan-decal', 'bao-thu', 'danh-thiep', 'hop-giay']
  return store.categories.filter(cat => hotSlugs.includes(cat.slug))
})

const allFeaturedServices = computed(() => {
  if (!store.categories) return []
  const services = store.categories.flatMap(cat => cat.services || [])
  return services.slice(0, 10) 
})
</script>

<template>
  <MainLayout>
    <div class="bg-gray-50 min-h-screen pb-24 font-sans text-slate-900 overflow-x-hidden">
      
      <section class="relative w-full mb-10 md:mb-16 group overflow-hidden bg-white shadow-sm border-b border-gray-200 grid">
        <div 
          v-for="(img, index) in sliderImages" 
          :key="index"
          class="col-start-1 row-start-1 transition-opacity duration-1000 ease-in-out"
          :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'"
        >
          <img :src="img" class="w-full h-auto block" alt="Banner" />
        </div>

        <div class="absolute bottom-2 md:bottom-5 left-0 right-0 flex justify-center gap-2 md:gap-3 z-20">
          <button 
            v-for="(_, index) in sliderImages" 
            :key="index"
            @click="currentSlide = index"
            class="h-1.5 md:h-2 rounded-full transition-all duration-500 shadow-[0_0_5px_rgba(0,0,0,0.3)] border border-white/60"
            :class="currentSlide === index ? 'w-8 md:w-12 bg-red-600' : 'w-2 md:w-3 bg-white/80 hover:bg-white'"
          ></button>
        </div>
      </section>

      <div class="max-w-7xl mx-auto px-4 md:px-8">
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20 relative z-30">
          <div v-for="(badge, i) in [
            { icon: Zap, text: 'In Nhanh 24h', sub: 'Lấy ngay trong ngày' },
            { icon: ShieldCheck, text: 'Chất Lượng Cao', sub: 'Màu sắc chuẩn in ấn' },
            { icon: Clock, text: 'Đúng Tiến Độ', sub: 'Giao hàng tận nơi' },
            { icon: Star, text: 'Giá Cạnh Tranh', sub: 'Tối ưu chi phí in' }
          ]" :key="i" class="bg-white p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex items-center gap-3 md:gap-4 hover:-translate-y-1 transition-transform">
            <div class="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
              <component :is="badge.icon" class="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <div class="text-[13px] md:text-[15px] font-black text-slate-900">{{ badge.text }}</div>
              <div class="text-[11px] md:text-xs text-slate-600 font-semibold mt-0.5">{{ badge.sub }}</div>
            </div>
          </div>
        </div>

        <div class="mb-24">
          <div class="flex flex-col items-center mb-12 text-center">
            <h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Danh Mục <span class="text-red-600">Trọng Tâm</span>
            </h2>
            <div class="h-1.5 w-20 bg-red-600 mt-4 rounded-full shadow-md"></div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <router-link 
              v-for="cat in hotCategories" 
              :key="cat.id"
              :to="'/category/' + cat.slug" 
              class="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col p-4 border border-gray-200 hover:border-red-200"
            >
              <div class="w-full aspect-square rounded-[1.5rem] bg-slate-50 flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:bg-red-50/50 relative">
                <img 
                  v-if="cat.image_url" 
                  :src="cat.image_url" 
                  class="w-[90%] h-[90%] object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md z-10" 
                />
                <div v-else class="text-slate-300 font-black text-7xl uppercase">{{ cat.name.charAt(0) }}</div>
              </div>
              
              <div class="mt-5 text-center px-2">
                <h3 class="text-slate-900 font-black text-base md:text-lg uppercase tracking-wide group-hover:text-red-600 transition-colors line-clamp-2">
                  {{ cat.name }}
                </h3>
                <p class="text-[11px] text-red-600 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest flex justify-center items-center">
                  Xem chi tiết <ArrowRight class="w-3 h-3 ml-1" />
                </p>
              </div>
            </router-link>
          </div>
        </div>

        <router-link to="/services" class="block relative w-full rounded-[2.5rem] mb-24 overflow-hidden shadow-xl group cursor-pointer aspect-[3/1] md:aspect-[5/1] bg-slate-900">
          <img src="https://i.ibb.co/LXfQxtjn/Gemini-Generated-Image-fbqiv8fbqiv8fbqi.png" class="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
          <div class="absolute inset-0 bg-gray-900/20 group-hover:bg-gray-900/10 transition-colors duration-500"></div>
        </router-link>

        <div class="mb-12">
          <div class="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <div class="text-center md:text-left">
              <div class="flex items-center justify-center md:justify-start gap-2 text-red-600 mb-2">
                <Star class="w-5 h-5 fill-current" />
                <span class="text-sm font-black uppercase tracking-[0.2em]">Sản phẩm tinh tuyển</span>
              </div>
              <h2 class="text-3xl md:text-4xl font-black uppercase text-slate-900">
                Dịch Vụ <span class="text-red-600">Nổi Bật</span>
              </h2>
            </div>
            
            <router-link to="/services" class="group flex items-center gap-3 bg-slate-900 text-white px-8 py-3.5 rounded-xl hover:bg-red-600 transition-all duration-300 shadow-md">
              <span class="text-sm font-bold uppercase tracking-wider">Tất cả dịch vụ</span>
              <LayoutGrid class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"/>
            </router-link>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
            <router-link 
              v-for="service in allFeaturedServices" 
              :key="service.id"
              :to="'/service/' + service.slug" 
              class="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-red-300 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div class="w-full aspect-square relative bg-white flex items-center justify-center p-1.5">
                <img 
                  v-if="service.image_url"
                  :src="service.image_url"
                  class="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />
                <div v-else class="text-slate-300 font-black text-6xl italic">{{ service.name.charAt(0) }}</div>
                
                <div class="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <div class="bg-red-600 text-white p-2.5 rounded-full shadow-lg hover:bg-red-700">
                    <ShoppingCart class="w-4 h-4"/>
                  </div>
                </div>
              </div>

              <div class="p-4 md:p-5 flex flex-col flex-grow bg-white border-t border-gray-50">
                <h3 class="text-slate-900 font-bold text-[14px] md:text-[15px] leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mb-4">
                  {{ service.name }}
                </h3>

                <div class="mt-auto flex items-center justify-between pt-1">
                  <span class="text-[11px] md:text-xs font-black text-slate-500 group-hover:text-red-600 uppercase tracking-widest transition-colors">Xem Ngay</span>
                  <div class="w-8 h-8 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300">
                    <ArrowRight class="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>

      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>