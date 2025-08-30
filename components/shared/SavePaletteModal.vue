<script setup>
import { ref, watch } from 'vue'
import Modal from './Modal.vue'
import MiniPalette from './MiniPalette.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  canSave: {
    type: Boolean,
    default: false
  },
  savedPaletteData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'view-saved-palettes', 'load-palette'])

const paletteTitle = ref('')
const showSuccessMessage = ref(false)

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

// Handle palette actions from MiniPalette
const handlePaletteAction = (action, paletteData) => {
  if (action === 'load') {
    // Emit to parent to load palette
    emit('load-palette', paletteData)
    // Close the modal
    emit('update:modelValue', false)
  }
}

// Reset success message when modal closes
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    showSuccessMessage.value = false
  }
})
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :dialog="true">
    <h2>Save Palette</h2>
    <div v-if="!showSuccessMessage">
      <div class="form-field">
        <label for="palette-title">Palette Title</label>
        <input 
          id="palette-title"
          v-model="paletteTitle"
          type="text" 
          placeholder="Enter palette name"
          class="form-input"
        />
      </div>
      <div class="dialog-actions">
        <button 
          @click="handleSavePalette"
          :disabled="!paletteTitle.trim() || !canSave"
          class="btn btn-compact btn-gradient-green"
          :class="{ 'btn-disabled': !paletteTitle.trim() || !canSave }"
        >
          Save Palette
        </button>
      </div>
    </div>
    <div v-if="showSuccessMessage">
      <div v-if="savedPaletteData" class="saved-palette-preview">
        <MiniPalette 
          :palette-data="savedPaletteData" 
          :size="120" 
          :show-delete="false"
          @palette-action="handlePaletteAction"
        />
      </div>
      <div v-if="showSuccessMessage" class="success-message">
        <p>
          ✅ Success! Palette saved.
        </p>
      </div>
      <div class="dialog-actions">
        <a 
          v-if="showSuccessMessage"
          @click="openSavedPalettes"
          class="palette-link"
          href="#"
        >
          View Saved Palettes
        </a>
        <button 
          @click="$emit('update:modelValue', false)"
          class="btn btn-compact btn-gradient-gray"
        >
          Back to Palette Maker
        </button>
      </div>
    </div>
  </Modal>
</template>

<style>
/* Saved palette preview */
.saved-palette-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  border: 1px solid rgba(139, 129, 165, 0.2);
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

.success-message p {
  margin-bottom: 0;
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

.dialog-actions {
  display: flex; 
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.palette-link {
  color: var(--color-text-primary);
  text-decoration: underline;
  cursor: pointer;
  font-size: var(--font-size-md);
  transition: color 0.2s ease;
}

.palette-link:hover {
  color: rgba(106, 90, 205, 0.8);
}

</style>