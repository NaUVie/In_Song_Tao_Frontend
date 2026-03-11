<script setup>
import MainLayout from '../components/layout/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <div class="bg-gray-50 min-h-screen py-10">
      <div class="max-w-4xl mx-auto px-4">
        <nav class="text-sm text-gray-500 mb-6">
          <router-link to="/" class="hover:text-primary-600">Trang chủ</router-link> 
          <span class="mx-2">/</span> 
          <span class="font-medium text-gray-800">Hướng dẫn</span>
        </nav>

        <div class="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 class="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">HƯỚNG DẪN ĐẶT HÀNG & THANH TOÁN</h1>
          
          <div class="space-y-8">
             <!-- Steps -->
             <div class="flex flex-col gap-6">
                <div class="flex gap-4">
                  <div class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xl flex-shrink-0">1</div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Chọn sản phẩm & Quy cách</h3>
                    <p class="text-gray-600">
                      Quý khách chọn danh mục sản phẩm trên Menu (Ví dụ: Danh thiếp, Tờ rơi...).<br>
                      Tại trang chi tiết, chọn số lượng, loại giấy và các yêu cầu gia công (cán màng, bo góc...).
                    </p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xl flex-shrink-0">2</div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Gửi File thiết kế</h3>
                    <p class="text-gray-600">
                      - <strong>Nếu đã có file:</strong> Upload file (PDF, AI, Corel, JPG chất lượng cao) trực tiếp trên web.<br>
                      - <strong>Nếu chưa có file:</strong> Tích vào ô "Yêu cầu thiết kế". Chúng tôi sẽ liên hệ để tư vấn.
                    </p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xl flex-shrink-0">3</div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Thanh toán & Đặt cọc</h3>
                    <p class="text-gray-600">
                      Sau khi xác nhận đơn hàng, Quý khách vui lòng chuyển khoản đặt cọc 50% giá trị đơn hàng hoặc thanh toán 100%.<br>
                      <br>
                      <strong>Thông tin chuyển khoản:</strong><br>
                      Ngân hàng: Vietcombank<br>
                      Số TK: 0071000xxxxxxx<br>
                      Chủ TK: CÔNG TY TNHH SONG TẠO
                    </p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xl flex-shrink-0">4</div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Giao hàng</h3>
                    <p class="text-gray-600">
                      Thời gian in ấn từ 1-3 ngày tùy sản phẩm.<br>
                      Chúng tôi hỗ trợ giao hàng tận nơi tại TP.HCM và gửi chành xe đi các tỉnh.
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
