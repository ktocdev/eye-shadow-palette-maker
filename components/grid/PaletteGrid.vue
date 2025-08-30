<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import GridCell from './GridCell.vue'
import { usePaletteGrid } from '../../composables/usePaletteGrid.js'
import { useEventCleanup } from '../../composables/useEventCleanup.js'
import { useSound } from '../../composables/useSound.js'
import { useColorSelection } from '../../composables/useColorSelection.js'

const props = defineProps({
  colors: {
    type: Array,
    required: true
  },
  initialGridSize: {
    type: Number,
    default: 4
  },
  gridSize: {
    type: Number,
    default: 4
  }
})

const emit = defineEmits(['grid-size-change', 'grid-updated'])

// Use palette grid composable
const {
  gridSize,
  gridColumns,
  changeGridSize,
  setCellData,
  getCellData,
  removeCellData,
  clearGrid,
  findSourceCellIndex,
  swapOrMoveColors,
  generateRandomPalette,
  getOccupiedCells,
  findFirstEmptyCell
} = usePaletteGrid(computed(() => props.colors))

// Set initial grid size
gridSize.value = props.initialGridSize

// Watch for external grid size changes
watch(() => props.gridSize, (newSize) => {
  if (newSize !== gridSize.value) {
    changeGridSize(newSize)
  }
})

// Event cleanup composable
const { addEventListener } = useEventCleanup()

// Sound composable
const { playDropSuccess } = useSound()

// Color selection composable
const { selectedColor, hasSelection, clearSelection } = useColorSelection()

// Handle grid cell drops
const handleCellDrop = ({ index, colorData, isFromGrid }) => {
  if (isFromGrid) {
    // Handle grid-to-grid movement (swap or move)
    const sourceIndex = findSourceCellIndex(colorData.bgColor, index)
    swapOrMoveColors(colorData, index, sourceIndex)
  } else {
    // Handle swatch-to-grid (regular drop from swatch)
    setCellData(index, colorData)
  }
  
  // Play drop success sound after successful drop
  playDropSuccess()
  
  // Emit grid updated event
  emit('grid-updated')
}

// Handle cell clearing
const handleCellClear = (index) => {
  removeCellData(index)
  // Emit grid updated event
  emit('grid-updated')
}

// Handle grid size change
const handleGridSizeChange = (newSize) => {
  changeGridSize(newSize)
  emit('grid-size-change', newSize)
}

// Handle cell click for placing selected colors
const handleCellClick = (index) => {
  if (!hasSelection.value) return
  
  // Place the selected color in the clicked cell (allow replacing existing colors)
  setCellData(index, selectedColor.value)
  playDropSuccess()
  clearSelection()
  emit('grid-updated')
}


// Handle touch drop events
const handleTouchDrop = (e) => {
  const { dragData, targetCell, isFromGrid } = e.detail
  const targetIndex = parseInt(targetCell.dataset.index)
  
  handleCellDrop({
    index: targetIndex,
    colorData: dragData,
    isFromGrid
  })
}

// Setup global touch drop listener
onMounted(() => {
  addEventListener(document, 'touchdrop', handleTouchDrop)
})

// Add color to first empty cell
const addColorToFirstEmpty = (colorData) => {
  const emptyIndex = findFirstEmptyCell()
  
  if (emptyIndex !== -1) {
    setCellData(emptyIndex, colorData)
    // Play drop success sound
    playDropSuccess()
    // Emit grid updated event
    emit('grid-updated')
    return true
  }
  return false // Grid is full
}

// Generate grid cells array
const gridCells = computed(() => {
  const cells = []
  const totalCells = gridSize.value * gridSize.value
  
  for (let i = 0; i < totalCells; i++) {
    cells.push({
      index: i,
      colorData: getCellData(i)
    })
  }
  
  return cells
})

// Expose functions for parent component
defineExpose({
  clearGrid,
  generateRandomPalette,
  getOccupiedCells,
  addColorToFirstEmpty
})
</script>

<template>
  <div 
    class="palette-grid"
    :class="`grid-${gridSize}x${gridSize}`"
    :style="{ gridTemplateColumns: gridColumns }"
  >
    <GridCell
      v-for="cell in gridCells"
      :key="`cell-${cell.index}`"
      :index="cell.index"
      :color-data="cell.colorData"
      :grid-size="gridSize"
      @drop="handleCellDrop"
      @clear-cell="handleCellClear"
      @cell-click="handleCellClick"
    />
  </div>
</template>

<style>
/* Palette grid - now contained within palette-grid-wrapper - Mobile first */
.palette-grid {
  display: grid;
  gap: 8px;
  padding: 15px;
  background: var(--gradient-container-secondary);
  border-radius: var(--radius-container-large);
  box-shadow: var(--shadow-grid-inner);
  border: var(--border-container-light);
  position: relative;
  z-index: 2;
}

/* Grid size specific styling - Desktop first */
/* Desktop defaults */
.palette-grid.grid-2x2 {
  gap: 20px;
  padding: 33px;
}

.palette-grid.grid-3x3 {
  gap: 16px;
  padding: 29px;
}

.palette-grid.grid-4x4 {
  gap: 13px;
  padding: 26px;
}

/* Medium breakpoint - step down at 769px */
@media (max-width: 768px) {
  .palette-grid.grid-2x2 {
    gap: 15px;
    padding: 26px;
  }
  
  .palette-grid.grid-3x3 {
    gap: 13px;
    padding: 23px;
  }
  
  .palette-grid.grid-4x4 {
    gap: 10px;
    padding: 20px;
  }
}

/* Mobile breakpoint - smallest sizes at 480px */
@media (max-width: 480px) {
  .palette-grid.grid-2x2 {
    gap: 10px;
    padding: 16px;
  }

  .palette-grid.grid-3x3 {
    gap: 8px;
    padding: 13px;
  }

  .palette-grid.grid-4x4 {
    gap: 8px;
    padding: 16px;
  }
}
</style>
