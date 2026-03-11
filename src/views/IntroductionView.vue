<script setup>
import MainLayout from '../components/layout/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <div class="bg-gray-50 min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Breadcrumb -->
        <nav class="text-sm text-gray-500 mb-6">
          <router-link to="/" class="hover:text-primary-600">Trang chủ</router-link> 
          <span class="mx-2">/</span> 
          <span class="font-medium text-gray-800">Giới thiệu</span>
        </nav>

        <div class="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 class="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">GIỚI THIỆU VỀ ClickIn</h1>
          
          <div class="prose max-w-none text-gray-700 leading-relaxed space-y-6">
            <p class="font-semibold text-lg">Kính Chào Quý Khách!</p>
            
            <p>
              Lời đầu tiên, <strong class="text-primary-600">Công ty TNHH ClickIn</strong> xin gửi tới Quý khách hàng lời chúc sức khỏe và lời chào trân trọng nhất.
            </p>

            <p>
              Công ty chúng tôi hoạt động trong lĩnh vực: <strong>THIẾT KẾ - IN ẤN - QUẢNG CÁO</strong>.
              Với đội ngũ nhân viên thiết kế chuyên nghiệp, năng động, sáng tạo cùng hệ thống máy in hiện đại, 
              ClickIn cam kết mang đến cho Quý khách những sản phẩm chất lượng cao với giá thành hợp lý nhất.
            </p>

            <h3 class="text-xl font-bold text-gray-800 mt-8">SỨ MỆNH CỦA CHÚNG TÔI</h3>
            <p>
              "Giúp khách hàng nâng tầm thương hiệu thông qua các ấn phẩm chất lượng." 
              Chúng tôi hiểu rằng mỗi danh thiếp, tờ rơi hay catalogue đều là bộ mặt của doanh nghiệp bạn. 
              Vì vậy, sự tỉ mỉ trong từng công đoạn là ưu tiên hàng đầu của chúng tôi.
            </p>

            <h3 class="text-xl font-bold text-gray-800 mt-8">DỊCH VỤ CHÍNH</h3>
            <ul class="list-disc pl-6 space-y-2">
              <li>In Danh thiếp, Namecard, Card visit (Lấy liền, in offset, ép kim...)</li>
              <li>In Tờ rơi, Tờ gấp, Brochure, Leaflet (A5, A4, A3...)</li>
              <li>In Tem nhãn, Decal, Sticker (Decal giấy, nhựa, trong, xi bạc...)</li>
              <li>In Bao thư, Tiêu đề thư, Folder, Kẹp file</li>
              <li>In Catalogue, Profile công ty, Kỷ yếu</li>
              <li>In Túi giấy, Hộp giấy, Bao bì sản phẩm</li>
              <li>In Lịch tết, Bao lì xì, Thiệp mời...</li>
            </ul>

            <h3 class="text-xl font-bold text-gray-800 mt-8">TẠI SAO CHỌN ClickIn?</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div class="border rounded-lg p-4 bg-blue-50">
                <h4 class="font-bold text-blue-800 mb-2">⭐ Chất lượng hàng đầu</h4>
                <p class="text-sm">Máy in offset hiện đại, màu sắc chuẩn, sắc nét.</p>
              </div>
              <div class="border rounded-lg p-4 bg-green-50">
                <h4 class="font-bold text-green-800 mb-2">⭐ Giá cả cạnh tranh</h4>
                <p class="text-sm">In trực tiếp tại xưởng, không qua trung gian.</p>
              </div>
              <div class="border rounded-lg p-4 bg-orange-50">
                <h4 class="font-bold text-orange-800 mb-2">⭐ Giao hàng nhanh</h4>
                <p class="text-sm">Đáp ứng đơn hàng gấp, giao hàng tận nơi.</p>
              </div>
              <div class="border rounded-lg p-4 bg-purple-50">
                <h4 class="font-bold text-purple-800 mb-2">⭐ Thiết kế chuyên nghiệp</h4>
                <p class="text-sm">Đội ngũ designer trẻ, sáng tạo.</p>
              </div>
            </div>

            <p class="mt-8 italic text-gray-500 border-t pt-4">
              Rất mong nhận được sự hợp tác của Quý khách hàng!<br>
              Trân trọng.
            </p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
