<template>
  <div class="search-bar">
    <h2>Find Your Next Rental:</h2>
    <form @submit.prevent="handleSearch" class="form-container">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Enter address, city, or suburb"
        class="search-input"
      />

      <div class="filter-buttons">
        <button type="button" @click="toggleFilter">Filters</button>
        <button type="submit" id="search-button">Search</button>
      </div>
    </form>

    <!-- Use the filter popup component -->
    <FilterPopup
      v-if="showFilter"
      @close="toggleFilter"
      @apply-filters="handleApplyFilters"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FilterPopup from './FilterPopup.vue'

const searchTerm = ref('')
const showFilter = ref(false)

function toggleFilter() {
  showFilter.value = !showFilter.value

  // Prevent scrolling on body when popup is open
  if (showFilter.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function handleApplyFilters(filters) {
  // Handle the filters received from the filter component
  console.log('Applied filters:', filters)

  // Perform search with the filters
  const searchParams = {
    keyword: searchTerm.value,
    ...filters
  }

  // Emit event to parent component
  emit('search', searchParams)

  // Close filter popup
  showFilter.value = false
}

function handleSearch() {
  // Simple search without filters
  console.log('Searching for:', searchTerm.value)

  // Emit event to parent component
  emit('search', { keyword: searchTerm.value })
}

const emit = defineEmits(['search'])
</script>

<style>
.search-bar {
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
  padding: 2rem 1rem;
  margin-top: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  align-items: center;
  gap: 2rem;
  position: relative;
}

.search-bar h2 {
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
  width: 100%;
  max-width: 800px;
}

.search-input {
  flex: 1;
  min-width: 200px;
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
  gap: 1rem;
}

.filter-buttons button {
  padding: 0.5rem 1rem;
  background-color: white;
  color: black;
  border: 1px solid black;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.filter-buttons button:hover {
  opacity: 0.8;
}

#search-button {
  background-color: black;
  color: white;
  border: none;
}

#search-button:hover {
  background-color: white;
  color: black;
  border: 1px solid black;
}

@media (max-width: 640px) {
  .form-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-buttons {
    width: 100%;
    justify-content: space-between;
  }
}
</style>