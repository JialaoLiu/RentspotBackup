<template>
  <div class="management-card">
    <div class="card-image-container">
      <img :src="property.image" :alt="property.title" @error="handleImageError">
      <div class="property-status-badge" :class="getStatusClass(property.status)">
        {{ getStatusText(property.status) }}
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="card-title">{{ property.title }}</h3>
      <p class="card-address">{{ property.address || `Adelaide SA ${property.id}` }}</p>
      <div class="card-features">
        <span class="feature-item">
          <Icon name="bed" size="md" />
          {{ property.bedrooms }}
        </span>
        <span class="feature-item">
          <Icon name="bathroom" size="md" />
          {{ property.bathrooms }}
        </span>
        <span v-if="property.garage" class="feature-item">
          <Icon name="car" size="md" />
          {{ property.garage }}
        </span>
      </div>
      
      <div class="management-footer">
        <span class="card-price">${{ property.price }}<span class="per-week">/week</span></span>
        <div class="action-buttons">
          <button v-if="property.status !== 2" class="edit-btn" @click="$emit('edit', property)" title="Edit Property">
            <Icon name="edit" size="md" /> Edit
          </button>
          <button v-else class="restore-btn" @click="$emit('restore', property)" title="Restore Property">
            <Icon name="refresh" size="md" /> Restore
          </button>
          <button class="delete-btn" @click="$emit('delete', property)" :title="property.status === 2 ? 'Permanently Delete Property' : 'Remove Property'">
            <Icon :name="property.status === 2 ? 'delete-forever' : 'remove'" size="md" /> {{ property.status === 2 ? 'Delete' : 'Remove' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import Icon component
import Icon from '../../Common/Icon.vue'


// Props
const props = defineProps({
  property: {
    type: Object,
    required: true
  },
  isRemoved: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits(['edit', 'delete', 'restore'])

// Image error handler
function handleImageError(e) {
  e.target.src = 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747542177/defaultProperty_totbni.png'
}

// Status helpers
function getStatusText(status) {
  const statusMap = {
    0: 'Available',
    1: 'Booked', 
    2: 'Removed'
  }
  return statusMap[status] || 'Unknown'
}

function getStatusClass(status) {
  const classMap = {
    0: 'status-available',
    1: 'status-booked',
    2: 'status-removed'
  }
  return classMap[status] || 'status-unknown'
}
</script>

<style scoped>
.management-card {
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  background-color: var(--surface-elevated);
  transition: all var(--transition-fast);
  border: 1px solid var(--border-primary);
}

.management-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-secondary);
}

.card-image-container {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.card-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.management-card:hover .card-image-container img {
  transform: scale(1.02);
}

.property-status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-available {
  background-color: #10B981;
}

.status-booked {
  background-color: #F59E0B;
}

.status-removed {
  background-color: #EF4444;
}

.status-unknown {
  background-color: #6B7280;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-address {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-features {
  display: flex;
  color: var(--text-secondary);
  font-size: 0.875rem;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.card-features .feature-item {
  display: flex;
  align-items: center;
  gap: 4px;
}


.management-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.card-price {
  font-weight: 700;
  color: var(--text-primary);
}

.per-week {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn, .restore-btn {
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-btn {
  background-color: #3B82F6;
  color: white;
}

.edit-btn:hover {
  background-color: #2563EB;
}

.restore-btn {
  background-color: #10B981;
  color: white;
}

.restore-btn:hover {
  background-color: #059669;
}

.delete-btn {
  background-color: #EF4444;
  color: white;
}

.delete-btn:hover {
  background-color: #DC2626;
}

.action-buttons .icon {
  color: inherit;
}

/* Responsive design */
@media (max-width: 768px) {
  .management-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>