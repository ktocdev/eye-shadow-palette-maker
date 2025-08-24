<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'

const props = defineProps({
  canSave: {
    type: Boolean,
    default: false
  }
})

defineEmits(['clear', 'randomize', 'save'])

const isModalOpen = ref(false)
const isDialogOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
}

const openDialog = () => {
  isDialogOpen.value = true
}

const paletteTitle = ref('')
</script>

<template>
  <div class="palette-controls">
    <button @click="$emit('randomize')" class="btn btn-compact btn-gradient-purple">
      Random Palette
    </button>
    <button @click="$emit('clear')" class="btn btn-compact btn-gradient-red">
      Clear Palette
    </button>
    <button 
      @click="$emit('save')" 
      :disabled="!canSave"
      class="btn btn-compact btn-gradient-green"
      :class="{ 'btn-disabled': !canSave }"
    >
      Save Palette
    </button>
    <button @click="openDialog" class="btn btn-compact btn-gradient-purple">
      Open Dialog
    </button>
    <button @click="openModal" class="btn btn-compact btn-gradient-gray">
      Open Modal
    </button>
  </div>

  <Modal v-model="isDialogOpen" :dialog="true">
    <h2>Palette Settings</h2>
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
  </Modal>

  <Modal v-model="isModalOpen">
    <h2>Modal Content</h2>
    <p>This is a modal with the same styling as the palette grid container.</p>
    <p>It uses mobile-first design and has reasonable max dimensions on larger screens.</p>
  </Modal>
</template>

<style>

/* Component-specific responsive layout */
.palette-controls {
  display: flex;
  gap: 8px;
}

@media (min-width: 481px) {
  .palette-controls {
    flex-direction: row;
    gap: 28px;
  }
}

/* Disabled button styles */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-disabled:hover {
  background: var(--gradient-button-green) !important;
  box-shadow: var(--shadow-button) !important;
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

</style>