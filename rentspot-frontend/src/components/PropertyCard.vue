<template>
  <div class="border rounded-lg shadow-sm overflow-hidden bg-white">
    <img
      :src="image"
      alt="Property Image"
      class="w-full h-48 object-cover"
    />
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
      <p class="text-sm text-gray-600">{{ address }}</p>
      <p class="text-blue-600 font-bold mt-2">${{ price }}/week</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  address: String,
  price: Number,
  image: String
})
</script>