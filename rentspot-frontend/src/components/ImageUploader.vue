<template>
  <div class="image-uploader">
    <!-- File Input -->
    <input 
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      :accept="accept"
      class="file-input"
      :id="inputId"
    />
    
    <!-- Drop Zone -->
    <div 
      class="drop-zone"
      :class="{ 
        'active': isDragging, 
        'has-preview': !!previewUrl && !uploading,
        'is-uploading': uploading
      }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <!-- Preview Image -->
      <img v-if="previewUrl && !uploading" :src="previewUrl" alt="Preview" class="preview-image" />
      
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
      </div>
      
      <!-- Default Content -->
      <div v-if="!previewUrl && !uploading" class="drop-content">
        <Icon name="upload" size="md" color="#6b7280" />
        <div class="upload-text">
          <span class="primary-text">{{ primaryText }}</span>
          <span class="secondary-text">{{ secondaryText }}</span>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
    
    <!-- Clear Button - only show if we have a preview -->
    <button 
      v-if="previewUrl && !uploading && showClearButton" 
      type="button" 
      class="clear-button"
      @click.stop="clearSelection"
    >
      Clear
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Import Icon component
import Icon from './Common/Icon.vue';


const props = defineProps({
  modelValue: {
    type: [File, String, null],
    default: null
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB default
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
    default: 'Drag & drop your image here'
  },
  secondaryText: {
    type: String,
    default: 'or click to browse'
  },
  showClearButton: {
    type: Boolean,
    default: true
  },
  inputId: {
    type: String,
    default: 'file-upload'
  }
});

const emit = defineEmits(['update:modelValue', 'file-selected', 'clear']);

const fileInput = ref(null);
const isDragging = ref(false);
const previewUrl = ref('');
const errorMessage = ref('');

// Compute preview URL from model value
watch(() => props.modelValue, () => {
  if (!props.modelValue) {
    previewUrl.value = '';
    return;
  }
  
  if (typeof props.modelValue === 'string') {
    // If model value is a URL string
    previewUrl.value = props.modelValue;
  } else if (props.modelValue instanceof File) {
    // If model value is a File object
    createFilePreview(props.modelValue);
  }
}, { immediate: true });

// Update error message from props
watch(() => props.error, (newError) => {
  errorMessage.value = newError;
}, { immediate: true });

// Trigger file input click
function triggerFileInput() {
  if (!props.uploading) {
    fileInput.value.click();
  }
}

// Handle file selection via input
function handleFileChange(event) {
  const files = event.target.files;
  if (files.length === 0) return;
  
  processFile(files[0]);
}

// Handle file drop
function handleDrop(event) {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length === 0) return;
  
  processFile(files[0]);
}

// Process the selected file
function processFile(file) {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select an image file';
    return;
  }
  
  // Check file size
  if (file.size > props.maxSize) {
    const maxSizeMB = props.maxSize / (1024 * 1024);
    errorMessage.value = `File size exceeds the maximum limit of ${maxSizeMB}MB`;
    return;
  }
  
  // Clear any previous errors
  errorMessage.value = '';
  
  // Create preview
  createFilePreview(file);
  
  // Update model and emit event
  emit('update:modelValue', file);
  emit('file-selected', file);
}

// Create image preview
function createFilePreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Clear file selection
function clearSelection() {
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  previewUrl.value = '';
  errorMessage.value = '';
  emit('update:modelValue', null);
  emit('clear');
}
</script>

<style scoped>
.image-uploader {
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
  height: 200px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background-color: #f9f9f9;
}

.drop-zone.active {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

.drop-zone.has-preview {
  padding: 0;
  border-style: solid;
}

.drop-zone.is-uploading {
  cursor: default;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.drop-content .icon {
  margin-bottom: 10px;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.primary-text {
  font-weight: 500;
  color: #374151;
}

.secondary-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.error-message {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 8px;
  text-align: center;
  font-size: 0.875rem;
}

.clear-button {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background-color: #e5e7eb;
}

/* Upload Progress Styles */
.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-circle-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 2.8;
}

.progress-circle-fill {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 2.8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 500;
  color: #3b82f6;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .drop-zone {
    height: 160px;
  }
  
  .upload-icon svg {
    width: 20px;
    height: 20px;
  }
  
  .primary-text, .secondary-text {
    font-size: 0.8rem;
  }
}
</style>