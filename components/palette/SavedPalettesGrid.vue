<script setup>
import { onMounted, watch } from 'vue'
import MiniPalette from './MiniPalette.vue'
import { usePaletteStorage } from '../../composables/palette/usePaletteStorage.js'

const props = defineProps({
  refreshTrigger: {
    type: [Number, Boolean],
    default: 0
  }
})

const emit = defineEmits(['eye-preview', 'share', 'load', 'delete'])

// Use palette storage composable
const {
  savedPalettes,
  loadSavedPalettes,
  deletePalette: deletePaletteById
} = usePaletteStorage()

// Load saved palettes when component mounts
onMounted(() => {
  loadSavedPalettes()
})

// Reload palettes when refresh trigger changes
watch(() => props.refreshTrigger, () => {
  loadSavedPalettes()
})

// Handle palette actions from MiniPalette
const handlePaletteAction = (action, paletteId) => {
  if (action === 'load') {
    emit('load', paletteId)
  } else if (action === 'delete') {
    deletePalette(paletteId)
  } else if (action === 'share') {
    emit('share', paletteId)
  } else if (action === 'eye-preview') {
    emit('eye-preview', paletteId)
  }
}

// Delete a palette by ID
const deletePalette = (paletteId) => {
  deletePaletteById(paletteId)
}
</script>

<template>
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
</template>

<style>
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
  line-height: var(--line-height-relaxed);
  max-width: 400px;
  margin: 0 auto;
}
</style>