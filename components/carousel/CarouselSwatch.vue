<script setup>
import { computed } from 'vue'
import { useDragDrop } from '../../composables/useDragDrop.js'
import { useSound } from '../../composables/useSound.js'

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
const { playDragStart } = useSound()

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
  onDragStart: () => playDragStart(),
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
  // We check if the drag started but there was minimal movement
  emit('click', colorData.value)
}

// Handle events with proper data
const onDragStart = (e) => handleDragStart(e, colorData.value, false)
const onDrag = (e) => handleDrag(e)
const onDragEnd = (e) => handleDragEnd(e)
const onTouchStart = (e) => handleTouchStart(e, colorData.value, false)
const onTouchMove = (e) => handleTouchMove(e)
const onTouchEnd = (e) => handleTouchEnd(e)
</script>

<template>
  <div class="carousel-swatch-block">
    <div 
      class="carousel-swatch" 
      :class="`effect-${effect}`"
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
  height: 80px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.carousel-color-name {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: 1;
  white-space: normal;
  word-wrap: break-word;
}

.carousel-hex-code {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1;
  margin-top: 1px;
}

/* Responsive sizing for different container widths */
@container (min-width: 400px) and (max-width: 540px) {
  .carousel-swatch-block {
    width: 55px;
    height: 85px;
  }
  
  .carousel-swatch {
    width: 55px;
    height: 55px;
  }
  
  .carousel-color-name {
    min-height: 13px;
  }
}

@container (min-width: 540px) and (max-width: 650px) {
  .carousel-swatch-block {
    width: 65px;
    height: 95px;
  }
  
  .carousel-swatch {
    width: 65px;
    height: 65px;
  }
  
  .carousel-color-name {
    min-height: 14px;
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
  
  .carousel-color-name {
    font-size: var(--font-size-sm);
    min-height: 15px;
  }
}

@container (min-width: 1024px) {
  .carousel-swatch-block {
    width: 90px;
    height: 120px;
  }
  
  .carousel-swatch {
    width: 90px;
    height: 90px;
    border-radius: var(--radius-xl);
  }
  
  .carousel-color-name {
    font-size: var(--font-size-sm);
    min-height: 16px;
  }
}

/* Large Desktop (1440px and up) */
@container (min-width: 1440px) {
  .carousel-swatch-block {
    width: 110px;
    height: 160px;
  }
  
  .carousel-swatch {
    width: 110px;
    height: 110px;
    margin-bottom: 5px;
  }
  
  .carousel-color-name {
    font-size: var(--font-size-base);
    min-height: 18px;
  }
  
  .carousel-hex-code {
    font-size: var(--font-size-sm);
    height: 14px;
  }
}
</style>
