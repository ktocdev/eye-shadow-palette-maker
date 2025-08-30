<script setup>
import { onMounted, onUnmounted, computed } from 'vue'

// Components
import ColorCarousel from './carousel/ColorCarousel.vue'
import GridControls from './grid/GridControls.vue'
import PaletteGrid from './grid/PaletteGrid.vue'
import PaletteControls from './shared/PaletteControls.vue'
import SavePaletteModal from './shared/SavePaletteModal.vue'
import SavedPalettesModal from './shared/SavedPalettesModal.vue'
import AboutModal from './shared/AboutModal.vue'
import CollapsibleText from './shared/CollapsibleText.vue'

// Composables
import { useColorData } from '../composables/useColorData.js'
import { ref } from 'vue'

// Use color data composable
const { palette, allColors } = useColorData()

// Reference to PaletteGrid component
const paletteGridRef = ref(null)

// Track current grid size
const currentGridSize = ref(2)

// Modal states
const showSavePaletteModal = ref(false)
const showSavedPalettesModal = ref(false)
const showAboutModal = ref(false)
const savedPaletteData = ref(null)

// Handle grid size changes
const handleGridSizeChange = (newSize) => {
  currentGridSize.value = newSize
  console.log('Grid size changed to:', newSize)
}

// Handle palette controls
const handleClear = () => {
  paletteGridRef.value?.clearGrid()
  loadedPaletteTitle.value = null // Clear loaded palette title
  loadedPaletteModified.value = false // Reset modified flag
  shouldCollapseAppInfo.value = false // Reset collapsed state
  updateGridTracker()
}

const handleRandomize = () => {
  paletteGridRef.value?.generateRandomPalette()
  loadedPaletteTitle.value = null // Clear loaded palette title
  loadedPaletteModified.value = false // Reset modified flag
  shouldCollapseAppInfo.value = false // Reset collapsed state
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
    loadedPaletteTitle.value = null // Clear loaded palette title
    loadedPaletteModified.value = false // Reset modified flag
    shouldCollapseAppInfo.value = false // Reset collapsed state
    updateGridTracker()
  } catch (error) {
    console.error('Error saving palette:', error)
  }
}

const handleViewSavedPalettes = () => {
  showSavePaletteModal.value = false
  showSavedPalettesModal.value = true
}

const handleOpenAboutModal = () => {
  showAboutModal.value = true
}

// Handle loading a saved palette into the main grid
const handleLoadPalette = (paletteData) => {
  // Close the modal first
  showSavedPalettesModal.value = false
  
  // Set the loaded palette title and reset modified flag
  loadedPaletteTitle.value = paletteData.title
  loadedPaletteModified.value = false
  shouldCollapseAppInfo.value = true
  
  // Change grid size to match the saved palette
  if (paletteData.gridSize !== currentGridSize.value) {
    currentGridSize.value = paletteData.gridSize
    paletteGridRef.value?.changeGridSize(paletteData.gridSize)
  }
  
  // Transform the palette data format for importGridData
  // savedPalette.colors format: [{ index: 0, colorData: {...} }, ...]
  // importGridData expects: [colorData, colorData, ...]
  const totalCells = paletteData.gridSize * paletteData.gridSize
  const gridData = new Array(totalCells).fill(null)
  
  paletteData.colors.forEach(({ index, colorData }) => {
    if (index < totalCells) {
      // All palette data now uses standard format: {colorName, hexCode, bgColor, isDark, effect}
      console.log('Loading palette color at index', index, 'colorData:', colorData)
      gridData[index] = colorData
    }
  })
  
  console.log('Final gridData for import:', gridData)
  
  // Import the data into the grid
  paletteGridRef.value?.importGridData(gridData)
  
  // Update the grid tracker WITHOUT marking as modified (skip the modification logic)
  gridChangeTracker.value++
}

// Handle carousel swatch click - selection is handled by CarouselSwatch directly
const handleSwatchClick = (colorData) => {
  // No action needed - selection is handled in CarouselSwatch component
}

// Track grid changes for reactivity
const gridChangeTracker = ref(0)
const updateGridTracker = () => {
  gridChangeTracker.value++
  // Mark loaded palette as modified when grid changes
  if (loadedPaletteTitle.value) {
    loadedPaletteModified.value = true
  }
}

// Track loaded palette title
const loadedPaletteTitle = ref(null)

// Track if loaded palette has been modified
const loadedPaletteModified = ref(false)

// Track if app-info should be collapsed (when palette is loaded)
const shouldCollapseAppInfo = ref(false)

// Check if all grid cells are occupied
const isGridFull = computed(() => {
  // Access gridChangeTracker to ensure reactivity
  gridChangeTracker.value
  if (!paletteGridRef.value) return false
  const occupiedCells = paletteGridRef.value.getOccupiedCells() || []
  const totalCells = currentGridSize.value * currentGridSize.value
  return occupiedCells.length === totalCells
})

// Check if palette can be saved (grid is full and either no palette loaded or palette has been modified)
const canSavePalette = computed(() => {
  return isGridFull.value && (!loadedPaletteTitle.value || loadedPaletteModified.value)
})

// Check if there are saved palettes
const hasSavedPalettes = computed(() => {
  try {
    const saved = localStorage.getItem('eyeshadow-saved-palettes')
    return saved && JSON.parse(saved).length > 0
  } catch (error) {
    return false
  }
})

// Check if grid has any colors
const hasColors = computed(() => {
  // Access gridChangeTracker to ensure reactivity
  gridChangeTracker.value
  if (!paletteGridRef.value) return false
  const occupiedCells = paletteGridRef.value.getOccupiedCells() || []
  return occupiedCells.length > 0
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
        <div class="app-header-container">
          <div class="app-header-container__inner">
            <div class="app-info">
              <CollapsibleText 
                :title="(loadedPaletteTitle && !loadedPaletteModified) ? loadedPaletteTitle : 'Eye Shadow Palette Maker'"
                text="Build custom eyeshadow palettes by dragging or clicking colors from the carousel and adding them to the palette. Drag colors out of the grid to remove them."
                :initially-open="!shouldCollapseAppInfo"
              />
            </div>
          </div>
        </div>

        <div class="palette-grid-wrapper">    
          <div class="palette-hinges">
            <div class="hinge left-hinge"></div>
            <div class="hinge right-hinge"></div>
          </div>
          <PaletteGrid
            ref="paletteGridRef"
            :colors="allColors"
            :initial-grid-size="2"
            :grid-size="currentGridSize"
            @grid-size-change="handleGridSizeChange"
            @grid-updated="updateGridTracker"
          />
          
          <div class="palette-controls-segment">
            <GridControls
              :grid-size="currentGridSize"
              @size-change="handleGridSizeChange"
            />
            
            <PaletteControls 
              @clear="handleClear"
              @randomize="handleRandomize"
              @open-save-modal="handleOpenSaveModal"
              @view-saved-palettes="handleViewSavedPalettes"
              @open-about-modal="handleOpenAboutModal"
              :can-save="canSavePalette"
              :has-saved-palettes="hasSavedPalettes"
              :has-colors="hasColors"
              :is-modal-open="showSavePaletteModal || showSavedPalettesModal || showAboutModal"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Save Palette Modal -->
    <SavePaletteModal 
      v-model="showSavePaletteModal"
      :can-save="canSavePalette"
      :saved-palette-data="savedPaletteData"
      @save="handleSavePalette"
      @view-saved-palettes="handleViewSavedPalettes"
      @load-palette="handleLoadPalette"
    />
    
    <!-- Saved Palettes Modal -->
    <SavedPalettesModal 
      v-model="showSavedPalettesModal"
      @load-palette="handleLoadPalette"
    />
    
    <!-- About Modal -->
    <AboutModal 
      v-model="showAboutModal"
      @load-palette="handleLoadPalette"
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
  width: min-content;
}

.app-info {
  text-align: center;
}

.app-info p {
  font-size: 14px;
  margin-bottom: 0;
  max-width: 600px;
}

@media (min-width: 769px) {
  .swatches-explorer,
  .main-content {
    padding: 20px;
  }

  .app-info {
    margin: 0 10px;
  }
}
</style>
