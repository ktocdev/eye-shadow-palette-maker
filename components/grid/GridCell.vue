<script setup>
import { ref, onMounted } from 'vue'
import { useDragDrop } from '../../composables/useDragDrop.js'
import { useEventCleanup } from '../../composables/useEventCleanup.js'

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

const onMiniSwatchDragStart = (e) => {
  handleMiniDragStart(e, props.colorData, true)
}

const onMiniSwatchDragEnd = (e) => {
  handleMiniDragEnd(e)
  // Check if the swatch was moved and clear cell if needed
  setTimeout(() => {
    if (!cellRef.value?.querySelector('.mini-swatch')) {
      emit('clear-cell', props.index)
    }
  }, 100)
}

const onMiniSwatchTouchStart = (e) => {
  handleMiniTouchStart(e, props.colorData, true)
}

const onMiniSwatchTouchMove = (e) => {
  handleMiniTouchMove(e)
}

const onMiniSwatchTouchEnd = (e) => {
  handleMiniTouchEnd(e)
}
</script>

<template>
  <div 
    ref="cellRef"
    class="grid-cell"
    :class="{ occupied: !!colorData }"
    :data-index="index"
  >
    <div 
      v-if="colorData"
      class="mini-swatch"
      :class="[
        { 'dark-mini-swatch': colorData.isDark },
        `effect-${colorData.effect || 'matte'}`
      ]"
      :style="{ backgroundColor: colorData.bgColor }"
      draggable="true"
      @dragstart="onMiniSwatchDragStart"
      @dragend="onMiniSwatchDragEnd"
      @touchstart="onMiniSwatchTouchStart"
      @touchmove="onMiniSwatchTouchMove"
      @touchend="onMiniSwatchTouchEnd"
    >
    </div>
    <div v-if="colorData" class="mini-color-name">{{ colorData.colorName }}</div>
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
  height: 72px;
  width: 72px;
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

.mini-swatch {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-swatch-mini);
  border: var(--border-swatch);
  cursor: grab;
  position: relative;
}

.mini-swatch:active {
  cursor: grabbing;
}

.mini-swatch.dragging {
  opacity: 0.5;
  transform: rotate(2deg) scale(0.98);
}

.mini-color-name {
  font-family: var(--font-family-primary);
  font-size: 12px;
  font-weight: bold;
  color: var(--color-text-primary);
  text-align: center;
  text-shadow: var(--text-shadow-light);
  pointer-events: none;
  max-width: 64px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  line-height: 1;
}

.mini-swatch.dark-mini-swatch .mini-color-name {
  color: var(--color-text-white);
  text-shadow: var(--text-shadow-dark);
}

/* Large Desktop (1440px and up) */
@media (min-width: 1440px) {
  .grid-cell {
    height: 128px;
    width: 128px;
  }

  .mini-color-name {
    font-family: var(--font-family-primary);
    font-size: var(--font-size-base);
    font-weight: bold;
    color: var(--color-text-primary);
    text-align: center;
    text-shadow: var(--text-shadow-light);
    max-width: none;
    pointer-events: none;
    padding: 8px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    line-height: 1;
  }
}
</style>