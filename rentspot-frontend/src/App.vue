<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app-container">
    <NavBar />
    <main class="main-content">
      <router-view />
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