

<template>
  <div class="search-bar bg-gray-50 px-4 py-8 mt-20 shadow-sm">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Find Your Next Rental:</h2>
    <form @submit.prevent="handleSearch" class="form-container flex flex-col sm:flex-row gap-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Enter address, city, or suburb"
        class="search-input flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
      />

      <div class="filter-buttons">
        <button>Property type</button>
        <button>Price</button>
        <button>Filters</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchTerm = ref('')

function handleSearch() {
  console.log('Searching for:', searchTerm.value)
}
</script>

<style>
.search-bar {
  display: flex;
  background-color: #f9fafb;
  padding: 2rem 1rem;
  margin-top: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.search-bar h2 {
  display: flex;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.form-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 500px;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  background-color: white;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.filter-buttons {
  display: flex;
  gap: 1rem; /* or 2rem if you want more space */
}


.filter-buttons button {
  padding: 0.5rem 1rem;
  background-color: white;
  color: black;
  border: 1px solid black;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  gap: 2rem;
}

.filter-buttons button:hover {
  opacity: 0.8;
}
</style>