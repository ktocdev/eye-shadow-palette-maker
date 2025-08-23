<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import GridCell from './GridCell.vue'
import { usePaletteGrid } from '../../composables/usePaletteGrid.js'
import { useEventCleanup } from '../../composables/useEventCleanup.js'

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

const emit = defineEmits(['grid-size-change'])

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
  generateRandomPalette
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
}

// Handle cell clearing
const handleCellClear = (index) => {
  removeCellData(index)
}

// Handle grid size change
const handleGridSizeChange = (newSize) => {
  changeGridSize(newSize)
  emit('grid-size-change', newSize)
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
  generateRandomPalette
})
</script>

<template>
  <div class="palette-grid-container">
    <div 
      class="palette-grid"
      :style="{ gridTemplateColumns: gridColumns }"
    >
      <GridCell
        v-for="cell in gridCells"
        :key="`cell-${cell.index}`"
        :index="cell.index"
        :color-data="cell.colorData"
        @drop="handleCellDrop"
        @clear-cell="handleCellClear"
      />
    </div>
  </div>
</template>

<style>
/* Mobile-first palette grid container */
.palette-grid-container {
  margin-top: 10px;
  padding: 15px;
  background: var(--gradient-container-primary);
  border-radius: var(--radius-grid-container-top);
  box-shadow: var(--shadow-grid-container);
  border: var(--border-container);
  border-bottom: none;
}

.palette-grid {
  display: grid;
  gap: 8px;
  padding: 15px;
  background: var(--gradient-container-secondary);
  border-radius: var(--radius-container);
  box-shadow: var(--shadow-grid-inner);
  border: var(--border-container-light);
}

/* Tablet and up */
@media (min-width: 481px) {
  .palette-grid-container {
    padding: 18px;
    border-radius: var(--radius-grid-container-top-tablet);
  }
}

/* Desktop and up */
@media (min-width: 973px) {
  .palette-grid-container {
    margin-top: 0;
    padding: 20px;
    box-shadow: var(--shadow-grid-container-desktop);
  }
}
</style>
