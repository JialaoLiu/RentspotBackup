<template>
  <div class="multiple-image-uploader">
    <!-- File Input -->
    <input 
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      :accept="accept"
      class="file-input"
      :id="inputId"
      multiple
    />
    
    <!-- Drop Zone -->
    <div 
      class="drop-zone"
      :class="{ 
        'active': isDragging, 
        'has-images': images.length > 0 && !uploading,
        'is-uploading': uploading
      }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <!-- Image Grid -->
      <div v-if="images.length > 0 && !uploading" class="image-grid">
        <div 
          v-for="(image, index) in images" 
          :key="index" 
          class="image-item"
        >
          <img :src="image.url" :alt="`Image ${index + 1}`" class="preview-image" />
          <button 
            type="button" 
            class="remove-image-btn"
            @click.stop="removeImage(index)"
          >
            <Icon name="remove" size="sm" />
          </button>
          <div v-if="index === 0" class="primary-badge">Primary</div>
        </div>
        <!-- Add more button -->
        <div v-if="images.length < maxImages" class="add-more-btn" @click.stop="triggerFileInput">
          <Icon name="plus" size="md" color="#6b7280" />
          <span>Add More</span>
        </div>
      </div>
      
      <!-- Upload Progress -->
      <div v-if="uploading" class="upload-progress">
        <div class="progress-circle">
          <svg viewBox="0 0 36 36">
            <path
              class="progress-circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="progress-circle-fill"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              :stroke-dasharray="`${uploadProgress}, 100`"
            />
          </svg>
          <div class="progress-text">{{ Math.round(uploadProgress) }}%</div>
        </div>
        <p>Uploading {{ currentUploadIndex + 1 }} of {{ totalUploads }}...</p>
      </div>
      
      <!-- Default Content -->
      <div v-if="images.length === 0 && !uploading" class="drop-content">
        <Icon name="upload" size="md" color="#6b7280" />
        <div class="upload-text">
          <span class="primary-text">{{ primaryText }}</span>
          <span class="secondary-text">{{ secondaryText }}</span>
          <span class="info-text">First image will be the primary image</span>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
    
    <!-- Clear All Button -->
    <button 
      v-if="images.length > 0 && !uploading && showClearButton" 
      type="button" 
      class="clear-all-button"
      @click.stop="clearAllImages"
    >
      Clear All Images
    </button>

    <!-- Image Count Info -->
    <div v-if="images.length > 0" class="image-count-info">
      {{ images.length }} / {{ maxImages }} images selected
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Icon from './Common/Icon.vue'
import { uploadMultiplePropertyImages } from '../services/propertyService'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB default
  },
  maxImages: {
    type: Number,
    default: 10
  },
  uploadProgress: {
    type: Number,
    default: 0
  },
  uploading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  primaryText: {
    type: String,
    default: 'Drag & drop images here'
  },
  secondaryText: {
    type: String,
    default: 'or click to browse (multiple selection allowed)'
  },
  showClearButton: {
    type: Boolean,
    default: true
  },
  inputId: {
    type: String,
    default: 'multiple-file-upload'
  }
})

const emit = defineEmits(['update:modelValue', 'files-selected', 'clear'])

const fileInput = ref(null)
const isDragging = ref(false)
const images = ref([])
const errorMessage = ref('')
const currentUploadIndex = ref(0)
const totalUploads = ref(0)

// Watch for model value changes
watch(() => props.modelValue, (newValue) => {
  if (Array.isArray(newValue)) {
    images.value = [...newValue]
  } else {
    images.value = []
  }
}, { immediate: true })

// Update error message from props
watch(() => props.error, (newError) => {
  errorMessage.value = newError
}, { immediate: true })

// Trigger file input click
function triggerFileInput() {
  if (!props.uploading) {
    fileInput.value.click()
  }
}

// Handle file selection via input
function handleFileChange(event) {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  
  processFiles(files)
}

// Handle file drop
function handleDrop(event) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  if (files.length === 0) return
  
  processFiles(files)
}

// Process the selected files
function processFiles(files) {
  const validFiles = []
  
  // Check if adding these files would exceed the limit
  if (images.value.length + files.length > props.maxImages) {
    errorMessage.value = `You can only upload up to ${props.maxImages} images. Currently have ${images.value.length}.`
    return
  }
  
  // Validate each file
  for (const file of files) {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'Please select only image files'
      return
    }
    
    // Check file size
    if (file.size > props.maxSize) {
      const maxSizeMB = props.maxSize / (1024 * 1024)
      errorMessage.value = `File size exceeds the maximum limit of ${maxSizeMB}MB`
      return
    }
    
    validFiles.push(file)
  }
  
  // Clear any previous errors
  errorMessage.value = ''
  
  // Create previews for valid files
  validFiles.forEach(file => {
    createFilePreview(file)
  })
  
  // Emit files selected event
  emit('files-selected', validFiles)
}

// Create image preview
function createFilePreview(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageObj = {
      file: file,
      url: e.target.result,
      name: file.name,
      size: file.size
    }
    
    images.value.push(imageObj)
    emit('update:modelValue', images.value)
  }
  reader.readAsDataURL(file)
}

// Remove specific image
function removeImage(index) {
  images.value.splice(index, 1)
  emit('update:modelValue', images.value)
}

// Clear all images
function clearAllImages() {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  images.value = []
  errorMessage.value = ''
  emit('update:modelValue', [])
  emit('clear')
}

// Update upload progress info
function updateUploadProgress(current, total) {
  currentUploadIndex.value = current
  totalUploads.value = total
}

// Expose method for parent components
defineExpose({
  updateUploadProgress
})
</script>

<style scoped>
.multiple-image-uploader {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-input {
  display: none;
}

.drop-zone {
  width: 100%;
  min-height: 200px;
  border: 2px dashed var(--border-primary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--surface-secondary);
  padding: 20px;
}

.drop-zone:hover {
  border-color: var(--border-secondary);
  background-color: var(--surface-elevated);
}

.drop-zone.active {
  border-color: var(--interactive-primary);
  background-color: var(--surface-elevated);
}

.drop-zone.has-images {
  min-height: auto;
  border-style: solid;
  border-color: var(--border-primary);
}

.drop-zone.is-uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Image Grid Styles */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  width: 100%;
  max-width: 800px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--border-primary);
  background: var(--surface-primary);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: var(--interactive-danger);
  color: var(--surface-primary);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background: var(--interactive-danger-hover);
}

.primary-badge {
  position: absolute;
  bottom: 5px;
  left: 5px;
  background: var(--interactive-primary);
  color: var(--surface-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.add-more-btn {
  aspect-ratio: 1;
  border: 2px dashed var(--border-primary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface-secondary);
}

.add-more-btn:hover {
  border-color: var(--border-secondary);
  background: var(--surface-elevated);
}

.add-more-btn span {
  margin-top: 5px;
  font-size: 12px;
  color: var(--text-secondary);
}

/* Upload Progress Styles */
.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.progress-circle {
  position: relative;
  width: 60px;
  height: 60px;
}

.progress-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-circle-bg {
  fill: none;
  stroke: var(--border-primary);
  stroke-width: 3.8;
}

.progress-circle-fill {
  fill: none;
  stroke: var(--interactive-primary);
  stroke-width: 3.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.2s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 600;
  font-size: 12px;
  color: var(--interactive-primary);
}

/* Default Content Styles */
.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 15px;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.primary-text {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
}

.secondary-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.info-text {
  color: var(--text-tertiary);
  font-size: 12px;
  font-style: italic;
}

/* Action Buttons */
.clear-all-button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: var(--interactive-danger);
  color: var(--surface-primary);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-all-button:hover {
  background-color: var(--interactive-danger-hover);
}

.image-count-info {
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}

/* Error Message */
.error-message {
  color: var(--interactive-danger);
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
  background-color: var(--surface-elevated);
  border: 1px solid var(--interactive-danger);
  border-radius: 6px;
  padding: 10px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .drop-zone {
    padding: 15px;
  }
}
</style>