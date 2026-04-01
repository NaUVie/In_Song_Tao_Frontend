<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import axios from '@/utils/axios'

const store = useAppStore()

// --- QUẢN LÝ BANNER ---
const banners = ref([])
const currentSlide = ref(0)
let slideInterval = null

const topBanners = computed(() => banners.value.filter(b => b.position === 'top'))
const midBanner = computed(() => banners.value.find(b => b.position === 'mid'))

const fetchBanners = async () => {
  try {
    const response = await axios.get('/banners')
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

// --- XỬ LÝ LẤY DATA ĐÚNG TỪ DATABASE CỦA ÔNG ---

// Hàm đệ quy móc danh mục ra (quét sâu tận cùng ngõ hẻm)
const findCategory = (categories, slug) => {
  if (!categories || !categories.length) return null;
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    const children = cat.children || cat.services || cat.subCategories; 
    if (children && children.length > 0) {
      const found = findCategory(children, slug);
      if (found) return found;
    }
  }
  return null;
}

// KHAI BÁO CÁC SLUG ĐỂ ĐƯA LÊN MẶT TIỀN (Lấy từ list ông gửi)
const rootSlugs = ['bao-thu', 'danh-thiep', 'nhan-decal-cac-loai'];
const danhThiepSlugs = ['card-so-luong-nhieu', 'card-so-luong-it', 'card-1-hop-khong-mang', 'card-1-hop-mang-bong'];
const nhanDecalSlugs = ['in-nhan-tags', 'in-nhan-decal', 'decal-in-san', 'tem-bao-hanh-decal'];
const loaiDecalSlugs = ['decal-nhua-trong', 'decal-nhua-duc', 'sticker-decal', 'decal-metalize-xi'];

// NHÓM DATA (Dùng filter Boolean để lỡ có slug nào trong DB chưa có thì nó không bị lỗi)
const rootCategories = computed(() => rootSlugs.map(slug => findCategory(store.categories, slug)).filter(Boolean))
const danhThiepCategories = computed(() => danhThiepSlugs.map(slug => findCategory(store.categories, slug)).filter(Boolean))
const nhanDecalCategories = computed(() => nhanDecalSlugs.map(slug => findCategory(store.categories, slug)).filter(Boolean))
const loaiDecalCategories = computed(() => loaiDecalSlugs.map(slug => findCategory(store.categories, slug)).filter(Boolean))
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
        
        <div class="w-full border-t-[2px] border-dotted border-[#ccc] my-[20px]"></div>

        <div v-if="rootCategories.length > 0" class="mb-10">
          <ul class="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-14">
            <li v-for="cat in rootCategories" :key="cat.id" class="w-full text-center">
              <router-link :to="'/category/' + cat.slug" class="block group">
                <div class="w-full flex justify-center items-center mb-4">
                  <img v-if="cat.image_url" :src="cat.image_url" :alt="cat.name" class="w-[85%] max-w-[320px] aspect-square object-contain group-hover:-translate-y-2 transition-transform duration-300" />
                  <div v-else class="w-[85%] max-w-[320px] aspect-square bg-gray-50 flex items-center justify-center text-slate-300 font-black text-6xl border border-gray-100 rounded">
                    {{ cat.name.charAt(0) }}
                  </div>
                </div>
                <div class="mt-4 mx-2">
                  <div class="text-[#6d6e71] tracking-[2px] text-[13pt] md:text-[14pt] mb-[5px] font-bold uppercase group-hover:text-black transition-colors">{{ cat.name }}</div>
                </div>
              </router-link>
            </li>
          </ul>
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
          <div class="w-full border-t-[2px] border-dotted border-[#ccc] my-[20px]"></div>
        </div>
        
        <div v-if="!midBanner" class="w-full border-t-[2px] border-dotted border-[#ccc] my-[20px]"></div>

        <div v-if="danhThiepCategories.length > 0">
          <h2 class="text-center text-[#6d6e71] font-bold text-xl mb-6 tracking-[3px] uppercase">Hạng mục Danh Thiếp</h2>
          <ul class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <li v-for="cat in danhThiepCategories" :key="cat.id" class="w-full text-center">
              <router-link :to="'/category/' + cat.slug" class="block group">
                <div class="w-full flex justify-center items-center mb-4">
                  <img v-if="cat.image_url" :src="cat.image_url" :alt="cat.name" class="w-[85%] max-w-[220px] aspect-square object-contain group-hover:-translate-y-2 transition-transform duration-300" />
                  <div v-else class="w-[85%] max-w-[220px] aspect-square bg-gray-50 flex items-center justify-center text-slate-300 font-black text-5xl border border-gray-100 rounded">{{ cat.name.charAt(0) }}</div>
                </div>
                <div class="mt-2 mx-2">
                  <div class="text-[#6d6e71] tracking-[1px] text-[11pt] font-bold uppercase group-hover:text-black transition-colors">{{ cat.name }}</div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>

        <div v-if="nhanDecalCategories.length > 0">
          <div class="w-full border-t-[2px] border-dotted border-[#ccc] my-[20px]"></div>
          <h2 class="text-center text-[#6d6e71] font-bold text-xl mb-6 tracking-[3px] uppercase">Nhãn & Tem Bảo Hành</h2>
          <ul class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <li v-for="cat in nhanDecalCategories" :key="cat.id" class="w-full text-center">
              <router-link :to="'/category/' + cat.slug" class="block group">
                <div class="w-full flex justify-center items-center mb-4">
                  <img v-if="cat.image_url" :src="cat.image_url" :alt="cat.name" class="w-[85%] max-w-[220px] aspect-square object-contain group-hover:-translate-y-2 transition-transform duration-300" />
                  <div v-else class="w-[85%] max-w-[220px] aspect-square bg-gray-50 flex items-center justify-center text-slate-300 font-black text-5xl border border-gray-100 rounded">{{ cat.name.charAt(0) }}</div>
                </div>
                <div class="mt-2 mx-2">
                  <div class="text-[#6d6e71] tracking-[1px] text-[11pt] font-bold uppercase group-hover:text-black transition-colors">{{ cat.name }}</div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>

        <div v-if="loaiDecalCategories.length > 0">
          <div class="w-full border-t-[2px] border-dotted border-[#ccc] my-[20px]"></div>
          <h2 class="text-center text-[#6d6e71] font-bold text-xl mb-6 tracking-[3px] uppercase">Decal Nhựa & Đặc Biệt</h2>
          <ul class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <li v-for="cat in loaiDecalCategories" :key="cat.id" class="w-full text-center">
              <router-link :to="'/category/' + cat.slug" class="block group">
                <div class="w-full flex justify-center items-center mb-4">
                  <img v-if="cat.image_url" :src="cat.image_url" :alt="cat.name" class="w-[85%] max-w-[220px] aspect-square object-contain group-hover:-translate-y-2 transition-transform duration-300" />
                  <div v-else class="w-[85%] max-w-[220px] aspect-square bg-gray-50 flex items-center justify-center text-slate-300 font-black text-5xl border border-gray-100 rounded">{{ cat.name.charAt(0) }}</div>
                </div>
                <div class="mt-2 mx-2">
                  <div class="text-[#6d6e71] tracking-[1px] text-[11pt] font-bold uppercase group-hover:text-black transition-colors">{{ cat.name }}</div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>

      </div>

      <div class="text-center text-[13pt] tracking-[3px] mt-10 mb-12">
        <router-link to="/services" class="text-[#6d6e71] font-bold hover:text-black transition-colors uppercase">
          TẤT CẢ SẢN PHẨM &gt;&gt;
        </router-link>
      </div>


    </div>
  </MainLayout>
</template>

<style scoped>
ul, li {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>