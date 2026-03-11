<script setup>
import MainLayout from '../components/layout/MainLayout.vue'
import { MapPin, Phone, Mail, Clock } from 'lucide-vue-next'
</script>

<template>
  <MainLayout>
    <div class="bg-gray-50 min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Breadcrumb -->
        <nav class="text-sm text-gray-500 mb-6">
          <router-link to="/" class="hover:text-primary-600">Trang chủ</router-link> 
          <span class="mx-2">/</span> 
          <span class="font-medium text-gray-800">Liên hệ</span>
        </nav>

        <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center uppercase">Liên Hệ Song Tạo</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Info Section -->
          <div class="bg-white rounded-xl shadow-sm p-8">
            <h2 class="text-xl font-bold text-primary-600 mb-6 border-b pb-4">THÔNG TIN LIÊN HỆ</h2>
            
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
                  <MapPin class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">Trụ sở chính (Phú Nhuận)</h3>
                  <p class="text-gray-600 text-sm mt-1">211 Nguyễn Trọng Tuyển, Phường 8, Q.Phú Nhuận, TP.HCM</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
                  <MapPin class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">Chi nhánh (Quận 7)</h3>
                  <p class="text-gray-600 text-sm mt-1">71 Đường 25, Phường Tân Hưng, Quận 7, TP.HCM</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-600">
                  <Phone class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">Hotline</h3>
                  <p class="text-gray-600 text-sm mt-1">(028) 7106 0707 - (028) 7306 0707</p>
                </div>
              </div>

               <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-600">
                  <Mail class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">Email</h3>
                  <p class="text-gray-600 text-sm mt-1">in@songtao.vn</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-orange-600">
                  <Clock class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">Giờ làm việc</h3>
                  <p class="text-gray-600 text-sm mt-1">Sáng: 8h00 - 12h00 | Chiều: 13h30 - 17h30 (T2 - T7)</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Map Section -->
          <div class="bg-white rounded-xl shadow-sm p-2 h-[500px] md:h-auto">
             <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2941369325995!2d106.67814331533428!3d10.788771992313045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2d6f0f5b9f%3A0x7f0f5b9f0f5b9f0f!2zMjExIE5ndXnhu4VuIFRy4buNbmcgVHV54buDbiwgUGjGsOG7nW5nIDgsIFBow7ogTmh14bqtbiwgSOG7kyBDaMOtIE1pbmg!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
