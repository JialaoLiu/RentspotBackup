<script setup>
import { onMounted } from 'vue'
import NavBar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { currentRoute, initRouter } from './router/customRouter.js'

// Initialize the router
onMounted(() => {
  initRouter();
})
</script>

<template>
  <div class="app-container">
    <NavBar />
    <main class="main-content">
      <component v-if="currentRoute" :is="currentRoute" />
    </main>
    <Footer />
  </div>
</template>

<style>
/* These styles should not be scoped so they can apply globally */
html, body {
  height: 100%;
  margin: 0;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* This makes the container take at least the full viewport height */
}

.main-content {
  flex: 1; /* This makes the content area expand to fill available space */
}
</style>