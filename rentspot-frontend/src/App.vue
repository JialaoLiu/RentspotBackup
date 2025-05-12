<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div>
    <NavBar />
    <router-view />
    <Footer />
  </div>
</template>

<style scoped>
/* You can add global layout styles here if needed */
</style>
