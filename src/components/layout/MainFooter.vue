<template>
  <footer class="bg-[#0f172a] text-slate-400 pt-20 pb-10 border-t border-red-900/30">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
        
        <div class="lg:col-span-4">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-500/30">
              C
            </div>
            <span class="text-white text-2xl font-black tracking-tighter uppercase">ClickIn</span>
          </div>
          <p class="text-[15px] leading-relaxed mb-8 pr-4 italic">
            "Nâng tầm thương hiệu qua từng bản in. Giải pháp in ấn toàn diện, sắc nét và chuyên nghiệp cho mọi doanh nghiệp."
          </p>
          <div class="flex gap-3">
            <a href="#" class="w-10 h-10 border border-slate-700 rounded-xl flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300">
              <Facebook size="18" />
            </a>
            <a href="#" class="w-10 h-10 border border-slate-700 rounded-xl flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300">
              <Instagram size="18" />
            </a>
            <a href="#" class="w-10 h-10 border border-slate-700 rounded-xl flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300">
              <Youtube size="18" />
            </a>
          </div>
        </div>

        <div class="lg:col-span-5">
          <h3 class="text-white text-sm font-bold mb-8 uppercase tracking-[0.2em] border-b border-red-600/50 w-fit pb-1">Hệ thống văn phòng</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px]">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-red-500 font-bold uppercase text-[12px]">
                <MapPin size="14" />
                <span>TP. Hồ Chí Minh</span>
              </div>
              <p class="leading-relaxed">28, Đường 270A, Phường Phước Long, TP. Hồ Chí Minh</p>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-red-500 font-bold uppercase text-[12px]">
                <MapPin size="14" />
                <span>Tỉnh Đồng Nai</span>
              </div>
              <p class="leading-relaxed">Tầng 2, Tòa nhà Nguyễn Kim, 253 Phạm Văn Thuận, Phường Tam Hiệp, Tỉnh Đồng Nai</p>
            </div>
            <div class="md:col-span-2 pt-2 space-y-3 border-t border-slate-800">
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <Phone size="16" class="text-red-500" />
                  <span class="text-white font-medium">0969 296 540</span>
                </div>
                <div class="flex items-center gap-2">
                  <Mail size="16" class="text-red-500" />
                  <span>demo@clickin.vn</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-3">
          <h3 class="text-white text-sm font-bold mb-8 uppercase tracking-[0.2em] border-b border-red-600/50 w-fit pb-1">Bản tin</h3>
          <p class="text-sm mb-6 leading-relaxed">Đăng ký để nhận báo giá ưu đãi và mẫu thiết kế mới nhất.</p>
          <div class="relative">
            <input 
              type="email" 
              placeholder="Email của bạn..." 
              class="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all text-sm"
            >
            <button class="absolute right-1.5 top-1.5 bottom-1.5 bg-red-600 text-white px-4 rounded-lg hover:bg-red-700 transition-colors">
              <Send size="16" />
            </button>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-800/50 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-slate-500">
        <p>&copy; 2024 <span class="text-slate-300 font-medium">ClickIn Printing Services</span>. Bảo lưu mọi quyền.</p>
        <div class="flex gap-8 text-[12px]">
          <a href="#" class="hover:text-white transition">Chính sách bảo mật</a>
          <a href="#" class="hover:text-white transition">Điều khoản</a>
          <a href="#" class="hover:text-white transition text-slate-300 uppercase font-bold italic">www.clickin.vn</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { 
  Facebook, Instagram, Youtube, 
  MapPin, Phone, Mail, Send 
} from 'lucide-vue-next'
</script>