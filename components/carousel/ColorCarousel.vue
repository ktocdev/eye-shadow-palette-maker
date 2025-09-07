<script setup>
import { computed } from 'vue'
import CarouselSwatch from './CarouselSwatch.vue'
import BaseButton from '../ui/BaseButton.vue'
import { useCarousel } from '../../composables/carousel/useCarousel.js'
import { useSound } from '../../composables/utils/useSound.js'

const props = defineProps({
  colors: {
    type: Array,
    required: true
  },
  paletteName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['swatch-click', 'close'])

// Use carousel composable
const { 
  currentPage, 
  totalPages, 
  currentPageColors, 
  canGoPrev, 
  canGoNext, 
  goToPrevPage, 
  goToNextPage 
} = useCarousel(computed(() => props.colors))

// Use sound composable
const { playSharpClick, playDownSweep } = useSound()

// Handle arrow button clicks with sound
const handlePrevClick = () => {
  if (canGoPrev.value) {
    playSharpClick() // Higher-pitched navigation sound
    goToPrevPage()
  }
}

const handleNextClick = () => {
  if (canGoNext.value) {
    playSharpClick() // Higher-pitched navigation sound
    goToNextPage()
  }
}

// Handle swipe events from carousel swatches
const handleSwipeLeft = () => {
  if (canGoNext.value) {
    goToNextPage()
  }
}

const handleSwipeRight = () => {
  if (canGoPrev.value) {
    goToPrevPage()
  }
}

// Handle swatch click from CarouselSwatch
const handleSwatchClick = (colorData) => {
  emit('swatch-click', colorData)
}

// Handle close button click
const handleCloseClick = () => {
  playDownSweep() // Same sound as modal close
  emit('close')
}
</script>

<template>
  <div class="color-carousel">
    <button class="carousel-close" @click="handleCloseClick" aria-label="Close carousel">
      ×
    </button>
    <div class="carousel-container">
      <div class="carousel-left">
        <div class="carousel-info">{{ currentPage + 1 }} / {{ totalPages }}</div>
        <BaseButton
          @click="handlePrevClick"
          :disabled="!canGoPrev"
          variant="gray"
          class="carousel-arrow prev-arrow"
        >
          ‹
        </BaseButton>
      </div>
      
      <div class="carousel-swatches">
        <CarouselSwatch 
          v-for="color in currentPageColors" 
          :key="color.name"
          :color-name="color.name" 
          :hex-code="color.hex" 
          :background-color="color.hex"
          :is-dark="color.is_dark"
          :effect="color.effect"
          @swipe-left="handleSwipeLeft"
          @swipe-right="handleSwipeRight"
          @click="handleSwatchClick"
        />
      </div>
      
      <BaseButton
        @click="handleNextClick"
        :disabled="!canGoNext"
        variant="gray"
        class="carousel-arrow next-arrow"
      >
        ›
      </BaseButton>
    </div>
  </div>
</template>

<style>
.color-carousel {
  background: var(--gradient-container-primary);
  border-radius: var(--radius-container-large);
  box-shadow: var(--shadow-carousel);
  border: var(--border-container);
  padding: var(--font-size-base);
  min-width: 280px;
  position: relative;
}

.carousel-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  font-size: var(--font-size-base);
  line-height: var(--line-height-tight);
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
}

.carousel-close:hover {
  background: rgba(0, 0, 0, 0.2);
}

@media (max-width: 400px) {
  .color-carousel {
    width: 100%;
    max-width: none;
    min-width: auto;
    padding: 12px;
  }
}

@media (min-width: 401px) and (max-width: 480px) {
  .color-carousel {
    max-width: calc(100vw - 40px);
    min-width: 260px;
    padding: 12px;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .color-carousel {
    max-width: 500px;
  }
}

.carousel-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.carousel-info {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  text-align: center;
  min-width: 40px;
}

.carousel-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: auto;
  height: auto;
}

@container (min-width: 768px) {
  .carousel-container {
    width: min-content;
    align-items: center;
  }
}

.carousel-arrow {
  background: var(--gradient-arrow) !important;
  color: var(--color-text-white) !important;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-circle) !important;
  font-size: var(--font-size-xl);
  flex-shrink: 0;
  border: none !important;
  box-shadow: var(--shadow-button) !important;
}

.carousel-arrow:hover:not(.base-button--disabled) {
  background: var(--gradient-arrow-hover) !important;
  transform: scale(1.05);
  box-shadow: var(--shadow-button-hover) !important;
}

.carousel-arrow.base-button--disabled {
  background: var(--color-background-muted) !important;
  color: var(--color-text-muted) !important;
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: var(--shadow-button) !important;
}

.carousel-swatches {
  display: flex;
  gap: 6px;
  flex: 1;
  justify-content: flex-start;
  align-items: flex-start;
  height: auto;
}

@container (min-width: 1024px) {
  .color-carousel {
    padding: var(--font-size-2xl);
  }
  
  .carousel-swatches {
    gap: 15px;
  }

  .carousel-arrow {
    width: 50px;
    height: 50px;
    font-size: var(--font-size-2xl);
  }

  .carousel-info {
    font-size: var(--font-size-base);
    min-width: 50px;
  }
}
</style>
