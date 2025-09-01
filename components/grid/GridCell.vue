<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDragDrop } from '../../composables/useDragDrop.js'
import { useEventCleanup } from '../../composables/useEventCleanup.js'
import { useColorSelection } from '../../composables/useColorSelection.js'
import PaletteSwatch from './PaletteSwatch.vue'

const props = defineProps({
  index: {
    type: Number,
    required: true
  },
  colorData: {
    type: Object,
    default: null
  },
  gridSize: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['drop', 'clear-cell', 'cell-click'])

const cellRef = ref(null)
const { addEventListener } = useEventCleanup()

// Color selection composable  
const { hasSelection } = useColorSelection()

// Check if this cell can receive a selected color
const canReceiveColor = computed(() => {
  return hasSelection.value // Allow replacing both empty and occupied cells
})

// Handle cell click
const handleCellClick = (event) => {
  // Always emit cell click (either for color placement or carousel showing)
  emit('cell-click', props.index, event)
}

// Single instance of drag drop composable
const { 
  handleDragOver, 
  handleDragLeave, 
  handleDrop,
  handleDragStart: handleMiniDragStart, 
  handleDragEnd: handleMiniDragEnd,
  handleTouchStart: handleMiniTouchStart,
  handleTouchMove: handleMiniTouchMove,
  handleTouchEnd: handleMiniTouchEnd
} = useDragDrop()

onMounted(() => {
  if (cellRef.value) {
    // Set up drag and drop listeners
    addEventListener(cellRef.value, 'dragover', handleDragOver)
    addEventListener(cellRef.value, 'dragleave', handleDragLeave)
    addEventListener(cellRef.value, 'drop', (e) => {
      const dropData = handleDrop(e)
      if (dropData) {
        emit('drop', {
          index: props.index,
          colorData: dropData.colorData,
          isFromGrid: dropData.isFromGrid
        })
      }
    })
  }
})
</script>

<template>
  <div 
    ref="cellRef"
    class="grid-cell"
    :class="[
      { 
        occupied: !!colorData,
        'can-receive': canReceiveColor,
        active: isActive
      },
      `size-${gridSize}x${gridSize}`
    ]"
    :data-index="index"
    @click="handleCellClick"
  >
    <PaletteSwatch 
      v-if="colorData"
      :color-data="colorData"
      :grid-size="gridSize"
      :is-active="isActive"
      @clear-swatch="emit('clear-cell', props.index)"
    />
  </div>
</template>

<style>
.grid-cell {
  aspect-ratio: 1;
  border: none;
  border-radius: var(--radius-lg);
  background: var(--gradient-container-neutral);
  box-shadow: var(--shadow-grid-cell);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.grid-cell:hover {
  box-shadow: var(--shadow-grid-cell-hover);
  transform: translateY(-2px) scale(1.01);
  border: 2px solid var(--color-purple-light);
}

.grid-cell.drag-over {
  background: var(--gradient-container-hover);
  border: 2px solid var(--color-purple-light);
  box-shadow: var(--shadow-grid-cell-hover);
  transform: scale(1.02);
}

.grid-cell.occupied {
  border: none;
  background: transparent;
}

.grid-cell.active:not(.occupied) {
  box-shadow: var(--shadow-grid-cell-hover);
  transform: translateY(-2px) scale(1.01);
  border: 2px solid var(--color-purple-light);
}


.grid-cell.can-receive {
  cursor: pointer;
  /* border: 2px solid var(--color-purple-light); */
}

.grid-cell.can-receive:not(.occupied) {
  background: var(--gradient-container-hover);
  box-shadow: var(--shadow-grid-cell-hover);
  /* border: 2px solid var(--color-purple-light); */
}

.grid-cell.can-receive.occupied {
  opacity: 0.8;
  transform: scale(0.98);
  /* border: 2px solid var(--color-purple-light); */
}

/* Grid size specific cell styling - Mobile first */

/* Mobile base styles (smallest screens) */
.grid-cell.size-2x2 {
  min-height: 78px;
  max-height: 117px;
}

.grid-cell.size-3x3 {
  min-height: 59px;
  max-height: 91px;
}

.grid-cell.size-4x4 {
  min-height: 46px;
  max-height: 78px;
}

/* Tablet breakpoint - step up at 481px */
@media (min-width: 481px) {
  .grid-cell {
    border-radius: var(--radius-lg);
  }
  
  .grid-cell.size-2x2 {
    min-height: 104px;
    max-height: 156px;
  }
  
  .grid-cell.size-3x3 {
    min-height: 78px;
    max-height: 117px;
  }
  
  .grid-cell.size-4x4 {
    min-height: 65px;
    max-height: 104px;
  }
}

/* Desktop breakpoint - largest sizes at 769px */
@media (min-width: 769px) {
  .grid-cell {
    border-radius: var(--radius-xl);
  }

  .grid-cell.size-2x2 {
    min-height: 130px;
    max-height: 182px;
  }

  .grid-cell.size-3x3 {
    min-height: 104px;
    max-height: 143px;
  }

  .grid-cell.size-4x4 {
    min-height: 85px;
    max-height: 124px;
  }
}
</style>
