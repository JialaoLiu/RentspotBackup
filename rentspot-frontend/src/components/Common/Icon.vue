<template>
  <span 
    class="material-symbols-outlined icon"
    :class="sizeClass"
    :style="{ color: color || undefined }"
  >
    {{ iconName }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: null // null means inherit from parent
  }
})

// Map our icon names to Material Symbols icon names
const iconMap = {
  // Property features
  'bathroom': 'bathtub',
  'bed': 'bed',
  'car': 'directions_car',
  'garage': 'garage',
  'check': 'check',
  'construction': 'construction',
  'house': 'home',
  'ruler': 'straighten',
  
  // Actions
  'edit': 'edit',
  'delete': 'delete',
  'delete-forever': 'delete_forever',
  'refresh': 'refresh',
  'plus': 'add',
  'remove': 'remove',
  
  // UI/Navigation
  'heart': 'favorite',
  'heart-outline': 'favorite_border',
  'share': 'share',
  'location': 'location_on',
  'search': 'search',
  'upload': 'upload',
  'user': 'person',
  
  // Status/Feedback
  'error': 'error',
  'warning': 'warning',
  'home': 'home',
  'key': 'key',
  
  // Navigation arrows
  'arrow-left': 'arrow_back',
  'arrow-right': 'arrow_forward'
}

const iconName = computed(() => {
  const materialIcon = iconMap[props.name]
  if (!materialIcon) {
    console.warn(`Icon "${props.name}" not found in iconMap. Using default home icon.`)
    return 'home'
  }
  return materialIcon
})

const sizeClass = computed(() => {
  const sizes = {
    xs: 'icon-xs',
    sm: 'icon-sm',
    md: 'icon-md',
    lg: 'icon-lg',
    xl: 'icon-xl'
  }
  return sizes[props.size] || 'icon-md'
})
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}

.icon {
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  user-select: none;
  line-height: 1;
}

.icon-xs { 
  font-size: 12px;
  font-variation-settings: 'opsz' 12;
  line-height: 1;
}

.icon-sm { 
  font-size: 16px;
  font-variation-settings: 'opsz' 16;
  line-height: 1;
}

.icon-md { 
  font-size: 24px;
  font-variation-settings: 'opsz' 24;
  line-height: 1;
}

.icon-lg { 
  font-size: 32px;
  font-variation-settings: 'opsz' 32;
  line-height: 1;
}

.icon-xl { 
  font-size: 48px;
  font-variation-settings: 'opsz' 48;
  line-height: 1;
}
</style>