<script setup>
import { ref, onMounted } from 'vue'
import { useDragDrop } from '../../composables/useDragDrop.js'
import { useEventCleanup } from '../../composables/useEventCleanup.js'
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
  }
})

const emit = defineEmits(['drop', 'clear-cell'])

const cellRef = ref(null)
const { addEventListener } = useEventCleanup()

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
      { occupied: !!colorData },
      `size-${gridSize}x${gridSize}`
    ]"
    :data-index="index"
  >
    <PaletteSwatch 
      v-if="colorData"
      :color-data="colorData"
      :grid-size="gridSize"
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
}

.grid-cell.drag-over {
  background: var(--gradient-container-hover);
  box-shadow: var(--shadow-grid-cell-hover);
  transform: scale(1.02);
}

.grid-cell.occupied {
  border: none;
  background: transparent;
}

/* Grid size specific cell styling - Mobile first */
/* 2x2 Grid - Mobile base sizes */
.grid-cell.size-2x2 {
  min-height: 78px;
  max-height: 117px;
}

/* 3x3 Grid - Mobile base sizes */  
.grid-cell.size-3x3 {
  min-height: 59px;
  max-height: 91px;
}

/* 4x4 Grid - Mobile base sizes */
.grid-cell.size-4x4 {
  min-height: 46px;
  max-height: 78px;
}

@media (min-width: 361px) {
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

@media (min-width: 1024px) {
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
