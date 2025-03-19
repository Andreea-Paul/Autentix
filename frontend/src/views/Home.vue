<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <div class="home flex-grow flex flex-col items-center justify-center bg-radial from-zinc-200 from-70% to-zinc-900">
      <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-black text-center">
        AutentiX
      </h1>
      <VerifyDocument />
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import VerifyDocument from '../components/VerifyDocument.vue'
</script>
