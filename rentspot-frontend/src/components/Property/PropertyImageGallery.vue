<template>
  <div class="property-image-gallery">
    <h3>Property Images</h3>
    
    <!-- Image upload section -->
    <div class="image-upload-section" v-if="editable">
      <div class="upload-container">
        <input 
          type="file" 
          ref="fileInput" 
          multiple 
          accept="image/*" 
          @change="handleFileSelection"
          class="file-input"
        />
        <button @click="triggerFileInput" class="upload-btn">
          <span class="icon">+</span> Add Images
        </button>
      </div>
      
      <div v-if="uploadingImages" class="uploading-message">
        Uploading images...
      </div>
      
      <div v-if="selectedFiles.length > 0" class="selected-files">
        <p>Selected {{ selectedFiles.length }} files</p>
        <button @click="uploadImages" class="upload-selected-btn" :disabled="uploadingImages">
          Upload Selected Images
        </button>
      </div>
    </div>
    
    <!-- Images grid -->
    <div v-if="loading" class="loading-container">
      Loading images...
    </div>
    
    <div v-else-if="images.length === 0" class="no-images">
      <p>No images available</p>
    </div>
    
    <div v-else class="images-grid">
      <div 
        v-for="image in images" 
        :key="image.id" 
        class="image-item"
        :class="{ 'primary': image.isPrimary }"
      >
        <img :src="image.url" :alt="propertyTitle" @click="showFullImage(image)" />
        
        <div v-if="editable" class="image-actions">
          <button 
            v-if="!image.isPrimary" 
            @click="setAsPrimary(image)" 
            class="set-primary-btn"
            title="Set as primary image"
          >
            Set as Main
          </button>
          <button 
            @click="deleteImage(image)" 
            class="delete-btn"
            title="Delete image"
          >
            Delete
          </button>
        </div>
        
        <div v-if="image.isPrimary" class="primary-badge">
          Main Photo
        </div>
      </div>
    </div>
    
    <!-- Full image modal -->
    <div v-if="fullImageVisible" class="full-image-modal" @click="hideFullImage">
      <div class="modal-content" @click.stop>
        <span class="close-btn" @click="hideFullImage">&times;</span>
        <img :src="fullImage.url" :alt="propertyTitle" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import propertyService from '@/services/propertyService';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'PropertyImageGallery',
  props: {
    propertyId: {
      type: [Number, String],
      required: true
    },
    propertyTitle: {
      type: String,
      default: 'Property'
    },
    editable: {
      type: Boolean,
      default: false
    },
    initialImages: {
      type: Array,
      default: () => []
    }
  },
  
  setup(props, { emit }) {
    const { showNotification } = useNotification();
    
    const images = ref(props.initialImages || []);
    const loading = ref(true);
    const fileInput = ref(null);
    const selectedFiles = ref([]);
    const uploadingImages = ref(false);
    const fullImageVisible = ref(false);
    const fullImage = ref(null);
    
    // Update images when prop changes
    watch(() => props.initialImages, (newVal) => {
      if (newVal && newVal.length > 0) {
        images.value = newVal;
        loading.value = false;
      }
    });
    
    // Load images on mount
    onMounted(async () => {
      if (props.initialImages && props.initialImages.length > 0) {
        images.value = props.initialImages;
        loading.value = false;
        return;
      }
      
      try {
        loading.value = true;
        const propertyImages = await propertyService.getPropertyImages(props.propertyId);
        images.value = propertyImages;
      } catch (error) {
        console.error('Failed to load images:', error);
        showNotification('Failed to load property images', 'error');
      } finally {
        loading.value = false;
      }
    });
    
    const triggerFileInput = () => {
      fileInput.value.click();
    };
    
    const handleFileSelection = (event) => {
      const files = Array.from(event.target.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        showNotification('Please select valid image files', 'error');
        return;
      }
      
      selectedFiles.value = imageFiles;
    };
    
    const uploadImages = async () => {
      if (selectedFiles.value.length === 0) return;
      
      try {
        uploadingImages.value = true;
        const result = await propertyService.addImagesToProperty(
          props.propertyId, 
          selectedFiles.value
        );
        
        if (result.images) {
          images.value = [...images.value, ...result.images];
          showNotification('Images uploaded successfully', 'success');
          emit('images-updated', images.value);
        }
        
        selectedFiles.value = [];
        fileInput.value.value = null;
      } catch (error) {
        console.error('Failed to upload images:', error);
        showNotification('Failed to upload images', 'error');
      } finally {
        uploadingImages.value = false;
      }
    };
    
    const setAsPrimary = async (image) => {
      try {
        await propertyService.setPrimaryImage(props.propertyId, image.id);
        
        images.value = images.value.map(img => ({
          ...img,
          isPrimary: img.id === image.id
        }));
        
        showNotification('Primary image updated', 'success');
        emit('primary-image-changed', image);
      } catch (error) {
        console.error('Failed to set primary image:', error);
        showNotification('Failed to set primary image', 'error');
      }
    };
    
    const deleteImage = async (image) => {
      if (!confirm('Are you sure you want to delete this image?')) return;
      
      try {
        await propertyService.deletePropertyImage(props.propertyId, image.id);
        images.value = images.value.filter(img => img.id !== image.id);
        showNotification('Image deleted successfully', 'success');
        emit('images-updated', images.value);
      } catch (error) {
        console.error('Failed to delete image:', error);
        showNotification('Failed to delete image', 'error');
      }
    };
    
    const showFullImage = (image) => {
      fullImage.value = image;
      fullImageVisible.value = true;
    };
    
    const hideFullImage = () => {
      fullImageVisible.value = false;
    };
    
    return {
      images,
      loading,
      fileInput,
      selectedFiles,
      uploadingImages,
      fullImageVisible,
      fullImage,
      triggerFileInput,
      handleFileSelection,
      uploadImages,
      setAsPrimary,
      deleteImage,
      showFullImage,
      hideFullImage
    };
  }
};
</script>

<style scoped>
.property-image-gallery {
  margin: 20px 0;
}

.image-upload-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.upload-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.file-input {
  display: none;
}

.upload-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.upload-btn .icon {
  margin-right: 5px;
  font-size: 16px;
}

.selected-files {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.upload-selected-btn {
  padding: 6px 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-selected-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading-container {
  text-align: center;
  padding: 20px;
  color: #666;
}

.no-images {
  text-align: center;
  padding: 20px;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.image-item {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.image-item img:hover {
  transform: scale(1.05);
}

.image-item.primary {
  border: 2px solid #4CAF50;
}

.primary-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #4CAF50;
  color: white;
  padding: 3px 8px;
  border-radius: 2px;
  font-size: 0.8rem;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: rgba(0,0,0,0.7);
  padding: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.set-primary-btn, .delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.8rem;
}

.set-primary-btn {
  background-color: #2196F3;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.full-image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-width: 90%;
  max-height: 90vh;
  position: relative;
}

.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 30px;
  cursor: pointer;
}
</style>