<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSound } from '../../composables/useSound.js'

const props = defineProps({
  items: {
    type: Array,
    required: true
    // Expected format: [{ label: 'Action', icon: '📁', action: 'load' }, ...]
  },
  position: {
    type: String,
    default: 'bottom-right' // bottom-left, bottom-right, top-left, top-right
  }
})

const emit = defineEmits(['action'])

// Use sound composable
const { playSoftClick } = useSound()

const isOpen = ref(false)
const dropdownRef = ref(null)

// Toggle dropdown
const toggle = () => {
  playSoftClick()
  isOpen.value = !isOpen.value
}

// Close dropdown
const close = () => {
  isOpen.value = false
}

// Handle item click
const handleItemClick = (item) => {
  emit('action', item.action, item)
  close()
}

// Click outside to close
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    close()
  }
}

// Escape key to close
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div ref="dropdownRef" class="dropdown">
    <button 
      class="dropdown-toggle"
      @click="toggle"
      :class="{ active: isOpen }"
      type="button"
    >
      ⋯
    </button>
    
    <div 
      v-if="isOpen"
      class="dropdown-menu"
      :class="`position-${position}`"
    >
      <button
        v-for="item in items"
        :key="item.action"
        class="dropdown-item"
        @click="handleItemClick(item)"
        type="button"
      >
        <span class="dropdown-icon">{{ item.icon }}</span>
        <span class="dropdown-label">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<style>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(139, 129, 165, 0.3);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--font-size-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-swatch);
}

.dropdown-toggle:hover,
.dropdown-toggle.active {
  background: rgba(188, 179, 222, 0.2);
  border-color: rgba(139, 129, 165, 0.5);
  color: var(--color-text-primary);
  transform: scale(1.05);
}

.dropdown-menu {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 1px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-grid-cell-hover);
  min-width: 120px;
  padding: 4px 0;
}

/* Position variants */
.dropdown-menu.position-bottom-right {
  top: 100%;
  right: 0;
  margin-top: 4px;
}

.dropdown-menu.position-bottom-left {
  top: 100%;
  left: 0;
  margin-top: 4px;
}

.dropdown-menu.position-top-right {
  bottom: 100%;
  right: 0;
  margin-bottom: 4px;
}

.dropdown-menu.position-top-left {
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(188, 179, 222, 0.1);
}

.dropdown-item:first-child {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.dropdown-icon {
  margin-right: 8px;
  font-size: var(--font-size-s);
}

.dropdown-label {
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  text-align: left;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .dropdown-toggle {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-base);
  }
  
  .dropdown-menu {
    min-width: 140px;
  }
  
  .dropdown-item {
    padding: 12px 16px;
    font-size: var(--font-size-base);
  }
}
</style>