<script setup>
import { onMounted, onUnmounted, computed } from 'vue'

// Components
import ColorCarousel from './carousel/ColorCarousel.vue'
import GridControls from './grid/GridControls.vue'
import PaletteGrid from './grid/PaletteGrid.vue'
import PaletteControls from './shared/PaletteControls.vue'
import SavePaletteModal from './shared/SavePaletteModal.vue'
import SavedPalettesModal from './shared/SavedPalettesModal.vue'

// Composables
import { useColorData } from '../composables/useColorData.js'
import { ref } from 'vue'

// Use color data composable
const { palette, allColors } = useColorData()

// Reference to PaletteGrid component
const paletteGridRef = ref(null)

// Track current grid size
const currentGridSize = ref(4)

// Modal states
const showSavePaletteModal = ref(false)
const showSavedPalettesModal = ref(false)
const savedPaletteData = ref(null)

// Handle grid size changes
const handleGridSizeChange = (newSize) => {
  currentGridSize.value = newSize
  console.log('Grid size changed to:', newSize)
}

// Handle palette controls
const handleClear = () => {
  paletteGridRef.value?.clearGrid()
  updateGridTracker()
}

const handleRandomize = () => {
  paletteGridRef.value?.generateRandomPalette()
  updateGridTracker()
}

// Handle palette controls events
const handleOpenSaveModal = () => {
  showSavePaletteModal.value = true
}

const handleOpenSavedPalettesModal = () => {
  showSavedPalettesModal.value = true
}

// Handle save palette modal events
const handleSavePalette = (title) => {
  const gridData = paletteGridRef.value?.getOccupiedCells() || []
  console.log('Raw grid data from getOccupiedCells:', gridData)
  
  const paletteData = {
    title: title || 'My Custom Palette',
    gridSize: currentGridSize.value,
    colors: gridData,
    createdAt: new Date().toISOString()
  }
  console.log('Palette data to save:', paletteData)
  
  // Save to localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('eyeshadow-saved-palettes') || '[]')
    existing.push(paletteData)
    localStorage.setItem('eyeshadow-saved-palettes', JSON.stringify(existing))
    
    // Store the saved palette data for the modal to display
    savedPaletteData.value = paletteData
    
    // Clear the grid after successful save
    paletteGridRef.value?.clearGrid()
    updateGridTracker()
  } catch (error) {
    console.error('Error saving palette:', error)
  }
}

const handleViewSavedPalettes = () => {
  showSavePaletteModal.value = false
  showSavedPalettesModal.value = true
}

// Handle carousel swatch click
const handleSwatchClick = (colorData) => {
  paletteGridRef.value?.addColorToFirstEmpty(colorData)
}

// Track grid changes for reactivity
const gridChangeTracker = ref(0)
const updateGridTracker = () => {
  gridChangeTracker.value++
}

// Check if all grid cells are occupied
const isGridFull = computed(() => {
  // Access gridChangeTracker to ensure reactivity
  gridChangeTracker.value
  if (!paletteGridRef.value) return false
  const occupiedCells = paletteGridRef.value.getOccupiedCells() || []
  const totalCells = currentGridSize.value * currentGridSize.value
  return occupiedCells.length === totalCells
})
</script>

<template>
  <div class="swatches-explorer page-container typography-base">
    
    <ColorCarousel
      :colors="allColors"
      :palette-name="palette.name"
      @swatch-click="handleSwatchClick"
    />
    
    <div class="main-content main-content-layout">
      <div class="palette-container">
        <PaletteGrid
          ref="paletteGridRef"
          :colors="allColors"
          :initial-grid-size="4"
          :grid-size="currentGridSize"
          @grid-size-change="handleGridSizeChange"
          @grid-updated="updateGridTracker"
        />
        
        <div class="palette-hinges">
          <div class="hinge left-hinge"></div>
          <div class="hinge right-hinge"></div>
        </div>
        
        <div class="palette-lid">
          <div class="palette-lid__inner">
            <div class="app-info">
              <h1>Eye Shadow Palette Maker</h1>
              <p>Drag colors from the top into the palette grid to create beautiful eyeshadow combinations.</p>
            </div>

            <GridControls
              :grid-size="currentGridSize"
              @size-change="handleGridSizeChange"
            />

            <PaletteControls 
              @clear="handleClear"
              @randomize="handleRandomize"
              @open-save-modal="handleOpenSaveModal"
              @view-saved-palettes="handleOpenSavedPalettesModal"
              :can-save="isGridFull"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Save Palette Modal -->
    <SavePaletteModal 
      v-model="showSavePaletteModal"
      :can-save="isGridFull"
      :saved-palette-data="savedPaletteData"
      @save="handleSavePalette"
      @view-saved-palettes="handleViewSavedPalettes"
    />
    
    <!-- Saved Palettes Modal -->
    <SavedPalettesModal 
      v-model="showSavedPalettesModal"
    />
  </div>
</template>

<style>
@import '../styles/shared.css';

.swatches-explorer {
  background: var(--gradient-main-background);
}

.palette-container {
  position: relative;
}

.app-info {
  margin: 0 20px;
  text-align: center;
}

.app-info p {
  margin-bottom: 0;
}

@media (min-width: 769px) {
  .swatches-explorer,
  .main-content {
    padding: 20px;
  }

  .app-info {
    margin: 0 40px;
  }
}
</style>
