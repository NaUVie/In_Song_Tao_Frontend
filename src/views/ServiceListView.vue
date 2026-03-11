<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import SidebarLayout from '../components/layout/SidebarLayout.vue'
import { ArrowRight } from 'lucide-vue-next'

const store = useAppStore()

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories()
  }
})
</script>

<template>
  <MainLayout>
    <SidebarLayout>
      <div class="bg-white p-4 md:p-6 rounded-[4px] shadow-sm border border-gray-200">
        <nav class="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-2">
          <router-link to="/" class="hover:text-primary-600">Trang chủ</router-link> 
          <span class="mx-2">/</span> 
          <span class="font-bold text-primary-700">Tất cả dịch vụ</span>
        </nav>

        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8 uppercase border-l-4 border-primary-600 pl-3">TẤT CẢ DỊCH VỤ IN ẤN</h1>

        <div v-if="store.loading" class="flex justify-center py-20">
           <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>

        <div v-else-if="store.categories.length === 0" class="text-center py-20">
          <p class="text-gray-500 font-medium">Không tìm thấy dịch vụ nào đang hoạt động.</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="cat in store.categories" :key="cat.id" class="bg-gray-50 border border-gray-200 rounded overflow-hidden hover:shadow-md hover:border-primary-300 transition group flex flex-col">
            <div class="h-32 bg-white flex items-center justify-center p-2 border-b border-gray-100">
               <!-- Placeholder image if actual image is missing -->
               <img v-if="cat.slug.includes('danh-thiep')" src="https://songtao.vn/upload/sanpham/danh-thiep-gia-re.jpg" class="max-h-full object-contain" @error="$event.target.style.display='none'">
               <h3 v-else class="text-3xl text-gray-300 font-black uppercase">{{ cat.name.substring(0,1) }}</h3>
            </div>
            <div class="p-3 text-center flex-grow flex flex-col justify-between">
              <h3 class="text-sm font-bold text-gray-800 mb-2 group-hover:text-primary-600 line-clamp-2">
                {{ cat.name }}
              </h3>
              <router-link :to="'/category/' + cat.slug" class="inline-flex items-center justify-center gap-1 mt-auto text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded transition">
                Xem chi tiết <ArrowRight class="w-3 h-3" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  </MainLayout>
</template>
