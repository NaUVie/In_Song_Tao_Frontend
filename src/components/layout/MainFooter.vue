<template>
  <footer class="bg-gray-900 text-gray-300 pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
      <!-- About -->
      <div>
        <h3 class="text-white text-lg font-bold mb-6 uppercase tracking-wider">Về chúng tôi</h3>
        <p class="text-sm leading-relaxed mb-6">
          Chúng tôi cung cấp giải pháp in ấn toàn diện cho doanh nghiệp. Với công nghệ in hiện đại và đội ngũ chuyên nghiệp, chúng tôi cam kết mang đến sản phẩm chất lượng nhất.
        </p>
        <div class="flex gap-4">
          <!-- Social Icons Placeholder -->
          <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition cursor-pointer">F</div>
          <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition cursor-pointer">I</div>
          <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition cursor-pointer">Y</div>
        </div>
      </div>

      <!-- Contact -->
      <div>
        <h3 class="text-white text-lg font-bold mb-6 uppercase tracking-wider">Liên hệ</h3>
        <ul class="space-y-4 text-sm text-gray-400">
          <li class="flex gap-3 items-start">
            <span class="text-white font-bold whitespace-nowrap">HO CHI MINH CITY:</span>
            <span>28, Road 270A, Phuoc Long A Ward, Thu Duc City, HCM</span>
          </li>
          <li class="flex gap-3 items-start">
            <span class="text-white font-bold whitespace-nowrap">DONG NAI PROVINCE:</span>
            <span>253 Pham Van Thuan Street, Tam Hiep Ward, Dong Nai</span>
          </li>
          <li class="flex gap-3">
            <span class="text-white font-bold">Hotline:</span>
            <span>0969296540</span>
          </li>
          <li class="flex gap-3">
            <span class="text-white font-bold">Email:</span>
            <span>demo@clickin.vn</span>
          </li>
          <li class="flex gap-3">
            <span class="text-white font-bold">Web:</span>
            <span>www.clickin.vn</span>
          </li>
        </ul>
      </div>

      <!-- Services -->
      <div>
        <h3 class="text-white text-lg font-bold mb-6 uppercase tracking-wider">Dịch vụ</h3>
        <ul class="space-y-2 text-sm">
          <li><a href="#" class="hover:text-white transition">In danh thiếp</a></li>
          <li><a href="#" class="hover:text-white transition">In tờ rơi, Brochure</a></li>
          <li><a href="#" class="hover:text-white transition">In túi giấy</a></li>
          <li><a href="#" class="hover:text-white transition">In tem nhãn Decal</a></li>
          <li><a href="#" class="hover:text-white transition">In thiệp mời</a></li>
        </ul>
      </div>

      <!-- Newsletter -->
      <div>
        <h3 class="text-white text-lg font-bold mb-6 uppercase tracking-wider">Đăng ký nhận tin</h3>
        <p class="text-sm mb-4">Nhận thông tin khuyến mãi mới nhất từ chúng tôi.</p>
        <div class="flex">
          <input type="email" placeholder="Email của bạn..." class="bg-gray-800 text-white px-4 py-2 rounded-l-lg outline-none w-full focus:ring-1 focus:ring-primary-500">
          <button class="bg-primary-600 px-4 py-2 rounded-r-lg hover:bg-primary-700 transition font-bold">Gửi</button>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
      <p>&copy; 2024 ClickIn Printing Services. All rights reserved.</p>
    </div>
  </footer>
</template>
