<template>
  <div class="modal-overlay-base modal-overlay-high" @click.self="$emit('cancel')">
    <div class="modal-container-base modal-container-narrow modal-enter-animation">
      <div class="modal-header-base">
        <h3>{{ property.status === 2 ? 'Confirm Permanent Deletion' : 'Confirm Remove Property' }}</h3>
        <button class="modal-close-base" @click="$emit('cancel')">&times;</button>
      </div>
      
      <div class="modal-body-base">
        <div class="warning-icon">
          <Icon :name="property.status === 2 ? 'delete-forever' : 'warning'" size="xl" />
        </div>
        <p class="warning-text">Are you sure you want to {{ property.status === 2 ? 'permanently delete' : 'remove' }} the following property?</p>
        
        <div class="property-preview">
          <img class="property-preview-image" :src="property.image" :alt="property.title" @error="handleImageError" />
          <div class="property-preview-info">
            <h4 class="property-preview-title">{{ property.title }}</h4>
            <p class="property-price">${{ property.price }}/week</p>
            <p class="property-preview-details">
              {{ property.bedrooms }} bed • {{ property.bathrooms }} bath
            </p>
            <p class="property-preview-details">{{ property.address || `Adelaide SA ${property.id}` }}</p>
          </div>
        </div>
        
        <div class="warning-notice" :class="{ 'danger-notice': property.status === 2 }">
          <p><strong>{{ property.status === 2 ? 'Warning:' : 'Note:' }}</strong> This action will:</p>
          <ul v-if="property.status === 2">
            <li>Permanently delete this property from the database</li>
            <li>Remove all associated data and history</li>
            <li><strong>This action CANNOT be undone!</strong></li>
          </ul>
          <ul v-else>
            <li>Set the property status to "Removed"</li>
            <li>Hide the property from tenants</li>
            <li>This action can be reversed by administrators</li>
          </ul>
        </div>
      </div>
      
      <div class="modal-footer-base">
        <button @click="$emit('cancel')" class="btn-outline">
          Cancel
        </button>
        <button @click="$emit('confirm')" class="btn btn-danger" :class="{ 'btn-permanent-delete': property.status === 2 }">
          {{ property.status === 2 ? 'Permanently Delete' : 'Remove Property' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import Icon component
import Icon from '../../Common/Icon.vue'


// Props
defineProps({
  property: {
    type: Object,
    required: true
  }
})

// Emits
defineEmits(['cancel', 'confirm'])

// Methods
function handleImageError(e) {
  e.target.src = 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png'
}
</script>

<style scoped>
/* Component-specific styles only - most styles now come from utility classes */

.modal-header-base h3 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.25rem;
}

.modal-body-base {
  text-align: center;
}

.warning-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.warning-text {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  font-weight: 500;
}

/* Property preview uses utility classes but needs price styling */
.property-price {
  margin: 0 0 4px 0;
  color: #059669;
  font-weight: 700;
  font-size: 1rem;
}

/* Warning notice - could be converted to utility classes too */
.warning-notice {
  background-color: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  text-align: left;
  margin-bottom: var(--space-lg);
}

.warning-notice p {
  margin: 0 0 12px 0;
  color: #92400E;
  font-weight: 500;
}

.warning-notice ul {
  margin: 0;
  padding-left: 20px;
  color: #92400E;
}

.warning-notice li {
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.danger-notice {
  background-color: #FEE2E2;
  border-color: #DC2626;
}

.danger-notice p,
.danger-notice li {
  color: #991B1B;
}

/* Enhanced danger button for permanent delete */
.btn-permanent-delete {
  background-color: #991B1B !important;
}

.btn-permanent-delete:hover {
  background-color: #7F1D1D !important;
  box-shadow: 0 4px 16px rgba(153, 27, 27, 0.5) !important;
}

/* Responsive design - utility classes handle most responsive behavior */
@media (max-width: 768px) {
  .property-preview {
    flex-direction: column;
    text-align: center;
  }
  
  .property-preview-image {
    width: 100% !important;
    height: 120px !important;
    margin-right: 0 !important;
    margin-bottom: 12px;
  }
  
  .modal-footer-base {
    flex-direction: column;
  }
  
  .modal-footer-base button {
    width: 100%;
  }
}
</style>