<template>
  <div class="property-gallery">
    <div class="gallery-main">
      <button 
        v-if="images.length > 1" 
        class="gallery-nav gallery-prev" 
        @click="prevImage" 
        aria-label="Previous image"
      >
        ←
      </button>
      <img 
        :src="currentImage.url" 
        :alt="currentImage.alt" 
        class="main-image" 
        @error="handleImageError"
      >
      <button 
        v-if="images.length > 1" 
        class="gallery-nav gallery-next" 
        @click="nextImage" 
        aria-label="Next image"
      >
        →
      </button>
    </div>
    
    <div v-if="images.length > 1" class="gallery-thumbnails">
      <div 
        v-for="(image, index) in images" 
        :key="index" 
        class="thumbnail" 
        :class="{ active: currentIndex === index }"
        @click="setImage(index)"
      >
        <img :src="image.url" :alt="`Thumbnail ${index + 1}`">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
})

const currentIndex = ref(0)

const currentImage = computed(() => {
  if (props.images.length === 0) {
    return { 
      url: 'https://via.placeholder.com/800x600?text=No+Images+Available', 
      alt: 'No images available' 
    }
  }
  
  return props.images[currentIndex.value]
})

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function prevImage() {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function setImage(index) {
  currentIndex.value = index
}

function handleImageError(e) {
  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available'
}
</script>

<style scoped>
.property-gallery {
  margin-bottom: 30px;
}

.gallery-main {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gallery-prev {
  left: 10px;
}

.gallery-next {
  right: 10px;
}

.gallery-thumbnails {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.thumbnail.active {
  opacity: 1;
  border: 2px solid #3b82f6;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 640px) {
  .gallery-main {
    height: 300px;
  }
  
  .thumbnail {
    width: 70px;
    height: 50px;
  }
}
</style>