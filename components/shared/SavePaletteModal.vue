<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'
import { useSound } from '../../composables/useSound.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Use sound composable
const { playSubtleClick, playSoftClick } = useSound()

const paletteTitle = ref('')

const handleSavePalette = () => {
  playSoftClick()
  // Emit save event with title and close immediately
  emit('save', paletteTitle.value)
  emit('update:modelValue', false)
  // Clear the title
  paletteTitle.value = ''
}

const handleTitleInputFocus = () => {
  playSoftClick()
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :dialog="true">
    <h2>Save Palette</h2>
    <div class="form-field">
      <label for="palette-title">Palette Title</label>
      <input 
        id="palette-title"
        v-model="paletteTitle"
        type="text" 
        placeholder="Enter palette name"
        class="form-input"
        @focus="handleTitleInputFocus"
      />
    </div>
    <div class="dialog-actions">
      <button 
        @click="handleSavePalette"
        :disabled="!paletteTitle.trim()"
        class="btn btn-compact btn-gradient-green"
        :class="{ 'btn-disabled': !paletteTitle.trim() }"
      >
        Save Palette
      </button>
    </div>
  </Modal>
</template>

<style>
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
</style>