<script setup>
import MainLayout from '../components/layout/MainLayout.vue'
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-vue-next'
</script>

<template>
  <MainLayout>
    <div class="bg-gray-50 min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4">
        
        <nav class="text-sm text-gray-500 mb-6">
          <router-link to="/" class="hover:text-red-600 transition-colors">Trang chủ</router-link> 
          <span class="mx-2">/</span> 
          <span class="font-bold text-gray-800">Liên hệ</span>
        </nav>

        <h1 class="text-3xl font-black text-slate-900 mb-8 text-center uppercase tracking-wide">
          Liên Hệ <span class="text-red-600">ClickIn</span>
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 class="text-xl font-black text-red-600 mb-6 border-b border-gray-100 pb-4 uppercase">Thông tin liên hệ</h2>
            
            <div class="space-y-6">
              
              <div class="flex items-start gap-4">
                <div class="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-600">
                  <MapPin class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Chi nhánh Hồ Chí Minh</h3>
                  <p class="text-slate-600 text-sm mt-1 leading-relaxed">
                    28, Đường 270A, Phường Phước Long A, TP. Thủ Đức, TP.HCM
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-600">
                  <MapPin class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Chi nhánh Đồng Nai</h3>
                  <p class="text-slate-600 text-sm mt-1 leading-relaxed">
                    253 Phạm Văn Thuận, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-600">
                  <Phone class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Hotline tư vấn</h3>
                  <p class="text-slate-600 text-sm mt-1 font-semibold">0969 296 540</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-600">
                  <Mail class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Email</h3>
                  <p class="text-slate-600 text-sm mt-1">lienhe@clickin.vn</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-600">
                  <Globe class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Website</h3>
                  <p class="text-slate-600 text-sm mt-1">www.clickin.vn</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 text-red-600">
                  <Clock class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-900">Giờ làm việc</h3>
                  <p class="text-slate-600 text-sm mt-1">Sáng: 8h00 - 12h00 | Chiều: 13h30 - 17h30 (T2 - T7)</p>
                </div>
              </div>

            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-2 h-[500px] lg:h-auto border border-gray-100 overflow-hidden">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8462129547984!2d106.76646801032042!3d10.82307855828762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752656746f3243%3A0x4ac1898ae266a59c!2zMjggxJDGsOG7nW5nIFPhu5EgMjcwQSwgUGjGsOG7m2MgTG9uZyBBLCBUaOG7pyDEkOG7qWMsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCA3MDAwMDAsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1773243930109!5m2!1svi!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>

        </div>
      </div>
    </div>
  </MainLayout>
</template>