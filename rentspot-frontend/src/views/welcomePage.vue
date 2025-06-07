<template>
  <section class="hero-section">
    <div class="hero-text">
      <h1>RentSpot Platform</h1>
      <p>
        Find, compare and manage rental homes with ease. RentSpot helps you connect with
        landlords and secure your perfect home faster.
      </p>
      <div class="hero-buttons">
        <button class="btn-primary">Find a Rental</button>
        <button class="btn-secondary">List a Property</button>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: linear-gradient(to right, #1abc9c, #3498db); /* green & blue */
  color: white;
  text-align: center;
  flex-direction: column;
}

.hero-text {
  max-width: 700px;
}

.hero-text h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.hero-text p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.hero-buttons button {
  margin: 10px;
  padding: 14px 24px;
  font-size: 1rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: 0.3s ease;
}

.btn-primary {
  background: #ffffff;
  color: #333;
  font-weight: bold;
}

.btn-secondary {
  background: transparent;
  border: 2px solid white;
  color: white;
}
</style>
