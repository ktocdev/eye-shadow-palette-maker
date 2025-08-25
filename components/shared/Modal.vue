<script setup>
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  dialog: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const closeModal = () => {
  emit('update:modelValue', false)
}

const handleEscapeKey = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    closeModal()
  }
}

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})

// Prevent body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" :class="{ 'modal-dialog': dialog }">
        <div class="modal-content">
          <button class="modal-close" @click="closeModal" aria-label="Close modal">
            ×
          </button>
          <div class="modal-inner-content">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
/* Mobile first base styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
}

.modal-container {
  width: 100%;
  height: 100%;
  max-width: calc(100% - 16px);
  max-height: 95vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-content {
  width: 100%;
  height: 100%;
  background: var(--gradient-container-primary);
  border-radius: var(--radius-container-large);
  box-shadow: var(--shadow-palette-container);
  border: var(--border-container);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 28px;
  right: 28px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.2);
}

.modal-inner-content {
  padding: 20px;
  background: var(--gradient-container-secondary);
  border-radius: var(--radius-container-large);
  box-shadow: var(--shadow-grid-inner);
  border: var(--border-container-light);
  margin: 10px;
  flex: 1;
  overflow-y: auto;
}

.modal-inner-content h2 {
  margin-bottom: 24px;
  color: var(--color-text-primary);
}

.modal-inner-content p {
  margin-bottom: 12px;
}

/* Dialog variant - mobile first */
.modal-dialog {
  max-width: calc(100% - 16px);
  max-height: none;
  height: auto;
}

/* Tablet and up */
@media (min-width: 481px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-container {
    max-width: 700px;
    max-height: 85vh;
  }
  
  .modal-close {
    top: 32px;
    right: 32px;
    width: 32px;
    height: 32px;
    font-size: 24px;
  }
  
  .modal-inner-content {
    padding: 30px;
    margin: 18px;
  }
  
  .modal-dialog {
    max-width: 600px;
  }
}

/* Desktop and up */
@media (min-width: 1200px) {
  .modal-container {
    max-width: 1000px;
    max-height: 90vh;
  }
  
  .modal-content {
    box-shadow: var(--shadow-grid-container-desktop);
  }
  
  .modal-close {
    top: 48px;
    right: 48px;
    width: 36px;
    height: 36px;
  }
  
  .modal-inner-content {
    margin: 30px;
  }
  
  .modal-dialog {
    max-width: 600px;
  }
}
</style>