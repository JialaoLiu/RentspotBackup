

<template>
  <div class="bg-gray-50 px-4 py-8 mt-20 shadow-sm">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Find Your Next Rental</h2>
    <form @submit.prevent="handleSearch" class="flex flex-col sm:flex-row gap-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Enter address, city, or suburb"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
      />
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Search
      </button>
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