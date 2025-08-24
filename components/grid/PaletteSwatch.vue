<script setup>
import { computed } from 'vue'
import { useDragDrop } from '../../composables/useDragDrop.js'

const props = defineProps({
  colorData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['clear-swatch'])

// Use drag and drop composable
const { 
  handleDragStart: handleMiniDragStart, 
  handleDragEnd: handleMiniDragEnd,
  handleTouchStart: handleMiniTouchStart,
  handleTouchMove: handleMiniTouchMove,
  handleTouchEnd: handleMiniTouchEnd
} = useDragDrop()

// Handle drag events with proper data
const onMiniSwatchDragStart = (e) => {
  handleMiniDragStart(e, props.colorData, true)
}

const onMiniSwatchDragEnd = (e) => {
  // Check if this was a failed drop (dragged outside valid drop zones)
  const wasSuccessfulDrop = e.dataTransfer && e.dataTransfer.dropEffect !== 'none'
  
  handleMiniDragEnd(e)
  
  // If drag was not successful (dropped outside grid), remove this swatch
  if (!wasSuccessfulDrop) {
    console.log('PaletteSwatch dragged outside grid, removing:', props.colorData.colorName)
    emit('clear-swatch')
  }
}

const onMiniSwatchTouchStart = (e) => {
  handleMiniTouchStart(e, props.colorData, true)
}

const onMiniSwatchTouchMove = (e) => {
  handleMiniTouchMove(e)
}

const onMiniSwatchTouchEnd = (e) => {
  // For touch events, check if touch ended over a valid grid cell
  const touch = e.changedTouches[0]
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
  const gridCell = elementBelow?.closest('.grid-cell')
  
  handleMiniTouchEnd(e)
  
  // If touch ended outside grid, remove this swatch
  if (!gridCell) {
    console.log('PaletteSwatch touch ended outside grid, removing:', props.colorData.colorName)
    emit('clear-swatch')
  }
}
</script>

<template>
  <div class="palette-swatch-container">
    <div 
      class="palette-swatch"
      :class="[
        { 'dark-palette-swatch': colorData.isDark },
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
    <div class="palette-color-name">{{ colorData.colorName }}</div>
  </div>
</template>

<style>
.palette-swatch-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.palette-swatch {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-swatch-mini);
  border: var(--border-swatch);
  cursor: grab;
  position: relative;
  box-shadow: var(--shadow-swatch);
}

.palette-swatch:active {
  cursor: grabbing;
}

.palette-swatch.dragging {
  opacity: 0.5;
  transform: rotate(2deg) scale(0.98);
}

.palette-color-name {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-black);
  text-align: center;
  padding: 4px;
  pointer-events: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  line-height: 1;
}

.palette-swatch-container:has(.palette-swatch.dark-palette-swatch) .palette-color-name {
  color: var(--color-text-white);
}

@media (min-width: 1024px) {
  .palette-color-name {
    font-size: var(--font-size-base);
    padding: 8px;
    line-height: 1.2;
  }
}
</style>