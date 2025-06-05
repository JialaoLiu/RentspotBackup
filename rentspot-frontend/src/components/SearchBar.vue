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
        <button type="button" class="btn btn-secondary" @click="toggleFilter">Filters</button>
        <button type="submit" class="btn btn-dark" id="search-button">Search</button>
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

  // Prevent scrolling 
  if (showFilter.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function handleApplyFilters(filters) {
  // Handle the filters received from the filter component
  console.log('Applied filters:', filters)

  const searchParams = {
    keyword: searchTerm.value,
    ...filters
  }

  emit('search', searchParams)

  showFilter.value = false
}

function handleSearch() {

  console.log('Searching for:', searchTerm.value)
  
  emit('search', { keyword: searchTerm.value })
}

const emit = defineEmits(['search'])
</script>

<style>
.search-bar {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary); 
  padding: 2rem 1rem;
  margin-top: 1rem;
  box-shadow: var(--shadow-md); 
  align-items: center;
  gap: 2rem;
  position: relative;
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-md);
}

.search-bar h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 1rem;
}

.form-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
  width: 100%;
  max-width: 800px;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  outline: none;
  background-color: var(--color-bg-primary);
}

/* focus styles handled by global CSS */

.filter-buttons {
  display: flex;
  gap: var(--space-md);
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