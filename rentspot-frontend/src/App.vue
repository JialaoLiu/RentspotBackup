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


/* Apply variables to body and html */
html, body {
  background-color: var(--color-bg-primary);
  color: var(--color-dark);
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>