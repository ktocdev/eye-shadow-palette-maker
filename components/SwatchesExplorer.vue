<script setup>
import { onMounted, onUnmounted, computed, nextTick, ref } from 'vue'

// Components
import ColorCarousel from './carousel/ColorCarousel.vue'
import GridControls from './grid/GridControls.vue'
import PaletteGrid from './grid/PaletteGrid.vue'
import PaletteControls from './shared/PaletteControls.vue'
import AppHeader from './AppHeader.vue'
import SavePaletteModal from './shared/SavePaletteModal.vue'
import PaletteManagerModal from './shared/PaletteManagerModal.vue'
import AboutModal from './shared/AboutModal.vue'
import LoaderOverlay from './shared/LoaderOverlay.vue'
import ToastNotification from './shared/ToastNotification.vue'

// Composables
import { useColorData } from '../composables/useColorData.js'
import { usePaletteState } from '../composables/usePaletteState.js'
import { usePaletteStorage } from '../composables/usePaletteStorage.js'
import { useSound } from '../composables/useSound.js'
import { useTitleEditing } from '../composables/useTitleEditing.js'

// Use composables
const { palette, allColors } = useColorData()

const {
  savedPalettes,
  hasSavedPalettes,
  loadSavedPalettes,
  savePalette,
  deletePalette,
  updatePaletteTitle,
  findPaletteById
} = usePaletteStorage()

// Use sound composable (only needed for carousel interactions now)  
const { playClick } = useSound()

// Use title editing composable (only for state access, not handlers)
const {
  isEditingTitle,
  editedTitle
} = useTitleEditing()

// Reference to PaletteGrid component
const paletteGridRef = ref(null)

// Track current grid size
const currentGridSize = ref(2)

// Carousel state management
const showCarousel = ref(false)
const carouselPosition = ref({ top: 0, left: 0 })
const carouselRef = ref(null)

// Modal states
const showSavePaletteModal = ref(false)
const showPaletteManager = ref(false)
const showAboutModal = ref(false)
const savedPaletteData = ref(null)

// Palette manager modal state
const paletteManagerTab = ref('saved')
const paletteManagerPaletteId = ref(null)

// Loader and toast states
const showLoader = ref(false)
const showToast = ref(false)
const savedPaletteTitle = ref('')

// Handle grid size changes
const handleGridSizeChange = (newSize) => {
  currentGridSize.value = newSize
  console.log('Grid size changed to:', newSize)
}

// Handle palette controls
const handleClear = () => {
  paletteGridRef.value?.clearGrid()
  clearPalette()
  updateGridTracker()
}

const handleRandomize = () => {
  paletteGridRef.value?.generateRandomPalette()
  clearPalette()
  updateGridTracker()
}

// Handle palette controls events
const handleOpenSaveModal = () => {
  // If we have an inline title, save directly and then show success modal
  if (inlinePaletteTitle.value.trim()) {
    handleSavePalette()
    // Modal will be shown from within handleSavePalette after save is complete
  } else {
    // Clear any stale savedPaletteData before opening modal for new save
    savedPaletteData.value = null
    // Always show the modal so user can enter a title
    showSavePaletteModal.value = true
  }
}

const handleViewSavedPalettes = () => {
  showSavePaletteModal.value = false
  // Reset to default state for saved palettes view
  paletteManagerTab.value = 'saved'
  paletteManagerPaletteId.value = null
  showPaletteManager.value = true
}

const handlePaletteManagerClose = (isOpen) => {
  showPaletteManager.value = isOpen
  if (!isOpen) {
    // Reset state when closing
    paletteManagerTab.value = 'saved'
    paletteManagerPaletteId.value = null
  }
}

// Handle toast action
const handleToastViewSavedPalettes = () => {
  showPaletteManager.value = true
}

// Handle save palette modal close
const handleSavePaletteModalClose = (isOpen) => {
  if (!isOpen && savedPaletteData.value !== null) {
    savedPaletteData.value = null
  }
}

const handleOpenAboutModal = () => {
  showAboutModal.value = true
}

// Handle demo palette actions from AboutModal
const handleDemoPaletteEyePreview = (paletteId) => {
  console.log('Demo palette eye preview:', paletteId)
  showAboutModal.value = false
  // Set palette manager to open with eye preview tab
  paletteManagerTab.value = 'preview'
  paletteManagerPaletteId.value = paletteId
  showPaletteManager.value = true
}



// New title editing handlers (receive events from AppHeader)
const handleTitleSaved = ({ oldTitle, newTitle }) => {
  updateLoadedPaletteTitle(newTitle)
  // Find the palette by old title and update it
  const paletteToUpdate = savedPalettes.value.find(p => p.title === oldTitle)
  if (paletteToUpdate) {
    updatePaletteTitle(paletteToUpdate.id, newTitle)
  }
}

// Inline title handlers (receive events from AppHeader)
const handleInlineTitleSaved = (title) => {
  // Trigger save palette functionality
  if (title.trim()) {
    handleSavePalette(title)
  }
}

const handleInlineTitleCancelled = () => {
  // Clear the inline title
  inlinePaletteTitle.value = ''
}

// Grid data computed property
const gridData = computed(() => {
  // Access gridChangeTracker to ensure reactivity
  gridChangeTracker.value
  if (!paletteGridRef.value || typeof paletteGridRef.value.getOccupiedCells !== 'function') {
    return []
  }
  return paletteGridRef.value.getOccupiedCells() || []
})

// Handle save palette modal events
const handleSavePalette = async (title = '') => {
  // Show loader immediately
  showLoader.value = true
  
  try {
    const gridData = paletteGridRef.value?.getOccupiedCells() || []
    
    // Use inline title if available, otherwise use provided title
    const finalTitle = inlinePaletteTitle.value.trim() || title || 'My Custom Palette'
    
    // Save using the composable
    const savedPalette = savePalette(gridData, finalTitle, currentGridSize.value)
    
    // Keep loader visible for minimum 1 second for visual feedback
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Hide loader and show toast
    showLoader.value = false
    savedPaletteTitle.value = savedPalette.title
    showToast.value = true
    
    // Close save modal if it was open
    showSavePaletteModal.value = false
    
    // Clear the grid after successful save
    paletteGridRef.value?.clearGrid()
    clearPalette()
    updateGridTracker()
    
  } catch (error) {
    console.error('Failed to save palette:', error)
    // Hide loader on error
    showLoader.value = false
    // Could show error toast here in the future
  }
}

// Handle loading a saved palette into the main grid
const handleLoadPalette = (paletteId) => {
  // Close the modal first
  showPaletteManager.value = false
  showSavePaletteModal.value = false
  
  // Look up palette data by ID
  const paletteData = findPaletteById(paletteId)
  if (!paletteData) {
    console.error('Palette not found:', paletteId)
    return
  }
  
  // Use composable to load palette state
  loadPalette(paletteData)
  
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
  // Hide carousel after color selection
  showCarousel.value = false
}

// Handle grid cell click - show carousel positioned near the clicked cell
const handleGridCellClick = (cellIndex, cellRect) => {
  console.log('Grid cell clicked:', cellIndex, cellRect)
  
  if (cellRect) {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const isMobile = viewportWidth <= 480
    
    // Estimate carousel dimensions (responsive)
    const carouselWidth = isMobile ? Math.min(viewportWidth - 40, 260) : Math.min(600, viewportWidth - 40)
    const carouselHeight = 140 // estimated height
    
    let left, top
    
    if (isMobile) {
      // On mobile, center carousel horizontally and position below/above cell
      left = Math.max(20, (viewportWidth - carouselWidth) / 2)
      
      // Try to position below the cell first
      if (cellRect.bottom + carouselHeight + 20 < viewportHeight) {
        top = cellRect.bottom + 10
      } else {
        // Position above the cell if not enough space below
        top = Math.max(20, cellRect.top - carouselHeight - 10)
      }
    } else {
      // Desktop: prefer right of cell, fallback to left
      if (cellRect.right + carouselWidth + 20 < viewportWidth) {
        left = cellRect.right + 10
      } else if (cellRect.left - carouselWidth - 10 > 0) {
        left = cellRect.left - carouselWidth - 10
      } else {
        // Center if neither side fits
        left = Math.max(20, (viewportWidth - carouselWidth) / 2)
      }
      
      // Vertically center on cell, but keep within viewport
      top = Math.max(20, Math.min(cellRect.top - 50, viewportHeight - carouselHeight - 20))
    }
    
    carouselPosition.value = { top, left }
  }
  
  showCarousel.value = true
}

// Handle clicking outside carousel to hide it
const handleDocumentClick = (event) => {
  if (!showCarousel.value) return
  
  // Check if click was on the carousel or a grid cell
  const carouselElement = carouselRef.value?.$el
  const clickedElement = event.target
  
  // Don't hide if clicking on carousel itself or grid cells
  if (carouselElement?.contains(clickedElement) || 
      clickedElement.closest('.grid-cell')) {
    return
  }
  
  // Hide carousel when clicking elsewhere
  showCarousel.value = false
}

// Track grid changes for reactivity
const gridChangeTracker = ref(0)
const updateGridTracker = () => {
  gridChangeTracker.value++
  triggerUserInteraction()
  modifyPalette()
}

// Check if grid has any colors
const hasColors = computed(() => {
  // Access gridChangeTracker to ensure reactivity
  gridChangeTracker.value
  if (!paletteGridRef.value || typeof paletteGridRef.value.getOccupiedCells !== 'function') {
    return false
  }
  const occupiedCells = paletteGridRef.value.getOccupiedCells() || []
  return occupiedCells.length > 0
})

// Check if all grid cells are occupied
const isGridFull = computed(() => {
  // Access gridChangeTracker to ensure reactivity
  gridChangeTracker.value
  if (!paletteGridRef.value || typeof paletteGridRef.value.getOccupiedCells !== 'function') {
    return false
  }
  const occupiedCells = paletteGridRef.value.getOccupiedCells() || []
  const totalCells = currentGridSize.value * currentGridSize.value
  return occupiedCells.length === totalCells
})

// Use palette state composable after isGridFull is defined
const {
  loadedPaletteTitle,
  loadedPaletteModified,
  hasUserInteracted,
  shouldCollapseAppInfo,
  inlinePaletteTitle,
  showInlineTitleInput,
  showLoadedPaletteTitle,
  showAppInfo,
  appInfoInitiallyOpen,
  canSavePalette,
  triggerUserInteraction,
  loadPalette,
  modifyPalette,
  clearPalette,
  updateLoadedPaletteTitle
} = usePaletteState({ isGridFull })

// Override canSavePalette to also require full grid
const canSavePaletteWithFullGrid = computed(() => {
  if (!isGridFull.value) return false
  return canSavePalette.value
})

// Get colors for eye preview - either from saved palette or current grid
const eyePreviewColors = computed(() => {
  if (savedPaletteData.value) {
    // Extract colors from saved palette data
    return savedPaletteData.value.colors
      .map(({ colorData }) => colorData)
      .filter(color => color !== null)
  } else {
    // Use current grid data - gridData has structure { index, colorData }
    return gridData.value
      .map(({ colorData }) => colorData)
      .filter(color => color !== null)
  }
})

// Load saved palettes on mount
onMounted(() => {
  loadSavedPalettes()
  // Add document click listener to hide carousel when clicking outside
  document.addEventListener('click', handleDocumentClick)
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div class="swatches-explorer page-container typography-base">    
    <div class="main-content main-content-layout">
      <div class="palette-container">
        <div class="app-header-container">
          <div class="app-header-container__inner">
            <AppHeader
              :show-inline-title-input="showInlineTitleInput"
              :show-loaded-palette-title="showLoadedPaletteTitle"
              :inline-palette-title="inlinePaletteTitle"
              :loaded-palette-title="loadedPaletteTitle"
              :loaded-palette-modified="loadedPaletteModified"
              :is-grid-full="isGridFull"
              :is-editing-title="isEditingTitle"
              :edited-title="editedTitle"
              @update:inline-palette-title="(value) => inlinePaletteTitle = value"
              @update:edited-title="(value) => editedTitle = value"
              @title-saved="handleTitleSaved"
              @title-edit-cancelled="() => {}"
              @inline-title-saved="handleInlineTitleSaved"
              @inline-title-cancelled="handleInlineTitleCancelled"
              @start-title-edit="() => {}"
            />
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
            @grid-cell-click="handleGridCellClick"
          />
        
          <div class="palette-controls-segment">
            <GridControls
              :grid-size="currentGridSize"
              @size-change="handleGridSizeChange"
            />
            
            <PaletteControls
              :has-saved-palettes="hasSavedPalettes"
              :has-colors="hasColors"
              :can-save="canSavePaletteWithFullGrid"
              :is-modal-open="showSavePaletteModal || showPaletteManager || showAboutModal"
              @clear="handleClear"
              @randomize="handleRandomize"
              @open-save-modal="handleOpenSaveModal"
              @view-saved-palettes="handleViewSavedPalettes"
              @open-about-modal="handleOpenAboutModal"
              @open-eye-preview="handleOpenEyePreview"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Color Carousel - shown conditionally on grid cell click -->
    <ColorCarousel
      v-if="showCarousel"
      ref="carouselRef"
      :colors="allColors"
      :palette-name="palette.name"
      :style="{
        position: 'fixed',
        top: carouselPosition.top + 'px',
        left: carouselPosition.left + 'px',
        zIndex: 200
      }"
      @swatch-click="handleSwatchClick"
    />
    
    <!-- Save Palette Modal -->
    <SavePaletteModal 
      v-model="showSavePaletteModal"
      :can-save="canSavePaletteWithFullGrid"
      :saved-palette-data="savedPaletteData"
      @save="handleSavePalette"
      @view-saved-palettes="handleViewSavedPalettes"
      @load-palette="handleLoadPalette"
      @update:model-value="handleSavePaletteModalClose"
    />
    
    <!-- Palette Manager Modal (tabbed: saved palettes, eye preview, share) -->
    <PaletteManagerModal 
      v-model="showPaletteManager"
      :initial-tab="paletteManagerTab"
      :initial-palette-id="paletteManagerPaletteId"
      @load-palette="handleLoadPalette"
      @update:model-value="handlePaletteManagerClose"
    />
    
    <!-- About Modal -->
    <AboutModal 
      v-model="showAboutModal"
      @load-palette="handleLoadPalette"
      @eye-preview="handleDemoPaletteEyePreview"
    />
    
    
    <!-- Loader Overlay -->
    <LoaderOverlay 
      v-model="showLoader"
      message="Saving palette..."
    />
    
    <!-- Toast Notification -->
    <ToastNotification 
      v-model="showToast"
      :title="savedPaletteTitle"
      @view-saved-palettes="handleToastViewSavedPalettes"
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
  font-size: var(--font-size-s);
  margin-bottom: 0;
  max-width: 600px;
}

@media (min-width: 769px) {
  .main-content {
    padding: 20px;
  }

  .app-info {
    margin: 0 10px;
  }
}

/* Inline title input styles */
.inline-title-input {
  width: 100%;
  display: flex;
  justify-content: center;
}

.palette-title-input {
  width: 100%;
  max-width: 400px;
  padding: 16px 20px;
  border: 2px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.95);
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(139, 129, 165, 0.1);
}

.palette-title-input:focus {
  outline: none;
  border-color: rgba(106, 90, 205, 0.6);
  box-shadow: 0 0 0 4px rgba(106, 90, 205, 0.15), 0 4px 12px rgba(139, 129, 165, 0.2);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.palette-title-input::placeholder {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-normal);
  opacity: 0.7;
}

/* Loaded palette title styles */
.loaded-palette-title {
  text-align: center;
}

.loaded-palette-title h1 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-snug);
}

.title-display {
  position: relative;
  display: inline-block;
}

.title-display:hover .edit-title-btn {
  opacity: 1;
}

.edit-title-btn {
  position: absolute;
  top: 50%;
  right: -35px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: var(--font-size-s);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.edit-title-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(106, 90, 205, 0.4);
  box-shadow: 0 2px 4px rgba(139, 129, 165, 0.2);
}

.title-edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.edit-actions {
  display: flex;
  gap: 12px;
}
</style>
