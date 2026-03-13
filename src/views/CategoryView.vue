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
      <div v-if="store.loading" class="flex flex-col justify-center items-center py-32 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-primary-600 mb-4"></div>
        <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang lấy dữ liệu sản phẩm...</p>
      </div>

      <div v-else-if="category" class="bg-white p-4 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[600px] animate-fade-in">
        
        <nav class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-8 pb-4 border-b border-slate-50">
          <router-link to="/" class="hover:text-primary-600 transition-colors">Trang chủ</router-link>
          <ChevronRight class="w-3 h-3" />
          <router-link to="/services" class="hover:text-primary-600 transition-colors">Dịch vụ</router-link>
          <ChevronRight class="w-3 h-3" />
          <span class="text-slate-900 font-black italic">{{ category.name }}</span>
        </nav>

        <div class="relative mb-12">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                <Layers class="w-3 h-3" /> Danh mục sản phẩm
              </div>
              <h1 class="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic">
                {{ category.name }}
              </h1>
              <div class="h-1.5 w-24 bg-primary-600 mt-4 rounded-full shadow-lg shadow-primary-600/20"></div>
            </div>
            
            <div class="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] hidden md:block">
              Tổng số: {{ category.services?.length || 0 }} dịch vụ
            </div>
          </div>
        </div>

        <div v-if="category.services && category.services.length > 0" 
             class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <ServiceCard 
            v-for="service in category.services" 
            :key="service.id" 
            :service="service"
            class="hover:-translate-y-2 transition-transform duration-500" 
          />
        </div>

        <div v-else class="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
            <PackageOpen class="w-10 h-10 text-slate-300" />
          </div>
          <h3 class="text-slate-900 font-black uppercase tracking-tight text-xl mb-2">Đang cập nhật</h3>
          <p class="text-slate-400 font-medium text-sm">Các sản phẩm trong danh mục này đang được chuẩn bị.</p>
          <router-link to="/services" class="mt-8 flex items-center gap-2 text-primary-600 font-black uppercase text-[11px] tracking-widest hover:gap-4 transition-all">
            <ArrowLeft class="w-4 h-4" /> Khám phá dịch vụ khác
          </router-link>
        </div>
      </div>

      <div v-else class="text-center py-32 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
        <div class="p-6 bg-red-50 rounded-full mb-8">
            <Layers class="w-16 h-16 text-red-200" />
        </div>
        <h2 class="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Danh mục không tồn tại</h2>
        <p class="text-slate-400 mb-10 max-w-sm font-medium">Có vẻ như đường dẫn đã bị thay đổi hoặc danh mục này đã bị gỡ bỏ.</p>
        <router-link to="/" class="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95">
          Quay lại trang chủ
        </router-link>
      </div>
    </SidebarLayout>
  </MainLayout>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>