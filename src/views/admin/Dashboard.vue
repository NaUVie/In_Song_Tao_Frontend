<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from '@/utils/axios'
import { 
  ShoppingBag, Clock, DollarSign, Zap, 
  ArrowUpRight, RefreshCw, Loader2, Calendar, TrendingUp, Crown, ImageIcon, Package
} from 'lucide-vue-next'

import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Filler, Legend, ArcElement
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, ArcElement)

const stats = ref({
  totalOrders: 0, pendingOrders: 0, totalRevenue: 0, 
  activeServices: 0, recentOrders: [], chartData: [], topServices: []
})
const loading = ref(true)

const startDate = ref('')
const endDate = ref('')
const hoveredId = ref(null) 

const fetchStats = async () => {
  loading.value = true
  try {
    const params = {}
    if (startDate.value) params.start_date = startDate.value
    if (endDate.value) params.end_date = endDate.value
    const response = await axios.get('/admin/stats', { params })
    stats.value = response.data
  } catch (error) {
    console.error('Lỗi Dashboard:', error)
  } finally {
    loading.value = false
  }
}

watch([startDate, endDate], () => {
  if (startDate.value && endDate.value && new Date(startDate.value) > new Date(endDate.value)) {
    alert("Ngày bắt đầu không được lớn hơn ngày kết thúc sếp ơi!")
    return
  }
  fetchStats()
})

const chartDataConfig = computed(() => {
  return {
    labels: stats.value.chartData.map(item => {
      const d = new Date(item.date)
      return `${d.getDate()}/${d.getMonth() + 1}`
    }),
    datasets: [{
      label: 'Doanh thu',
      data: stats.value.chartData.map(item => item.revenue), 
      borderColor: '#EF4444', 
      backgroundColor: 'rgba(239, 68, 68, 0.15)', 
      borderWidth: 3,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#EF4444',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.4 
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0F172A',
      titleFont: { size: 12, family: "'Plus Jakarta Sans', sans-serif" },
      bodyFont: { size: 14, weight: 'bold', family: "'Plus Jakarta Sans', sans-serif" },
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context) => {
          const dataIndex = context.dataIndex;
          const data = stats.value.chartData[dataIndex];
          return [
            `💰 Doanh thu: ${data.revenue.toLocaleString()} đ`,
            `📦 Số lượng: ${data.order_count} đơn hàng`
          ];
        }
      }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' } } },
    y: { 
      border: { dash: [4, 4], display: false }, 
      grid: { color: '#F1F5F9' },
      ticks: { 
        callback: (value) => value >= 1000000 ? (value/1000000) + 'Tr' : (value > 0 ? value/1000 + 'k' : 0),
        font: { family: "'Plus Jakarta Sans', sans-serif", weight: 'bold' },
        color: '#94A3B8'
      }
    }
  }
}

const pieColors = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981'];
const labelPositions = ref([]); 

const leaderLinePlugin = {
  id: 'leaderLinePlugin',
  afterDraw(chart) {
    const ctx = chart.ctx;
    const newPositions = [];
    const chartArea = chart.chartArea;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      const leftItems = [];
      const rightItems = [];

      meta.data.forEach((arc, index) => {
        if (dataset.data[index] === 0) return;
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const r = arc.outerRadius;
        const cx = arc.x;
        const cy = arc.y;
        const startX = cx + Math.cos(angle) * r;
        const startY = cy + Math.sin(angle) * r;
        const itemObj = { arc, index, angle, startX, startY, cx, cy, r };

        if (Math.cos(angle) > 0) rightItems.push(itemObj);
        else leftItems.push(itemObj);
      });

      rightItems.sort((a, b) => a.startY - b.startY);
      leftItems.sort((a, b) => a.startY - b.startY);

      const distributeItems = (items, isRight) => {
        const spacingY = 65; 
        const totalHeight = (items.length - 1) * spacingY;
        let currentY = centerY - totalHeight / 2; 

        items.forEach((item) => {
          const endX = isRight ? item.cx + item.r + 20 : item.cx - item.r - 20;
          const endY = currentY;
          currentY += spacingY;

          const color = dataset.backgroundColor[item.index];

          ctx.beginPath();
          ctx.moveTo(item.startX, item.startY);
          const cpX = item.startX + (endX - item.startX) / 2;
          ctx.bezierCurveTo(cpX, item.startY, cpX, endY, endX, endY);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(item.startX, item.startY, 3.5, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = color;
          ctx.stroke();

          const service = stats.value.topServices[item.index];
          if (service) {
            newPositions.push({
              id: item.index,
              x: endX,
              y: endY,
              isRight: isRight,
              isTopHalf: endY < centerY,
              color: color,
              name: service.name,
              sold: service.total_sold,
              revenue: service.total_revenue,
              img: service.image_url
            });
          }
        });
      };

      distributeItems(rightItems, true);
      distributeItems(leftItems, false);
    });

    if (JSON.stringify(labelPositions.value) !== JSON.stringify(newPositions)) {
      labelPositions.value = newPositions;
    }
  }
};

const pieDataConfig = computed(() => {
  return {
    labels: stats.value.topServices.map(item => item.name),
    datasets: [{
      data: stats.value.topServices.map(item => item.total_sold),
      backgroundColor: pieColors,
      borderWidth: 4, 
      borderColor: '#ffffff',
    }]
  }
})

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '45%',
  layout: { padding: { left: 160, right: 160, top: 40, bottom: 40 } },
  plugins: { legend: { display: false }, tooltip: { enabled: false } }
}

const getStatusClass = (status) => {
  const map = { pending: 'bg-yellow-50 text-yellow-600 border-yellow-200', printing: 'bg-blue-50 text-blue-600 border-blue-200', shipped: 'bg-purple-50 text-purple-600 border-purple-200', completed: 'bg-green-50 text-green-600 border-green-200', cancelled: 'bg-slate-100 text-slate-500 border-slate-200' }
  return map[status] || 'bg-gray-50 text-gray-600'
}
const getStatusLabel = (status) => {
  const map = { pending: 'Chờ xử lý', printing: 'Đang in', shipped: 'Đã gửi', completed: 'Hoàn thành', cancelled: 'Đã hủy' }
  return map[status] || status
}

onMounted(() => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 15) 
  endDate.value = end.toISOString().split('T')[0]
  startDate.value = start.toISOString().split('T')[0]
})
</script>

<template>
  <div class="p-4 md:p-8 max-w-7xl mx-auto font-sans min-h-screen bg-[#F8FAFC]">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Tổng quan</h1>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Bảng chỉ huy ClickIn</p>
      </div>
      <div class="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <div class="p-2 bg-slate-50 rounded-xl text-slate-400"><Calendar class="w-4 h-4"/></div>
        <input type="date" v-model="startDate" class="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none cursor-pointer text-slate-700"/>
        <span class="text-gray-300 font-bold">→</span>
        <input type="date" v-model="endDate" class="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none cursor-pointer text-slate-700"/>
        <button @click="fetchStats" class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm">
          <RefreshCw :class="['w-4 h-4', loading ? 'animate-spin' : '']" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center"><ShoppingBag class="w-5 h-5" /></div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tổng đơn</p>
          <p class="text-2xl font-black text-slate-900 tracking-tighter">{{ stats.totalOrders }}</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center"><Clock class="w-5 h-5" /></div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Chờ xử lý</p>
          <p class="text-2xl font-black text-slate-900 tracking-tighter">{{ stats.pendingOrders }}</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 bg-gradient-to-r from-white to-green-50/50 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center"><DollarSign class="w-5 h-5" /></div>
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-black text-green-600/70 uppercase tracking-widest mb-0.5">Doanh thu</p>
          <p class="text-2xl font-black text-green-600 tracking-tighter truncate">{{ stats.totalRevenue.toLocaleString() }}đ</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Zap class="w-5 h-5" /></div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Dịch vụ</p>
          <p class="text-2xl font-black text-slate-900 tracking-tighter">{{ stats.activeServices }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
        <div class="mb-6 flex justify-between items-center">
          <h2 class="text-lg font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-red-500"/> Biểu đồ Doanh thu
          </h2>
        </div>
        <div class="flex-1 min-h-[350px] relative">
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-2xl">
            <Loader2 class="w-8 h-8 animate-spin text-red-500" />
          </div>
          <Line v-if="stats.chartData.length > 0" :data="chartDataConfig" :options="chartOptions" />
          <div v-else class="h-full flex items-center justify-center text-gray-300 font-black uppercase italic text-sm">Không có dữ liệu</div>
        </div>
      </div>

      <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col relative z-10">
        <h2 class="text-lg font-black uppercase italic tracking-tighter text-slate-900 mb-2 flex items-center gap-2 relative z-10">
          <Crown class="w-5 h-5 text-yellow-500"/> Tỷ trọng Dịch vụ bán chạy
        </h2>
        
        <div class="flex-1 min-h-[350px] relative flex items-center justify-center mt-4">
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center z-20">
            <Loader2 class="w-8 h-8 animate-spin text-yellow-500" />
          </div>
          
          <div class="relative w-full h-full max-w-[600px]">
            <Doughnut v-if="stats.topServices.length > 0" :data="pieDataConfig" :options="pieOptions" :plugins="[leaderLinePlugin]" />
            
            <div v-for="pos in labelPositions" :key="pos.id"
                 @mouseenter="hoveredId = pos.id"
                 @mouseleave="hoveredId = null"
                 class="absolute flex items-center gap-3 bg-white p-2 rounded-[1rem] shadow-[0_4px_12px_rgba(0,0,0,0.06)] border pointer-events-auto transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg"
                 :class="hoveredId === pos.id ? 'z-[100]' : 'z-30'"
                 :style="{
                   left: pos.x + 'px',
                   top: pos.y + 'px',
                   borderColor: pos.color,
                   transform: pos.isRight ? 'translate(4px, -50%)' : 'translate(calc(-100% - 4px), -50%)',
                   flexDirection: pos.isRight ? 'row' : 'row-reverse' 
                 }">
              
              <div class="w-10 h-10 rounded-[0.8rem] overflow-hidden bg-gray-50 flex-shrink-0">
                <img v-if="pos.img" :src="pos.img" class="w-full h-full object-cover" />
                <ImageIcon v-else class="w-full h-full p-2.5 text-gray-300" />
              </div>
              
              <div class="w-[85px] min-w-[85px]" :class="pos.isRight ? 'text-left' : 'text-right'">
                <p class="font-black text-[10.5px] text-slate-900 uppercase leading-tight mb-0.5 truncate">{{ pos.name }}</p>
                <p class="text-[9px] font-black text-gray-500">Đã bán: <span :style="{ color: pos.color }">{{ pos.sold }}</span></p>
              </div>

              <div v-if="hoveredId === pos.id"
                   class="absolute w-60 p-4 rounded-[1.5rem] pointer-events-none transition-all duration-300 opacity-100 scale-100"
                   :class="[
                     'bg-white/40 backdrop-blur-2xl backdrop-saturate-200 border border-white/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]'
                   ]"
                   :style="{
                      [pos.isTopHalf ? 'top' : 'bottom']: 'calc(100% + 12px)',
                      [pos.isRight ? 'right' : 'left']: '0px'
                   }">
                
                <div class="flex gap-3 mb-3">
                  <div class="w-11 h-11 rounded-[0.8rem] overflow-hidden bg-white/60 shadow-sm flex-shrink-0 border border-white/50 backdrop-blur-sm">
                    <img v-if="pos.img" :src="pos.img" class="w-full h-full object-cover" />
                    <Package v-else class="w-full h-full p-2.5 text-slate-500" />
                  </div>
                  <div class="flex-1 flex flex-col justify-center text-left">
                    <p class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Phân tích món</p>
                    <p class="text-[11px] font-black text-slate-900 leading-tight" :style="{ color: pos.color }">{{ pos.name }}</p>
                  </div>
                </div>
                
                <div class="space-y-1.5 bg-white/30 rounded-xl p-3 border border-white/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                  <div class="flex justify-between items-center">
                    <span class="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Đã xuất xưởng</span>
                    <span class="text-xs font-black text-slate-900">{{ pos.sold }}</span>
                  </div>
                  <div class="h-px w-full bg-slate-400/20 my-1"></div>
                  <div class="flex justify-between items-center">
                    <span class="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Tiền thu về</span>
                    <span class="text-sm font-black text-green-600">{{ pos.revenue ? pos.revenue.toLocaleString() : 0 }}đ</span>
                  </div>
                </div>
              </div>
              </div>

            <div v-if="stats.topServices.length > 0" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top 5</p>
              <p class="text-xl font-black text-slate-900 italic tracking-tighter">Dịch vụ</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
        <h2 class="text-lg font-black uppercase italic tracking-tighter text-slate-900">Đơn hàng vừa lên</h2>
        <router-link to="/admin/orders" class="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-50">
          Xem tất cả <ArrowUpRight class="w-3 h-3" />
        </router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <th class="px-6 py-4">Mã đơn</th>
              <th class="px-6 py-4">Khách hàng</th>
              <th class="px-6 py-4">Ngày đặt</th>
              <th class="px-6 py-4">Tổng tiền</th>
              <th class="px-6 py-4 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading"><td colspan="5" class="px-6 py-8 text-center font-black text-xs text-gray-300 uppercase">Đang tải...</td></tr>
            <tr v-else-if="stats.recentOrders.length === 0"><td colspan="5" class="px-6 py-8 text-center font-black text-xs text-gray-300 uppercase">Không có đơn hàng mới</td></tr>
            <tr v-for="order in stats.recentOrders" :key="order.id" class="hover:bg-red-50/30 cursor-pointer transition-colors group" @click="$router.push('/admin/orders')">
              <td class="px-6 py-4 font-black text-slate-900 group-hover:text-red-600">#{{ order.id }}</td>
              <td class="px-6 py-4 font-bold text-sm text-slate-700">{{ order.user?.full_name || 'Khách vãng lai' }}</td>
              <td class="px-6 py-4 text-[11px] font-mono text-gray-500 font-bold uppercase">{{ new Date(order.created_at).toLocaleString('vi-VN') }}</td>
              <td class="px-6 py-4 font-black text-red-600">{{ order.total_price.toLocaleString() }}đ</td>
              <td class="px-6 py-4 text-right">
                <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase border" :class="getStatusClass(order.status)">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800;900&display=swap');
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
</style>