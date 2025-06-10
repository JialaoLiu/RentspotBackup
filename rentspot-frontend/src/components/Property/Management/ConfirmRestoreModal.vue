<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Confirm Restore Property</h3>
        <button class="modal-close" @click="$emit('cancel')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="success-icon">
          <Icon name="refresh" size="xl" color="#10B981" />
        </div>
        <p class="restore-text">Are you sure you want to restore the following property?</p>
        
        <div class="property-preview">
          <img :src="property.image" :alt="property.title" @error="handleImageError" />
          <div class="property-info">
            <h4>{{ property.title }}</h4>
            <p class="property-price">${{ property.price }}/week</p>
            <p class="property-details">
              {{ property.bedrooms }} bed • {{ property.bathrooms }} bath
            </p>
            <p class="property-address">{{ property.address || `Adelaide SA ${property.id}` }}</p>
          </div>
        </div>
        
        <div class="restore-notice">
          <p><strong>Note:</strong> This action will:</p>
          <ul>
            <li>Change the property status to "Available"</li>
            <li>Make the property visible to tenants again</li>
            <li>Allow the property to be rented</li>
          </ul>
        </div>
      </div>
      
      <div class="modal-actions">
        <button @click="$emit('cancel')" class="btn-cancel">
          Cancel
        </button>
        <button @click="$emit('confirm')" class="btn-restore">
          Restore Property
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-container {
  background: var(--surface-elevated);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: modalEnter 0.3s ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.success-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.restore-text {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin: 0 0 24px 0;
  font-weight: 500;
}

.property-preview {
  display: flex;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
  border: 1px solid var(--border-primary);
}

.property-preview img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
  flex-shrink: 0;
}

.property-info h4 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
}

.property-price {
  margin: 0 0 4px 0;
  color: #059669;
  font-weight: 700;
  font-size: 1rem;
}

.property-details {
  margin: 0 0 4px 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.property-address {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.restore-notice {
  background-color: #D1FAE5;
  border: 1px solid #10B981;
  border-radius: 8px;
  padding: 16px;
  text-align: left;
}

.restore-notice p {
  margin: 0 0 12px 0;
  color: #065F46;
  font-weight: 500;
}

.restore-notice ul {
  margin: 0;
  padding-left: 20px;
  color: #065F46;
}

.restore-notice li {
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-restore {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.btn-cancel {
  background-color: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
}

.btn-cancel:hover {
  background-color: var(--border-primary);
}

.btn-restore {
  background-color: #10B981;
  color: white;
}

.btn-restore:hover {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header,
  .modal-body,
  .modal-actions {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .property-preview {
    flex-direction: column;
    text-align: center;
  }
  
  .property-preview img {
    width: 100%;
    height: 120px;
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-restore {
    width: 100%;
  }
}
</style>