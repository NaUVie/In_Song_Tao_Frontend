<script setup>
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  service: Object
})
</script>

<template>
  <router-link 
    :to="'/service/' + service.slug" 
    class="group flex flex-col bg-white rounded-[1rem] md:rounded-[2rem] border-2 border-gray-50 shadow-sm md:hover:shadow-2xl md:hover:border-red-100 md:hover:-translate-y-2 transition-all duration-300 h-full overflow-hidden"
  >
    <div class="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 shrink-0 border-b-2 border-gray-50">
      <img 
        :src="service.image_url || service.image || 'https://via.placeholder.com/400x300?text=' + service.name" 
        :alt="service.name" 
        class="w-full h-full object-cover transform md:group-hover:scale-110 transition-transform duration-700 ease-in-out"
        @error="$event.target.src='https://via.placeholder.com/400x300?text=No+Image'"
      >
      <div class="hidden md:flex absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors duration-300 items-center justify-center backdrop-blur-[0px] group-hover:backdrop-blur-sm">
         <span class="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-300 shadow-2xl flex items-center gap-2">
           Xem chi tiết <ArrowRight class="w-4 h-4" />
         </span>
      </div>
    </div>
    
    <div class="p-3 md:p-6 flex flex-col flex-grow bg-white">
      <h4 class="font-black text-slate-900 text-xs md:text-xl leading-tight mb-1 md:mb-2 group-hover:text-red-600 transition-colors line-clamp-2 uppercase italic tracking-tighter">
        {{ service.name }}
      </h4>
      <p class="text-[9px] md:text-sm text-slate-500 line-clamp-2 flex-grow leading-relaxed mb-3 md:mb-6 font-medium">
        {{ service.description }}
      </p>
      
      <div class="mt-auto pt-2 md:pt-4 border-t border-dashed border-gray-200 flex justify-between items-center gap-1">
        <span class="text-[8px] md:text-[11px] font-black text-red-600 uppercase tracking-[0.1em] md:tracking-[0.2em] whitespace-nowrap truncate">
          Đặt in <span class="hidden sm:inline">ngay</span>
        </span>
        <div class="w-6 h-6 md:w-10 md:h-10 shrink-0 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-600 transition-colors shadow-sm">
          <ArrowRight class="w-3 h-3 md:w-5 md:h-5 text-red-400 group-hover:text-white md:group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  </router-link>
</template>