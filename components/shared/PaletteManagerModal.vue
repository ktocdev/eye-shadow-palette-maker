<script setup>
import { reactive, computed } from 'vue'
import Modal from './Modal.vue'
// Import tab components
import SavedPalettesGrid from './SavedPalettesGrid.vue'
import EyePreviewCanvas from './EyePreviewCanvas.vue' 
import SharePaletteForm from './SharePaletteForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'load-palette'])

// Modal state
const modalState = reactive({
  currentTab: 'saved', // Always starts on saved palettes
  selectedPaletteId: null,
  previousTab: null // Track navigation history
})

// Navigation methods
const goBackToSaved = () => {
  modalState.currentTab = 'saved'
  modalState.selectedPaletteId = null
}

const getModalTitle = () => {
  switch(modalState.currentTab) {
    case 'saved': return 'Your Saved Palettes'
    case 'preview': return 'Eye Preview'
    case 'share': return 'Share Palette'
    default: return 'Palette Manager'
  }
}

// Action handlers
const handleEyePreview = (paletteId) => {
  modalState.selectedPaletteId = paletteId
  modalState.currentTab = 'preview'
}

const handleShare = (paletteId) => {
  modalState.selectedPaletteId = paletteId
  modalState.currentTab = 'share'
}

const handleLoad = (paletteId) => {
  emit('load-palette', paletteId)
  emit('update:modelValue', false)
}

const handleDelete = (paletteId) => {
  // Handle delete logic (to be implemented)
  console.log('Delete palette:', paletteId)
}

const handleClose = (isOpen) => {
  if (!isOpen) {
    // Reset state when closing
    modalState.currentTab = 'saved'
    modalState.selectedPaletteId = null
  }
  emit('update:modelValue', isOpen)
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="handleClose">
    <!-- Header with back navigation -->
    <div class="modal-header">
      <button 
        v-if="modalState.currentTab !== 'saved'" 
        @click="goBackToSaved"
        class="back-button"
      >
        ← Back to All Saved Palettes
      </button>
      <h2>{{ getModalTitle() }}</h2>
    </div>
    
    <!-- Tab navigation (only show when on saved palettes) -->
    <div v-if="modalState.currentTab === 'saved'" class="modal-tabs">
      <button :class="{ active: modalState.currentTab === 'saved' }">All Palettes</button>
    </div>
    
    <!-- Content area -->
    <div class="modal-content">
      <!-- Saved Palettes Grid -->
      <SavedPalettesGrid 
        v-if="modalState.currentTab === 'saved'" 
        @eye-preview="handleEyePreview"
        @share="handleShare"
        @load="handleLoad"
        @delete="handleDelete"
      />
      
      <!-- Eye Preview Canvas -->
      <EyePreviewCanvas 
        v-if="modalState.currentTab === 'preview'" 
        :palette-id="modalState.selectedPaletteId"
      />
      
      <!-- Share Palette Form -->
      <SharePaletteForm 
        v-if="modalState.currentTab === 'share'" 
        :palette-id="modalState.selectedPaletteId"
      />
    </div>
  </Modal>
</template>

<style>
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: var(--border-container-light);
}

.back-button {
  background: none;
  border: none;
  color: var(--color-success-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: 8px 0;
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: var(--color-success-border-hover);
  text-decoration: underline;
}

.modal-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: var(--border-container-light);
}

.modal-tabs button {
  background: none;
  border: none;
  padding: 12px 16px;
  color: var(--color-text-muted);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.modal-tabs button.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-success-primary);
}

.modal-tabs button:hover {
  color: var(--color-text-primary);
}

.modal-content {
  min-height: 400px;
}
</style>