<script setup>
import MainLayout from '../components/layout/MainLayout.vue'
import { Calendar } from 'lucide-vue-next'

const news = [
  {
    id: 1,
    title: 'Những lưu ý quan trọng khi thiết kế danh thiếp',
    summary: 'Danh thiếp là ấn phẩm quan trọng trong giao tiếp kinh doanh. Để có một danh thiếp đẹp, bạn cần chú ý đến màu sắc, font chữ và bố cục...',
    date: '10/02/2026',
    image: 'https://songtao.vn/upload/news/thiet-ke-danh-thiep.jpg'
  },
  {
    id: 2,
    title: 'Kích thước chuẩn của tờ rơi A4, A5',
    summary: 'Để tiết kiệm chi phí in ấn, việc lựa chọn kích thước chuẩn là rất quan trọng. Bài viết này sẽ giúp bạn hiểu rõ về khổ giấy...',
    date: '05/02/2026',
    image: 'https://songtao.vn/upload/news/kich-thuoc-to-roi.jpg'
  },
  {
    id: 3,
    title: 'Xu hướng thiết kế bao lì xì năm 2026',
    summary: 'Năm 2026 với những mẫu bao lì xì độc đáo, kết hợp giữa truyền thống và hiện đại đang được ưa chuộng...',
    date: '01/01/2026',
    image: 'https://songtao.vn/upload/news/bao-li-xi-2026.jpg'
  },
   {
    id: 4,
    title: 'Công nghệ in Offset và in Kỹ thuật số',
    summary: 'So sánh ưu nhược điểm của 2 công nghệ in phổ biến nhất hiện nay để bạn có lựa chọn phù hợp cho sản phẩm của mình.',
    date: '15/12/2025',
    image: 'https://songtao.vn/upload/news/in-offset-digital.jpg'
  }
]
</script>

<template>
  <MainLayout>
    <div class="bg-gray-50 min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4">
        <nav class="text-sm text-gray-500 mb-6">
          <router-link to="/" class="hover:text-primary-600">Trang chủ</router-link> 
          <span class="mx-2">/</span> 
          <span class="font-medium text-gray-800">Tin tức</span>
        </nav>

        <h1 class="text-3xl font-bold text-gray-900 mb-8">TIN TỨC & SỰ KIỆN</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="item in news" :key="item.id" class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group h-full flex flex-col">
            <div class="h-48 overflow-hidden bg-gray-200">
               <!-- Placeholder Image logic -->
              <img :src="item.image" @error="$event.target.src='https://via.placeholder.com/400x250?text=News'" alt="News" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            </div>
            <div class="p-6 flex flex-col flex-grow">
              <div class="flex items-center text-xs text-gray-500 mb-2">
                <Calendar class="w-3 h-3 mr-1" /> {{ item.date }}
              </div>
              <h3 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition line-clamp-2">
                <a href="#">{{ item.title }}</a>
              </h3>
              <p class="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
                {{ item.summary }}
              </p>
              <a href="#" class="text-primary-600 text-sm font-semibold hover:underline mt-auto inline-block">Xem chi tiết &rarr;</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
