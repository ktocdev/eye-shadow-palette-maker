<script setup>
import { ref, onMounted, watch } from 'vue'
import MiniPalette from './MiniPalette.vue'
import Modal from './Modal.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'load-palette', 'share-palette', 'eye-preview-palette'])

const savedPalettes = ref([])


// Load saved palettes from localStorage
const loadSavedPalettes = () => {
  try {
    const saved = localStorage.getItem('eyeshadow-saved-palettes')
    if (saved) {
      savedPalettes.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading saved palettes:', error)
    savedPalettes.value = []
  }
}

// Load saved palettes when component mounts and when modal opens
onMounted(() => {
  loadSavedPalettes()
})

// Reload palettes when modal opens (in case new ones were saved)
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadSavedPalettes()
  }
})


// Handle palette actions from MiniPalette
const handlePaletteAction = (action, paletteData) => {
  if (action === 'load') {
    // Emit to parent (SwatchesExplorer) to load palette
    emit('load-palette', paletteData)
  } else if (action === 'delete') {
    // Handle delete locally
    deletePalette(paletteData)
  } else if (action === 'share') {
    // Emit to parent to handle sharing
    emit('share-palette', paletteData)
  } else if (action === 'eye-preview') {
    // Emit to parent to handle eye preview
    emit('eye-preview-palette', paletteData)
  }
}

// Delete a palette from saved palettes
const deletePalette = (paletteToDelete) => {
  const index = savedPalettes.value.findIndex(palette => 
    palette.title === paletteToDelete.title && 
    palette.createdAt === paletteToDelete.createdAt
  )
  
  if (index !== -1) {
    savedPalettes.value.splice(index, 1)
    // Update localStorage
    localStorage.setItem('eyeshadow-saved-palettes', JSON.stringify(savedPalettes.value))
  }
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <h2>{{ savedPalettes.length > 0 ? 'Your Saved Palettes' : 'Saved Palette Demo' }}</h2>
    
    <!-- Show saved palettes if they exist -->
    <div v-if="savedPalettes.length > 0" class="saved-palettes-grid">
      <div 
        v-for="(palette, index) in savedPalettes" 
        :key="`saved-palette-${index}`"
        class="saved-palette-item"
      >
        <MiniPalette 
          :palette-data="palette" 
          :size="120" 
          @palette-action="handlePaletteAction"
        />
      </div>
    </div>
    
    <!-- Show message if no saved palettes -->
    <div v-else class="no-palettes-message">
      <h3>No Saved Palettes</h3>
      <p>You haven't saved any palettes yet. Create your first palette using the eyeshadow carousel and grid, then click "Save Palette" to store it here.</p>
    </div>
  </Modal>
</template>

<style>
p {
  margin-bottom: 12px;
}

/* Saved palettes grid - Mobile first */
.saved-palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
  gap: 16px;
  margin: 20px 0;
  justify-content: start;
}

.saved-palette-item {
  display: flex;
  justify-content: center;
}

@media (min-width: 481px) {
  .saved-palettes-grid {
    grid-template-columns: repeat(auto-fill, 140px);
    gap: 20px;
  }
}

/* No palettes message */
.no-palettes-message {
  text-align: center;
  padding: 40px 20px;
  margin: 20px 0;
}

.no-palettes-message h3 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.no-palettes-message p {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}
</style>
