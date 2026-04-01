<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import { ArrowRight, LayoutGrid, Zap, Star, ShoppingCart, ShieldCheck, Clock } from 'lucide-vue-next'
import axios from '@/utils/axios'

const store = useAppStore()

// --- DỮ LIỆU BANNER TỪ DATABASE ---
const banners = ref([])
const currentSlide = ref(0)
let slideInterval = null

// Tách banner theo vị trí (top, mid)
const topBanners = computed(() => banners.value.filter(b => b.position === 'top'))
const midBanner = computed(() => banners.value.find(b => b.position === 'mid'))

// Gọi API lấy danh sách Banner
const fetchBanners = async () => {
  try {
    const response = await axios.get('/banners')
    // Chỉ lấy những banner đang được bật
    banners.value = response.data.filter(b => b.is_active)
  } catch (error) {
    console.error('Lỗi khi tải banner:', error)
  }
}

const nextSlide = () => {
  if (topBanners.value.length === 0) return
  currentSlide.value = (currentSlide.value + 1) % topBanners.value.length
}

onMounted(() => {
  store.fetchCategories()
  fetchBanners()
  slideInterval = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})

// --- CÁC LOGIC KHÁC GIỮ NGUYÊN ---
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
    <div class="bg-white min-h-screen pb-24 font-sans text-slate-900 overflow-x-hidden">
      
      <section v-if="topBanners.length > 0" class="relative w-full mb-8 group overflow-hidden">
        <div class="grid w-full">
          <div 
            v-for="(banner, index) in topBanners" 
            :key="banner.id || index"
            class="col-start-1 row-start-1 transition-opacity duration-1000 ease-in-out w-full"
            :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'"
          >
            <component 
              :is="banner.link ? (banner.link.startsWith('http') ? 'a' : 'router-link') : 'div'" 
              :to="banner.link || '#'"
              :href="banner.link || '#'"
              class="block w-full max-w-[1150px] mx-auto"
            >
              <img :src="banner.image_url" :alt="banner.title || 'Slide'" class="w-full h-auto block object-cover" />
            </component>
          </div>
        </div>
      </section>

      <div class="max-w-[1150px] mx-auto px-4 md:px-0">
        
        <div class="w-full border-t-2 border-dotted border-gray-300 my-6"></div>

        <div class="mb-10">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <router-link 
              v-for="cat in hotCategories" 
              :key="cat.id"
              :to="'/category/' + cat.slug" 
              class="group flex flex-col items-center text-center px-2"
            >
              <div class="w-full flex justify-center mb-3">
                <img 
                  v-if="cat.image_url" 
                  :src="cat.image_url" 
                  class="w-[90%] max-w-[250px] h-auto object-contain transition-transform duration-300 group-hover:-translate-y-1" 
                  :alt="cat.name"
                />
                <div v-else class="w-full aspect-square max-w-[250px] bg-gray-100 flex items-center justify-center text-slate-300 font-black text-7xl uppercase">
                  {{ cat.name.charAt(0) }}
                </div>
              </div>
              
              <h3 class="text-[#6d6e71] font-bold text-[15px] tracking-[2px] uppercase group-hover:text-red-600 transition-colors">
                {{ cat.name }}
              </h3>
            </router-link>
          </div>
        </div>

        <div v-if="midBanner" class="w-full mb-10 text-center">
          <div class="w-full border-t-2 border-dotted border-gray-300 my-6"></div>
          <component 
            :is="midBanner.link ? (midBanner.link.startsWith('http') ? 'a' : 'router-link') : 'div'" 
            :to="midBanner.link || '#'"
            :href="midBanner.link || '#'"
            class="inline-block"
          >
            <img :src="midBanner.image_url" :alt="midBanner.title || 'Mid Banner'" class="max-w-full h-auto" />
          </component>
        </div>

        <div class="w-full border-t-2 border-dotted border-gray-300 my-6"></div>

        <div class="mb-12">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-4">
            <router-link 
              v-for="service in allFeaturedServices" 
              :key="service.id"
              :to="'/service/' + service.slug" 
              class="group flex flex-col items-center text-center px-2"
            >
              <div class="w-full flex justify-center mb-3">
                <img 
                  v-if="service.image_url"
                  :src="service.image_url"
                  class="w-[90%] max-w-[200px] h-auto object-contain transition-transform duration-300 group-hover:-translate-y-1"
                  :alt="service.name"
                />
                <div v-else class="w-full aspect-square max-w-[200px] bg-gray-100 flex items-center justify-center text-slate-300 font-black text-5xl">
                  {{ service.name.charAt(0) }}
                </div>
              </div>

              <h3 class="text-[#6d6e71] font-bold text-[14px] tracking-[1.5px] uppercase group-hover:text-red-600 transition-colors line-clamp-2">
                {{ service.name }}
              </h3>
            </router-link>
          </div>
        </div>

        <div class="text-center mt-12 mb-8">
          <router-link to="/services" class="text-[#6d6e71] text-[16px] tracking-[3px] uppercase font-semibold hover:text-red-600 transition-colors">
            TẤT CẢ SẢN PHẨM &gt;&gt;
          </router-link>
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