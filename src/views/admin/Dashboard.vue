<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref({
  totalOrders: 0,
  pendingOrders: 0,
  totalRevenue: 0,
  activeServices: 0
})

onMounted(async () => {
  // Fetch stats from backend (Mocked for now or implemented in admin.py)
  // const response = await axios.get('/api/admin/stats')
  // stats.value = response.data
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm mb-1">Tổng đơn hàng</p>
        <p class="text-3xl font-bold text-primary-600">{{ stats.totalOrders }}</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm mb-1">Đơn chờ xử lý</p>
        <p class="text-3xl font-bold text-yellow-500">{{ stats.pendingOrders }}</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm mb-1">Doanh thu (ước tính)</p>
        <p class="text-3xl font-bold text-green-600">{{ stats.totalRevenue.toLocaleString() }} đ</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p class="text-gray-500 text-sm mb-1">Dịch vụ đang chạy</p>
        <p class="text-3xl font-bold text-purple-600">{{ stats.activeServices }}</p>
      </div>
    </div>

    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 class="text-xl font-bold mb-6">Hoạt động gần đây</h2>
      <div class="flex items-center justify-center py-20 text-gray-400 italic">
        Sẽ cập nhật danh sách đơn hàng mới nhất tại đây...
      </div>
    </div>
  </div>
</template>
