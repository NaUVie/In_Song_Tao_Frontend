<script setup>
import MainHeader from './MainHeader.vue'
import NavBar from './NavBar.vue'
import MainFooter from './MainFooter.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <MainHeader />
    <NavBar />
    <main class="flex-grow bg-gray-50">
      <slot></slot>
    </main>
    <MainFooter />
  </div>
</template>
