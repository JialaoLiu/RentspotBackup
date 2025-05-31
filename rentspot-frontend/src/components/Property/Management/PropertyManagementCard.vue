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
        <span>{{ property.bedrooms }} bed</span>
        <span>•</span>
        <span>{{ property.bathrooms }} bath</span>
      </div>
      
      <div class="management-footer">
        <span class="card-price">${{ property.price }}<span class="per-week">/week</span></span>
        <div class="action-buttons">
          <button class="edit-btn" @click="$emit('edit', property)" title="Edit Property">
            <EditIcon class="icon" /> Edit
          </button>
          <button class="delete-btn" @click="$emit('delete', property)" :title="property.status === 2 ? 'Permanently Delete Property' : 'Remove Property'">
            <RemoveIcon class="icon" /> {{ property.status === 2 ? 'Delete' : 'Remove' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import SVG icons
import EditIcon from '../../../assets/svg/Edit.svg'
import RemoveIcon from '../../../assets/svg/remove.svg'

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
defineEmits(['edit', 'delete'])

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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  background-color: white;
  transition: all 0.2s ease;
  border: 1px solid #E5E7EB;
}

.management-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-color: #374151;
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
  color: #1F2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-address {
  color: #4B5563;
  font-size: 0.875rem;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-features {
  display: flex;
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 12px;
  gap: 6px;
}

.management-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.card-price {
  font-weight: 700;
  color: #4B5563;
}

.per-week {
  font-size: 0.9rem;
  font-weight: 400;
  color: #6B7280;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
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

.delete-btn {
  background-color: #EF4444;
  color: white;
}

.delete-btn:hover {
  background-color: #DC2626;
}

.icon {
  width: 16px;
  height: 16px;
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