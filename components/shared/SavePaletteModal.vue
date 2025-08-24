<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  canSave: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'view-saved-palettes'])

const paletteTitle = ref('')
const showSuccessMessage = ref(false)

const closeSaveModal = () => {
  emit('update:modelValue', false)
  // Reset success message when modal closes
  showSuccessMessage.value = false
}

const handleEscapeKey = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    closeSaveModal()
  }
}

const handleSavePalette = () => {
  // Emit save event with title
  emit('save', paletteTitle.value)
  // Clear the title and show success message
  paletteTitle.value = ''
  showSuccessMessage.value = true
}

const openSavedPalettes = () => {
  // Close this modal and open saved palettes modal
  emit('update:modelValue', false)
  emit('view-saved-palettes')
  // Reset success message
  showSuccessMessage.value = false
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
    <div v-if="modelValue" class="modal-overlay">
      <div class="modal-container modal-dialog">
        <div class="modal-content">
          <button class="modal-close" @click="closeSaveModal" aria-label="Close modal">
            ×
          </button>
          <div class="modal-inner-content">
            <h2>Save Palette</h2>
            
            <!-- Success message -->
            <div v-if="showSuccessMessage" class="success-message">
              ✅ Success! Palette saved.
            </div>
            
            <!-- Form (hidden after success) -->
            <div v-if="!showSuccessMessage" class="form-field">
              <label for="palette-title">Palette Title</label>
              <input 
                id="palette-title"
                v-model="paletteTitle"
                type="text" 
                placeholder="Enter palette name"
                class="form-input"
              />
            </div>
            
            <!-- Save button (only show before success) -->
            <div v-if="!showSuccessMessage" class="dialog-actions">
              <button 
                @click="handleSavePalette"
                :disabled="!paletteTitle.trim() || !canSave"
                class="btn btn-compact btn-gradient-green"
                :class="{ 'btn-disabled': !paletteTitle.trim() || !canSave }"
              >
                Save Palette
              </button>
            </div>
            
            <!-- Close button (only show after success) -->
            <div v-if="showSuccessMessage" class="dialog-actions">
              <button 
                @click="closeSaveModal"
                class="btn btn-compact btn-gradient-gray"
              >
                Close
              </button>
            </div>
            
            <!-- Link to saved palettes (only show after success) -->
            <div v-if="showSuccessMessage" class="dialog-links">
              <a 
                @click="openSavedPalettes"
                class="palette-link"
                href="#"
              >
                View Saved Palettes
              </a>
            </div>
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

/* Dialog variant styles */
.modal-dialog {
  max-width: 600px;
  max-height: none;
  height: auto;
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 8px;
  }
  
  .modal-dialog {
    max-width: calc(100% - 16px);
  }
  
  .modal-close {
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    font-size: 20px;
  }
  
  .modal-inner-content {
    padding: 20px;
    margin: 10px;
  }
}

@media (min-width: 481px) {
  .modal-inner-content {
    margin: 18px;
  }
}

@media (min-width: 973px) {
  .modal-content {
    box-shadow: var(--shadow-grid-container-desktop);
  }
  
  .modal-inner-content {
    margin: 30px;
  }
}

/* Success message */
.success-message {
  background: rgba(34, 139, 34, 0.1);
  color: #228B22;
  padding: 16px;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: var(--font-weight-semibold);
  margin-bottom: 16px;
  border: 1px solid rgba(34, 139, 34, 0.2);
}

/* Form field styles */
.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: rgba(106, 90, 205, 0.5);
  box-shadow: 0 0 0 3px rgba(106, 90, 205, 0.1);
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

/* Dialog actions and links */
.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.dialog-links {
  margin-top: 16px;
  text-align: center;
}

.palette-link {
  color: var(--color-text-primary);
  text-decoration: underline;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: color 0.2s ease;
}

.palette-link:hover {
  color: rgba(106, 90, 205, 0.8);
}

@media (max-width: 480px) {
  .dialog-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>