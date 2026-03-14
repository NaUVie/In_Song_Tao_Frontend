<script setup>
import MainHeader from './MainHeader.vue'
import NavBar from './NavBar.vue'
import MainFooter from './MainFooter.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen font-sans">
    
    <div class="sticky top-0 z-[100] w-full flex flex-col shadow-lg">
      <MainHeader />
      <NavBar />
    </div>

    <main class="flex-grow bg-gray-50">
      <slot></slot>
    </main>
    
    <MainFooter />
  </div>
</template>