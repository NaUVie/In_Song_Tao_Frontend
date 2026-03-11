<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import { ArrowRight, LayoutGrid, Zap, Star, ShoppingCart } from 'lucide-vue-next'

const store = useAppStore()

// Dữ liệu Slider (Đã giữ nguyên link của sếp)
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

// 1. Danh mục tiêu biểu (Nhóm sản phẩm)
const hotCategories = computed(() => {
  if (!store.categories) return []
  const hotSlugs = ['nhan-decal', 'bao-thu', 'danh-thiep', 'hop-giay']
  return store.categories.filter(cat => hotSlugs.includes(cat.slug))
})

// 2. DỊCH VỤ TIÊU BIỂU (Bốc thẳng Service từ trong Category ra)
const allFeaturedServices = computed(() => {
  if (!store.categories) return []
  const services = store.categories.flatMap(cat => cat.services || [])
  return services.slice(0, 10) 
})
</script>

<template>
  <MainLayout>
    <div class="bg-[#f8fafc] min-h-screen pb-24 font-sans text-slate-900">
      
      <div class="relative w-full h-[250px] md:h-[450px] mb-16 overflow-hidden bg-white shadow-sm border-b border-gray-100">
        <div 
          v-for="(img, index) in sliderImages" 
          :key="index"
          class="absolute inset-0 bg-contain md:bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          :class="currentSlide === index ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'"
          :style="{ backgroundImage: `url('${img}')` }"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>

        <div class="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
          <div 
            v-for="(_, index) in sliderImages" 
            :key="index"
            @click="currentSlide = index"
            class="h-1.5 rounded-full cursor-pointer transition-all duration-500 shadow-sm"
            :class="currentSlide === index ? 'w-10 bg-primary-600' : 'w-2 bg-white/60 hover:bg-white'"
          ></div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4">
        
        <div v-if="store.loading" class="flex justify-center items-center py-24">
          <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-r-transparent"></div>
        </div>
        
        <div v-else>
          <div class="mb-20">
            <div class="flex items-end justify-between mb-10">
              <div>
                <h2 class="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                  Danh Mục <span class="text-primary-600">Tiêu Biểu</span>
                </h2>
                <div class="h-1.5 w-24 bg-primary-600 mt-4 rounded-full"></div>
              </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
              <router-link 
                v-for="cat in hotCategories" 
                :key="cat.id"
                :to="'/category/' + cat.slug" 
                class="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col p-4 hover:-translate-y-1"
              >
                <div class="w-full aspect-square relative bg-slate-50/50 rounded-2xl flex items-center justify-center overflow-hidden transition-colors group-hover:bg-slate-50">
                  <img v-if="cat.image_url" :src="cat.image_url" class="w-4/5 h-4/5 object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-sm" />
                  <span v-else class="text-slate-200 font-black text-9xl uppercase italic">{{ cat.name.charAt(0) }}</span>
                </div>
                
                <div class="pt-5 pb-2 px-2 flex items-center justify-between">
                  <h3 class="text-slate-800 font-black text-sm md:text-lg uppercase italic tracking-tighter group-hover:text-primary-600 transition-colors">
                    {{ cat.name }}
                  </h3>
                  <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                    <ArrowRight class="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <router-link to="/services" class="block w-full rounded-[2.5rem] mb-20 shadow-2xl overflow-hidden h-[160px] md:h-[240px] bg-slate-900 relative group">
              <img src="https://songtao.vn/PhoTos/Categories/Small/hinh%20trang%20chu/hop-C300-giam-10.png" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-40 transition-all duration-1000" />
              <!-- <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex flex-col justify-center px-8 md:px-16">
                  <div class="flex items-center gap-2 mb-2 md:mb-3">
                    <Zap class="w-4 h-4 text-yellow-400 fill-current" />
                    <span class="text-primary-400 font-black uppercase text-[10px] md:text-xs tracking-[0.3em]">Chương trình ưu đãi</span>
                  </div>
                  <h2 class="text-2xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight">Giảm giá cực sốc <br/> Bao bì & Hộp giấy</h2>
              </div> -->
          </router-link>

          <div class="mb-12">
            <div class="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
              <div>
                <div class="flex items-center gap-2 text-primary-600 mb-2">
                  <Star class="w-4 h-4 fill-current" />
                  <span class="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Dịch vụ được đặt nhiều nhất</span>
                </div>
                <h2 class="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                  Dịch Vụ <span class="text-primary-600">Nổi Bật</span>
                </h2>
              </div>
              
              <router-link to="/services" class="group flex items-center gap-3 bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 md:px-8 md:py-4 rounded-2xl hover:border-primary-600 hover:text-primary-600 transition-all shadow-sm">
                <span class="text-[10px] md:text-xs font-black uppercase italic">Xem toàn bộ danh mục</span>
                     <LayoutGrid class="w-5 h-5 group-hover:rotate-90 transition-all duration-500"/>
              </router-link>

            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

              <router-link 
                v-for="service in allFeaturedServices" 
                :key="service.id"
                :to="'/service/' + service.slug" 
                class="group bg-white rounded-[2rem] border border-slate-100 
                shadow-[0_12px_30px_rgba(0,0,0,0.06)]
                hover:shadow-[0_30px_70px_rgba(0,0,0,0.18)]
                hover:-translate-y-2
                hover:border-primary-200
                transition-all duration-500 
                flex flex-col overflow-hidden"
              >

                <div class="w-full aspect-[4/5] relative bg-slate-50 flex items-center justify-center overflow-hidden">

                  <img 
                    v-if="service.image_url"
                    :src="service.image_url"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />

                  <div v-else class="text-slate-100 font-black text-8xl uppercase italic">
                    {{ service.name.charAt(0) }}
                  </div>

                  <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <div class="bg-primary-600 text-white p-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                      <ShoppingCart class="w-4 h-4"/>
                    </div>
                  </div>

                </div>

                <div class="p-6 flex flex-col flex-grow bg-white">

                  <h3 class="text-slate-800 font-black text-sm uppercase italic tracking-[-0.01em] leading-tight group-hover:text-primary-600 transition-colors line-clamp-2 mb-3">
                    {{ service.name }}
                  </h3>

                  <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">

                    <span class="text-[10px] font-black text-primary-600 uppercase italic tracking-widest">
                      Chi tiết
                    </span>

                    <ArrowRight class="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1"/>

                  </div>

                </div>

              </router-link>

            </div>

          </div>

        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>