<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import MainLayout from '../components/layout/MainLayout.vue'
import SidebarLayout from '../components/layout/SidebarLayout.vue'
import ServiceCard from '../components/ServiceCard.vue'

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
      <div v-if="store.loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="category" class="bg-white p-4 md:p-6 rounded-[4px] shadow-sm border border-gray-200 min-h-[500px]">
        <nav class="flex text-sm text-gray-500 mb-6 gap-2 border-b border-gray-100 pb-2">
          <router-link to="/" class="hover:text-primary-600">Trang chủ</router-link>
          <span>/</span>
          <span class="text-primary-700 font-bold">{{ category.name }}</span>
        </nav>

        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8 uppercase border-l-4 border-primary-600 pl-3">{{ category.name }}</h1>

        <div v-if="category.services && category.services.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ServiceCard 
            v-for="service in category.services" 
            :key="service.id" 
            :service="service" 
          />
        </div>
        <div v-else class="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300">
          <p class="text-gray-500 font-medium">Đang cập nhật sản phẩm cho danh mục này.</p>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-white shadow-sm rounded border border-gray-200">
        <h2 class="text-2xl font-bold text-gray-700">Không tìm thấy danh mục</h2>
        <router-link to="/" class="text-primary-600 font-bold hover:underline mt-4 inline-block">Quay lại trang chủ</router-link>
      </div>
    </SidebarLayout>
  </MainLayout>
</template>
