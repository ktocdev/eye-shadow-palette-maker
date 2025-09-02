<script setup>
import { computed } from 'vue'
import { useDragDrop } from '../../composables/useDragDrop.js'
import { useSound } from '../../composables/useSound.js'
import { useColorSelection } from '../../composables/useColorSelection.js'
import { useColorEffects } from '../../composables/useColorEffects.js'

const props = defineProps({
  colorName: {
    type: String,
    required: true
  },
  hexCode: {
    type: String,
    required: true
  },
  backgroundColor: {
    type: String,
    required: true
  },
  isDark: {
    type: Boolean,
    default: false
  },
  effect: {
    type: String,
    default: 'matte'
  }
})

// Get carousel navigation from parent (will be injected)
const emit = defineEmits(['swipe-left', 'swipe-right', 'click'])

// Use sound composable
const { playUpSweep, playSharpClick } = useSound()

// Use color selection composable
const { selectColor, isColorSelected, clearSelection } = useColorSelection()

// Use color effects composable
const { getEffectClass } = useColorEffects()

// Use drag and drop composable with swipe handling
const { 
  isDragging,
  handleDragStart,
  handleDrag,
  handleDragEnd,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd
} = useDragDrop({
  onSwipeLeft: () => emit('swipe-left'),
  onSwipeRight: () => emit('swipe-right'),
  onDragStart: () => playUpSweep(),
  swipeThreshold: 50,
  swipeAngleThreshold: 30
})

// Create color data object
const colorData = computed(() => ({
  colorName: props.colorName,
  hexCode: props.hexCode,
  bgColor: props.backgroundColor,
  isDark: props.isDark,
  effect: props.effect
}))

// Handle click event
const handleClick = (e) => {
  // Only emit click if it's not a drag operation
  // Select the color instead of immediately placing it
  playSharpClick() // Sharp click for precise color selection
  selectColor(colorData.value)
  emit('click', colorData.value)
}

// Handle events with proper data
const onDragStart = (e) => {
  // Clear any selected color when starting a drag operation
  clearSelection()
  handleDragStart(e, colorData.value, false)
}
const onDrag = (e) => handleDrag(e)
const onDragEnd = (e) => handleDragEnd(e)
const onTouchStart = (e) => {
  // Clear any selected color when starting a touch drag operation
  clearSelection()
  handleTouchStart(e, colorData.value, false)
}
const onTouchMove = (e) => handleTouchMove(e)
const onTouchEnd = (e) => handleTouchEnd(e)
</script>

<template>
  <div class="carousel-swatch-block">
    <div 
      class="carousel-swatch" 
      :class="[getEffectClass(effect), { selected: isColorSelected(colorData) }]"
      :style="{ backgroundColor: backgroundColor }"
      draggable="true"
      @click="handleClick"
      @dragstart="onDragStart"
      @drag="onDrag"
      @dragend="onDragEnd"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    ></div>
    <div class="carousel-color-name">{{ colorName }}</div>
    <div class="carousel-hex-code">{{ hexCode }}</div>
  </div>
</template>

<style>
.carousel-swatch-block {
  width: 50px;
  /* height: 95px; */
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.carousel-swatch {
  width: 50px;
  height: 50px;
  border: var(--border-swatch);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-swatch);
  margin-bottom: 2px;
  cursor: grab;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.carousel-swatch:active {
  cursor: grabbing;
}

.carousel-swatch.dragging {
  opacity: 0.5;
  transform: rotate(5deg) scale(0.95);
}

.carousel-swatch.selected {
  border: var(--border-ornate);
  box-shadow: var(--shadow-swatch), 0 0 0 2px rgba(188, 179, 222, 0.3);
}

.carousel-color-name {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
}

/* Mobile constraints below 600px */
@media (max-width: 599px) {
  .carousel-color-name {
    max-height: 28px;
    max-width: 55px;
  }
}

/* Desktop - allow unlimited lines above 600px */
@media (min-width: 600px) {
  .carousel-color-name {
    line-clamp: unset;
    max-height: none;
  }
}

.carousel-hex-code {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: var(--line-height-tight);
  margin-top: 1px;
}

/* Responsive sizing for different container widths */
@container (min-width: 400px) and (max-width: 540px) {
  .carousel-swatch-block {
    width: 55px;
  }
  
  .carousel-swatch {
    width: 55px;
    height: 55px;
  }
}

@container (min-width: 540px) and (max-width: 650px) {
  .carousel-swatch-block {
    width: 65px;
    height: 105px;
  }
  
  .carousel-swatch {
    width: 65px;
    height: 65px;
  }
}

@container (min-width: 650px) and (max-width: 1024px) {
  .carousel-swatch-block {
    width: 85px;
    height: 115px;
  }
  
  .carousel-swatch {
    width: 85px;
    height: 85px;
    border-radius: var(--radius-lg);
  }

  .carousel-hex-code {
    font-size: var(--font-size-sm);
  }
}

@container (min-width: 1024px) {
  .carousel-swatch-block {
    width: 90px;
    height: 140px;
  }
  
  .carousel-swatch {
    width: 90px;
    height: 90px;
    border-radius: var(--radius-xl);
  }
  
  .carousel-color-name {
    font-size: var(--font-size-base);
  }

  .carousel-hex-code {
    font-size: var(--font-size-sm);
  }
}

/* Large Desktop (1440px and up) */
@container (min-width: 1440px) {
  .carousel-swatch-block {
    width: 110px;
    height: 170px;
  }
  
  .carousel-swatch {
    width: 110px;
    height: 110px;
    margin-bottom: 5px;
  }
  
  .carousel-color-name {
    font-size: var(--font-size-base);
  }
  
  .carousel-hex-code {
    font-size: var(--font-size-sm);
  }
}
</style>
