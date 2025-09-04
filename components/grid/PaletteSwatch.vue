<script setup>
import { computed } from 'vue'
import { useDragDrop } from '../../composables/useDragDrop.js'
import { useSound } from '../../composables/useSound.js'
import { useColorEffects } from '../../composables/useColorEffects.js'

const props = defineProps({
  colorData: {
    type: Object,
    required: true
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

const emit = defineEmits(['clear-swatch'])

// Use sound composable
const { playDownSweep, playCrumple } = useSound()

// Use color effects composable
const { getEffectClass } = useColorEffects()

// Use drag and drop composable with sound effects
const { 
  handleDragStart: handleMiniDragStart,
  handleDrag: handleMiniDrag,
  handleDragEnd: handleMiniDragEnd,
  handleTouchStart: handleMiniTouchStart,
  handleTouchMove: handleMiniTouchMove,
  handleTouchEnd: handleMiniTouchEnd
} = useDragDrop({
  onDragOut: () => playDownSweep()
})

// Handle drag events with proper data
const onMiniSwatchDragStart = (e) => {
  handleMiniDragStart(e, props.colorData, true)
}

const onMiniSwatchDrag = (e) => {
  handleMiniDrag(e)
}

const onMiniSwatchDragEnd = (e) => {
  // Check if this was a failed drop (dragged outside valid drop zones)
  const wasSuccessfulDrop = e.dataTransfer && e.dataTransfer.dropEffect !== 'none'
  
  handleMiniDragEnd(e)
  
  // If drag was not successful (dropped outside grid), remove this swatch
  if (!wasSuccessfulDrop) {
    console.log('PaletteSwatch dragged outside grid, removing:', props.colorData.colorName)
    playCrumple() // Play paper crumple sound
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
    playCrumple() // Play paper crumple sound
    emit('clear-swatch')
  }
}
</script>

<template>
  <div class="palette-swatch-container" :class="`container-${gridSize}x${gridSize}`">
    <div 
      class="palette-swatch"
      :class="[
        { 
          'dark-palette-swatch': colorData.isDark,
          'active': isActive
        },
        getEffectClass(colorData.effect),
        `size-${gridSize}x${gridSize}`
      ]"
      :style="{ backgroundColor: colorData.bgColor }"
      draggable="true"
      @dragstart="onMiniSwatchDragStart"
      @drag="onMiniSwatchDrag"
      @dragend="onMiniSwatchDragEnd"
      @touchstart="onMiniSwatchTouchStart"
      @touchmove="onMiniSwatchTouchMove"
      @touchend="onMiniSwatchTouchEnd"
    >
    </div>
    <div class="palette-color-name" :class="`text-${gridSize}x${gridSize}`">{{ colorData.colorName }}</div>
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
  border-radius: var(--radius-lg);
  border: var(--border-swatch);
  cursor: grab;
  position: relative;
  box-shadow: var(--shadow-swatch);
  transition: all 0.2s ease;
}

.palette-swatch:hover {
  box-shadow: var(--shadow-grid-cell-hover);
  transform: translateY(-2px) scale(1.01);
  border: 2px solid var(--color-purple-light);
}

.palette-swatch.active {
  box-shadow: var(--shadow-grid-cell-hover);
  transform: translateY(-2px) scale(1.01);
  border: 2px solid var(--color-purple-light);
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
  font-weight: var(--font-weight-normal);
  color: #333333; /* Default dark text for light swatches */
  text-align: center;
  pointer-events: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  line-height: var(--line-height-tight);
}

.palette-swatch-container:has(.palette-swatch.dark-palette-swatch) .palette-color-name {
  color: #f8f9fa; /* Light text for dark swatches */
}

/* Mobile first - base styles (smallest screens) */
.palette-color-name.text-2x2 {
  font-size: var(--font-size-xs);
  padding: 2px;
}

.palette-color-name.text-3x3 {
  font-size: var(--font-size-xs);
  padding: 2px;
}

.palette-color-name.text-4x4 {
  font-size: var(--font-size-xs);
  padding: 2px;
}

/* Tablet breakpoint - step up at 481px */
@media (min-width: 481px) {
  .palette-color-name.text-2x2 {
    font-size: var(--font-size-sm);
    padding: 4px;
  }
  
  .palette-color-name.text-3x3 {
    font-size: var(--font-size-xs);
    padding: 3px;
  }
  
  .palette-color-name.text-4x4 {
    font-size: var(--font-size-xs);
    padding: 3px;
  }
}

/* Desktop breakpoint - largest sizes at 769px */
@media (min-width: 769px) {
  .palette-color-name.text-2x2 {
    font-size: var(--font-size-base);
    padding: 8px;
  }
  
  .palette-color-name.text-3x3 {
    font-size: var(--font-size-sm);
    padding: 6px;
  }
  
  .palette-color-name.text-4x4 {
    font-size: var(--font-size-sm);
    padding: 5px;
  }
}
</style>
