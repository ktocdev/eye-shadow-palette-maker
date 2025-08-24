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
    :class="{ occupied: !!colorData }"
    :data-index="index"
  >
    <PaletteSwatch 
      v-if="colorData"
      :color-data="colorData"
      @clear-swatch="emit('clear-cell', props.index)"
    />
  </div>
</template>

<style>
.grid-cell {
  aspect-ratio: 1;
  border: none;
  border-radius: var(--radius-grid-cell);
  background: var(--gradient-container-neutral);
  box-shadow: var(--shadow-grid-cell);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

@media (min-width: 480px) {
  .grid-cell {
    height: 88px;
    width: 88px;
  }
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

@media (min-width: 1024px) {
  .grid-cell {
    height: 128px;
    width: 128px;
  }
}
</style>
