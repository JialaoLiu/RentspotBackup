<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="copyright">© 2025 RentSpot AU. All rights reserved.</div>
      <div class="footer-links">
        <a href="#" class="footer-link">About</a>
        <a href="#" class="footer-link">Terms</a>
        <a href="#" class="footer-link">Privacy</a>
        <a href="#" class="footer-link">Contact</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 
</script>

<style scoped>
.footer {
  background-color: var(--color-bg-dark);
  color: white;
  width: 100%;
  padding: 1.5rem 0;
}

.footer-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.copyright {
  margin-bottom: var(--space-sm);
}

.footer-links {
  display: flex;
  gap: var(--space-md);
}

.footer-link {
  color: white;
  text-decoration: none;
  transition: color var(--transition-normal);
}

.footer-link:hover {
  color: var(--color-primary);
}

@media (min-width: 640px) {
  .footer-container {
    flex-direction: row;
  }
  
  .copyright {
    margin-bottom: 0;
  }
}
</style>