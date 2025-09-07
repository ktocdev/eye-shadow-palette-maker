<script setup>
import { ref } from 'vue'
import Modal from '../ui/Modal.vue'
import BaseButton from '../ui/BaseButton.vue'
import { useSound } from '../../composables/utils/useSound.js'

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
      <BaseButton
        @click="handleSavePalette"
        :disabled="!paletteTitle.trim() || !canSave"
        variant="green"
        size="compact"
      >
        Save Palette
      </BaseButton>
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
  background: var(--color-white-overlay-strong);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent-50);
  box-shadow: 0 0 0 3px var(--color-accent-10);
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