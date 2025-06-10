<template>
  <div class="property-form-overlay" @click.self="$emit('cancel')">
    <div class="property-form-container">
      <div class="form-header">
        <h2>{{ mode === 'add' ? 'Add Property' : 'Edit Property' }}</h2>
        <button class="modal-close" @click="$emit('cancel')">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="property-form">
        <!-- Basic Information -->
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <div class="form-group">
            <label for="title">Property Title *</label>
            <input 
              type="text" 
              id="title" 
              v-model="form.title" 
              placeholder="e.g., Modern 2-bedroom apartment in city center" 
              required 
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="price">Rent (per week) *</label>
              <input 
                type="number" 
                id="price" 
                v-model.number="form.price" 
                placeholder="e.g., 500" 
                min="0" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="type">Property Type *</label>
              <select id="type" v-model.number="form.type" required>
                <option value="0">House</option>
                <option value="1">Apartment</option>
                <option value="2">Townhouse</option>
                <option value="3">Villa</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Room Configuration -->
        <div class="form-section">
          <h3>Room Configuration</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="bedrooms">Number of Bedrooms *</label>
              <input 
                type="number" 
                id="bedrooms" 
                v-model.number="form.bedrooms" 
                min="0" 
                max="10" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="bathrooms">Number of Bathrooms *</label>
              <input 
                type="number" 
                id="bathrooms" 
                v-model.number="form.bathrooms" 
                min="0" 
                max="10" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="garages">Number of Garages</label>
              <input 
                type="number" 
                id="garages" 
                v-model.number="form.garages" 
                min="0" 
                max="5" 
              />
            </div>
          </div>
        </div>

        <!-- Facilities -->
        <div class="form-section">
          <h3>Facilities</h3>
          
          <div class="form-row">
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="form.aircon" />
                <span>Air Conditioning</span>
              </label>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="form.balcony" />
                <span>Balcony</span>
              </label>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="form.petsConsidered" />
                <span>Pets Allowed</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="furnished">Furnished Status</label>
            <select id="furnished" v-model.number="form.furnished">
              <option value="0">Furnished</option>
              <option value="1">Unfurnished</option>
              <option value="2">Partially Furnished</option>
            </select>
          </div>
        </div>

        <!-- Location Information -->
        <div class="form-section">
          <h3>Location Information</h3>
          
          <!-- Hidden coordinate inputs for form validation -->
          <input type="hidden" v-model.number="form.lat" required />
          <input type="hidden" v-model.number="form.lng" required />
          <input type="hidden" v-model="form.address" required />
          
          <!-- Display detected address -->
          <div v-if="form.address" class="detected-address">
            <p><strong>Detected Address:</strong> {{ form.address }}</p>
          </div>
          
          <div class="map-container">
            <div class="map-instructions">
              <p>Pan and zoom the map to position the marker at your desired location</p>
            </div>
            <div class="map-wrapper">
              <div ref="mapContainer" class="map-display"></div>
              <div class="center-marker">
                <div class="marker-pin"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Image Upload -->
        <div class="form-section">
          <h3>Property Images</h3>
          <div class="form-group">
            <MultipleImageUploader 
              @files-selected="handleFilesSelected" 
              @clear="removeAllImages"
              :uploading="imageUploading"
              :upload-progress="uploadProgress"
              :model-value="form.images"
              ref="imageUploader"
            />
            <!-- Show uploaded image URLs for debugging -->
            <div v-if="form.images && form.images.length > 0 && !imageUploading" class="image-urls-info">
              <small>{{ form.images.length }} image(s) selected</small>
            </div>
          </div>
        </div>
        
        <!-- Form Action Buttons -->
        <div class="form-actions">
          <button type="button" @click="$emit('cancel')" class="btn-secondary" :disabled="loading">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Submitting...' : (mode === 'add' ? 'Create Property' : 'Save Changes') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import MultipleImageUploader from '../../MultipleImageUploader.vue'
import { uploadMultiplePropertyImages, createProperty, updateProperty } from '../../../services/propertyService'
import { useNotification } from '../../../composables/useNotification'

// Props
const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: value => ['add', 'edit'].includes(value)
  },
  property: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits(['cancel', 'success'])

// Composables
const toast = useNotification()

// Reactive data
const loading = ref(false)
const imageUploading = ref(false)
const uploadProgress = ref(0)
const mapContainer = ref(null)
const imageUploader = ref(null)
const pendingImageFiles = ref([])
let map = null
const form = ref({
  title: '',
  price: 0,
  bedrooms: 1,
  bathrooms: 1,
  garages: 0,
  type: 1, // Default to Apartment
  aircon: false,
  balcony: false,
  petsConsidered: false,
  furnished: 1, // Default to Unfurnished
  lat: null,
  lng: null,
  address: '',
  images: []
})

// form validation handled by HTML5 required attributes

// Watch for property changes (edit mode)
watch(() => props.property, (newProperty) => {
  console.log('Property watcher triggered with:', newProperty); // debug watcher
  if (newProperty && props.mode === 'edit') {
    populateForm(newProperty)
  }
}, { immediate: true })

// form and map initialization
onMounted(() => {
  console.log('PropertyForm mounted in mode:', props.mode, 'with property:', props.property); // track form usage
  
  if (props.mode === 'edit' && props.property) {
    populateForm(props.property);
  } else {
    // default coordinates for new properties (Adelaide CBD)
    form.value.lat = -34.9285;
    form.value.lng = 138.6007;
    // get initial address for default coordinates
    updateAddressFromCoordinates(-34.9285, 138.6007);
  }
  
  // Initialize map automatically
  // FIXME: this timeout is hacky but... DOM timing issues are annoying...
  setTimeout(() => {
    initMap();
  }, 100);
});

// populate form with property data - this function is getting long but works for now
function populateForm(property) {
  // form population logic - should be refactored into smaller functions
  
  console.log('Populating form with property:', property); // debug property data
  console.log('Property coordinates:', property.lat, property.lng); // debug coordinates
  
  form.value = {
    title: property.title || '',
    price: property.price || 0,
    bedrooms: property.bedrooms || 1,
    bathrooms: property.bathrooms || 1,
    garages: property.garages || 0,
    type: property.type || 1,
    aircon: Boolean(property.aircon),
    balcony: Boolean(property.balcony),
    petsConsidered: Boolean(property.petsConsidered),
    furnished: property.furnished || 1,
    lat: parseFloat(property.lat) || -34.9285,  // default to Adelaide if no coords
    lng: parseFloat(property.lng) || 138.6007,
    address: property.address || '',
    images: (property.images || []).map(url => ({ url }))
  };
  
  console.log('Form coordinates after populate:', form.value.lat, form.value.lng); // debug form data
  // NOTE: make sure to update this when API changes
}

// handle file selection for property images
const handleFilesSelected = async (files) => {
  if (!files || files.length === 0) return;
  
  // console.log('Files selected for upload:', files.length); // track file selection
  
  // edit mode - upload immediately
  if (props.mode === 'edit' && props.property?.id) {
    await uploadImagesForProperty(files, props.property.id);
  } else {
    // add mode - store files for later upload
    pendingImageFiles.value = files;
    form.value.images = files.map(file => ({ 
      url: URL.createObjectURL(file), 
      isPending: true,
      file: file
    }));
    toast.info(`${files.length} image(s) selected. Will upload after property creation.`);
    // TODO: need to show preview thumbnails of selected images!
  }
};

async function uploadImagesForProperty(files, propertyId) {
  imageUploading.value = true
  uploadProgress.value = 0
  
  try {
    // Update upload progress info
    if (imageUploader.value) {
      imageUploader.value.updateUploadProgress(0, files.length)
    }
    
    // Simulate progress (since we can't track actual upload progress with current setup)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)
    
    // Upload to Cloudinary via backend
    const response = await uploadMultiplePropertyImages(files, propertyId)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // Set the image URLs from response
    form.value.images = response.images.map(img => ({ url: img.url }))
    toast.success(`${files.length} image(s) uploaded successfully`)
    
    // Reset progress after a short delay
    setTimeout(() => {
      uploadProgress.value = 0
    }, 500)
  } catch (error) {
    // Upload failed
    toast.error('Failed to upload images: ' + (error.response?.data?.message || error.message))
  } finally {
    imageUploading.value = false
  }
}

function removeAllImages() {
  form.value.images = []
}


function initMap() {
  if (!mapContainer.value || !window.google || !window.google.maps) {
    // If Google Maps isn't ready, try again after a short delay
    setTimeout(() => {
      initMap()
    }, 500)
    return
  }
  
  console.log('Initializing map with form coordinates:', form.value.lat, form.value.lng); // debug map init
  
  // Initialize map with current coordinates or default Adelaide location
  const initialPosition = {
    lat: (typeof form.value.lat === 'number' && !isNaN(form.value.lat)) ? form.value.lat : -34.9285,
    lng: (typeof form.value.lng === 'number' && !isNaN(form.value.lng)) ? form.value.lng : 138.6007
  };
  
  console.log('Map initial position:', initialPosition); // debug initial position
  
  map = new google.maps.Map(mapContainer.value, {
    center: initialPosition,
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  })
  
  // Set initial coordinates immediately after map creation
  setTimeout(() => {
    updateCoordinatesFromCenter()
  }, 100)
  
  // Add listener for when map center changes (pan/zoom)
  map.addListener('center_changed', () => {
    updateCoordinatesFromCenter()
  })
  
  // Add listener for when map bounds change (zoom)
  map.addListener('bounds_changed', () => {
    updateCoordinatesFromCenter()
  })
}

function updateCoordinatesFromCenter() {
  if (!map) return
  
  const center = map.getCenter()
  if (center) {
    // Update form coordinates to current map center
    const lat = parseFloat(center.lat().toFixed(6))
    const lng = parseFloat(center.lng().toFixed(6))
    
    // update coordinates
    form.value.lat = lat
    form.value.lng = lng
    
    // Update address via reverse geocoding
    updateAddressFromCoordinates(lat, lng)
  }
}

// Google Maps reverse geocoding function
function updateAddressFromCoordinates(lat, lng) {
  if (!window.google || !window.google.maps) {
    // Maps unavailable
    return
  }
  
  // basic check
  if (!lat || !lng) return
  
  const geocoder = new google.maps.Geocoder()
  const latlng = { lat: lat, lng: lng }
  
  geocoder.geocode({ location: latlng }, (results, status) => {
    if (status === 'OK' && results && results.length > 0) {
      // Find the most relevant result with suburb and postcode
      const result = results.find(r => 
        r.types.includes('locality') || 
        r.types.includes('sublocality') ||
        r.types.includes('political')
      ) || results[0]
      
      // Extract suburb and postcode
      let suburb = ''
      let postcode = ''
      
      result.address_components.forEach(component => {
        if (component.types.includes('locality') || component.types.includes('sublocality')) {
          suburb = component.long_name
        }
        if (component.types.includes('postal_code')) {
          postcode = component.long_name
        }
      })
      
      // Format address as "Suburb Postcode"
      if (suburb && postcode) {
        form.value.address = `${suburb} ${postcode}`
      } else if (suburb) {
        form.value.address = suburb
      } else {
        // Fallback to formatted address parts
        const addressParts = result.formatted_address.split(', ')
        form.value.address = addressParts.slice(0, 2).join(' ').trim()
      }
      
      // Address updated
    } else {
      // Geocoder failed
      form.value.address = 'Address not found'
    }
  })
}


async function handleSubmit() {
  loading.value = true

  try {
    // Prepare form data (without images for backend)
    const formData = {
      title: form.value.title,
      price: form.value.price,
      bedrooms: form.value.bedrooms,
      bathrooms: form.value.bathrooms,
      garages: form.value.garages,
      type: form.value.type,
      aircon: form.value.aircon ? 1 : 0,
      balcony: form.value.balcony ? 1 : 0,
      petsConsidered: form.value.petsConsidered ? 1 : 0,
      furnished: form.value.furnished,
      lat: form.value.lat,
      lng: form.value.lng,
      address: form.value.address
    }

    let propertyId = null

    if (props.mode === 'add') {
      const response = await createProperty(formData)
      propertyId = response.propertyId
      toast.success('Property created successfully!')
      
      // Upload pending images if any
      if (pendingImageFiles.value && pendingImageFiles.value.length > 0) {
        toast.info('Uploading images...')
        await uploadImagesForProperty(pendingImageFiles.value, propertyId)
      }
    } else {
      await updateProperty(props.property.id, formData)
      toast.success('Property updated successfully!')
    }

    // Reset loading state
    loading.value = false
    
    // Small delay to ensure notification shows before closing
    setTimeout(() => {
      // Emit success event to close the form
      emit('success')
    }, 500)
  } catch (error) {
    // Operation failed
    toast.error(
      error.response?.data?.message || 'Operation failed, please try again'
    )
  } finally {
    // Only reset loading if there was an error
    if (loading.value) {
      loading.value = false
    }
  }
}
</script>

<style scoped>
.property-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.property-form-container {
  background: var(--color-bg-primary);
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  border-radius: 12px 12px 0 0;
}

.form-header h2 {
  margin: 0;
  color: var(--color-dark);
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-medium);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-dark);
}

.property-form {
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h3 {
  margin: 0 0 16px 0;
  color: var(--color-dark);
  font-weight: 600;
  font-size: 18px;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: var(--color-dark);
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border-dark);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color var(--transition-fast);
  background-color: var(--color-bg-primary);
  color: var(--color-dark);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.form-hint {
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.form-hint p {
  margin: 0;
  color: var(--color-primary);
  font-size: 14px;
}

.form-hint a {
  color: var(--color-primary-hover);
  text-decoration: none;
}

.form-hint a:hover {
  text-decoration: underline;
}

.image-preview {
  margin-top: 16px;
  text-align: center;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 6px;
  border: 1px solid var(--color-border-dark);
}

.remove-image-btn {
  display: block;
  margin: 8px auto 0;
  background-color: var(--color-danger);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.remove-image-btn:hover {
  background-color: var(--color-danger-hover);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
  margin-top: 32px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  background-color: var(--color-light);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-dark);
  border: 1px solid var(--color-border-dark);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-border);
}

/* Responsive design */
@media (max-width: 768px) {
  .property-form-container {
    width: 95%;
    margin: 20px;
  }
  
  .form-header {
    padding: 16px;
  }
  
  .property-form {
    padding: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

.image-urls-info {
  margin-top: 8px;
  padding: 8px;
  background-color: var(--color-bg-secondary);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-medium);
  text-align: center;
}

/* Map container styles */
.map-container {
  border: 1px solid var(--color-border-dark);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--color-bg-secondary);
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
}

.map-instructions {
  padding: 12px;
  background-color: var(--color-primary-light);
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}

.map-instructions p {
  margin: 0;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
}

.location-warning {
  color: var(--color-danger) !important;
  font-weight: 600 !important;
  margin-top: 4px !important;
}

.map-display {
  width: 100%;
  height: 100%;
  background-color: var(--color-border);
}

/* Center marker styles */
.center-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}

.marker-pin {
  width: 20px;
  height: 20px;
  background-color: var(--color-primary);
  border: 3px solid var(--color-bg-primary);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
}

.marker-pin::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background-color: var(--color-primary-hover);
  border-radius: 50%;
}

/* Responsive adjustments for map */
@media (max-width: 768px) {
  .map-wrapper {
    height: 250px;
  }
}

/* Detected address styles */
.detected-address {
  margin-bottom: 16px;
  padding: 12px;
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.detected-address p {
  margin: 0;
  color: var(--color-primary);
  font-size: 14px;
}
</style>