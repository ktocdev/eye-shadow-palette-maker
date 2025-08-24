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
  padding: 16px;
}

.modal-container {
  width: 100%;
  height: 100%;
  max-width: 600px;
  max-height: 80vh;
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
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  font-size: 24px;
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

/* Mobile first - full screen on small devices */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 8px;
  }
  
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-close {
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    font-size: 20px;
  }
}

/* Tablet and up */
@media (min-width: 481px) {
  .modal-container {
    max-width: 700px;
    max-height: 85vh;
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
}

/* Modal inner content styling - matches palette grid inner styling */
.modal-inner-content {
  padding: 30px;
  background: var(--gradient-container-secondary);
  border-radius: var(--radius-container-large);
  box-shadow: var(--shadow-grid-inner);
  border: var(--border-container-light);
  margin: 15px;
  flex: 1;
  overflow-y: auto;
}

.modal-inner-content h2 {
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.modal-inner-content p {
  margin-bottom: 12px;
}

@media (min-width: 481px) {
  .modal-inner-content {
    margin: 18px;
  }
}

@media (min-width: 973px) {
  .modal-inner-content {
    margin: 30px;
  }
}

/* Dialog variant styles */
.modal-dialog {
  max-width: 600px;
  max-height: none;
  height: auto;
}

@media (max-width: 480px) {
  .modal-dialog {
    max-width: calc(100% - 16px);
  }
}

@media (min-width: 481px) {
  .modal-dialog {
    max-width: 600px;
  }
}

@media (min-width: 1200px) {
  .modal-dialog {
    max-width: 600px;
  }
}
</style>