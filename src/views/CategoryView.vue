<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import SidebarLayout from '../components/layout/SidebarLayout.vue'
import ServiceCard from '../components/ServiceCard.vue'
import { Layers, ChevronRight, PackageOpen, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const store = useAppStore()

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories()
  }
})

const category = computed(() => {
  return store.categories.find(c => c.slug === route.params.slug)
})
</script>

<template>
  <MainLayout>
    <SidebarLayout>
      <div v-if="store.loading" class="flex flex-col justify-center items-center py-20 md:py-32 bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 mx-2 md:mx-0">
        <div class="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-slate-100 border-t-red-600 mb-4"></div>
        <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang lấy dữ liệu...</p>
      </div>

      <div v-else-if="category" class="bg-white p-4 sm:p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[400px] md:min-h-[600px] animate-fade-in mx-2 md:mx-0">
        
        <nav class="flex flex-wrap items-center gap-1.5 md:gap-2 text-[9px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6 md:mb-8 pb-4 border-b border-slate-50 leading-relaxed">
          <router-link to="/" class="hover:text-red-600 transition-colors whitespace-nowrap">Trang chủ</router-link>
          <ChevronRight class="w-3 h-3 shrink-0" />
          <router-link to="/services" class="hover:text-red-600 transition-colors whitespace-nowrap">Dịch vụ</router-link>
          <ChevronRight class="w-3 h-3 shrink-0" />
          <span class="text-slate-900 font-black italic">{{ category.name }}</span>
        </nav>

        <div class="relative mb-8 md:mb-12">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div>
              <div class="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3">
                <Layers class="w-3 h-3" /> Danh mục sản phẩm
              </div>
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic">
                {{ category.name }}
              </h1>
              <div class="h-1.5 w-16 md:w-24 bg-red-600 mt-4 rounded-full shadow-lg shadow-red-600/20"></div>
            </div>
            
            <div class="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] inline-block bg-slate-50 px-3 py-1.5 rounded-lg md:bg-transparent md:p-0 md:rounded-none w-fit">
              Tổng số: {{ category.services?.length || 0 }} dịch vụ
            </div>
          </div>
        </div>

    <div v-if="category.services && category.services.length > 0" 
     class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8 pt-2">
  <ServiceCard 
    v-for="service in category.services" 
    :key="service.id" 
    :service="service"
    class="hover:-translate-y-1 md:hover:-translate-y-2 transition-transform duration-500" 
  />
</div>

        <div v-else class="flex flex-col items-center justify-center py-16 md:py-24 bg-slate-50 rounded-3xl md:rounded-[2rem] border-2 border-dashed border-slate-200 px-4 text-center">
          <div class="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 md:mb-6">
            <PackageOpen class="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
          </div>
          <h3 class="text-slate-900 font-black uppercase tracking-tight text-lg md:text-xl mb-2">Đang cập nhật</h3>
          <p class="text-slate-400 font-medium text-xs md:text-sm">Các sản phẩm đang được xưởng chuẩn bị.</p>
          <router-link to="/services" class="mt-6 md:mt-8 flex items-center gap-2 bg-white md:bg-transparent px-4 py-2 md:p-0 rounded-xl text-red-600 font-black uppercase text-[10px] md:text-[11px] tracking-widest md:hover:gap-4 transition-all shadow-sm md:shadow-none border md:border-none border-slate-100">
            <ArrowLeft class="w-4 h-4" /> Khám phá dịch vụ khác
          </router-link>
        </div>
      </div>

      <div v-else class="text-center py-20 md:py-32 px-4 md:px-0 bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center mx-2 md:mx-0">
        <div class="p-5 md:p-6 bg-red-50 rounded-full mb-6 md:mb-8">
            <Layers class="w-12 h-12 md:w-16 md:h-16 text-red-200" />
        </div>
        <h2 class="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-3 md:mb-4">Không tìm thấy</h2>
        <p class="text-slate-400 mb-8 md:mb-10 max-w-xs md:max-w-sm font-medium text-xs md:text-sm">Đường dẫn đã bị thay đổi hoặc danh mục này đã bị gỡ bỏ.</p>
        <router-link to="/" class="bg-slate-900 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95">
          Quay lại trang chủ
        </router-link>
      </div>
    </SidebarLayout>
  </MainLayout>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>