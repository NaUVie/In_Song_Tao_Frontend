<script setup>
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  service: Object
})
</script>

<template>
  <router-link 
    :to="'/service/' + service.slug" 
    class="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden"
  >
    <div class="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
      <img 
        :src="service.image_url || service.image || 'https://via.placeholder.com/400x300?text=' + service.name" 
        :alt="service.name" 
        class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
        @error="$event.target.src='https://via.placeholder.com/400x300?text=No+Image'"
      >
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
         <span class="bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
           Xem chi tiết
         </span>
      </div>
    </div>
    
    <div class="p-5 flex flex-col flex-grow">
      <h4 class="font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
        {{ service.name }}
      </h4>
      <p class="text-sm text-gray-500 line-clamp-2 flex-grow leading-relaxed mb-4">
        {{ service.description }}
      </p>
      
      <div class="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
        <span class="text-[11px] font-bold text-primary-600 uppercase tracking-widest">
          Đặt in ngay
        </span>
        <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
          <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  </router-link>
</template>