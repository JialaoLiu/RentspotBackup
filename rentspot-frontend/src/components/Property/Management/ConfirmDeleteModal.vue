<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ property.status === 2 ? 'Confirm Permanent Deletion' : 'Confirm Remove Property' }}</h3>
        <button class="modal-close" @click="$emit('cancel')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="warning-icon">
          <RemoveIcon v-if="property.status === 2" />
          <WarningIcon v-else />
        </div>
        <p class="warning-text">Are you sure you want to {{ property.status === 2 ? 'permanently delete' : 'remove' }} the following property?</p>
        
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
      
      <div class="modal-actions">
        <button @click="$emit('cancel')" class="btn-cancel">
          Cancel
        </button>
        <button @click="$emit('confirm')" class="btn-delete" :class="{ 'btn-danger': property.status === 2 }">
          {{ property.status === 2 ? 'Permanently Delete' : 'Remove Property' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import SVG icons
import RemoveIcon from '../../../assets/svg/remove.svg'
import WarningIcon from '../../../assets/svg/Warning.svg'

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
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
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
  color: #1F2937;
  font-weight: 600;
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6B7280;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #F3F4F6;
  color: #374151;
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.warning-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.warning-icon svg {
  width: 48px;
  height: 48px;
}

.warning-text {
  font-size: 1.1rem;
  color: #374151;
  margin: 0 0 24px 0;
  font-weight: 500;
}

.property-preview {
  display: flex;
  background-color: #F9FAFB;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
  border: 1px solid #E5E7EB;
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
  color: #1F2937;
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
  color: #6B7280;
  font-size: 0.875rem;
}

.property-address {
  margin: 0;
  color: #9CA3AF;
  font-size: 0.875rem;
}

.warning-notice {
  background-color: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 8px;
  padding: 16px;
  text-align: left;
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

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-delete {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.btn-cancel {
  background-color: #F3F4F6;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.btn-cancel:hover {
  background-color: #E5E7EB;
}

.btn-delete {
  background-color: #EF4444;
  color: white;
}

.btn-delete:hover {
  background-color: #DC2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-delete.btn-danger {
  background-color: #991B1B;
}

.btn-delete.btn-danger:hover {
  background-color: #7F1D1D;
  box-shadow: 0 4px 16px rgba(153, 27, 27, 0.5);
}

.warning-notice.danger-notice {
  background-color: #FEE2E2;
  border-color: #DC2626;
}

.warning-notice.danger-notice p,
.warning-notice.danger-notice li {
  color: #991B1B;
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
  .btn-delete {
    width: 100%;
  }
}
</style>