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
  handleMiniDragEnd(e)
  // Check if the swatch was moved and emit clear event if needed
  setTimeout(() => {
    // Check if this component's element still exists in the DOM
    if (!e.target.closest('.palette-swatch-container')) {
      emit('clear-swatch')
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