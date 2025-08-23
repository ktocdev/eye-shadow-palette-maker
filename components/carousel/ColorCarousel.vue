<script setup>
import { computed } from 'vue'
import CarouselSwatch from './CarouselSwatch.vue'
import { useCarousel } from '../../composables/useCarousel.js'

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
</script>

<template>
  <div class="color-carousel">
    <div class="carousel-container">
      <div class="carousel-left">
        <div class="carousel-info">{{ currentPage + 1 }} / {{ totalPages }}</div>
        <button 
          @click="goToPrevPage" 
          class="btn carousel-arrow prev-arrow"
          :disabled="!canGoPrev"
          :class="{ disabled: !canGoPrev }"
        >
          ‹
        </button>
      </div>
      
      <div class="carousel-swatches">
        <CarouselSwatch 
          v-for="color in currentPageColors" 
          :key="color.id"
          :color-name="color.name" 
          :hex-code="color.hex" 
          :background-color="color.hex"
          :is-dark="color.is_dark"
          :effect="color.effect"
        />
      </div>
      
      <button 
        @click="goToNextPage" 
        class="btn carousel-arrow next-arrow"
        :disabled="!canGoNext"
        :class="{ disabled: !canGoNext }"
      >
        ›
      </button>
    </div>
  </div>
</template>

<style>
.color-carousel {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--gradient-container-primary);
  border-radius: var(--radius-container-large);
  box-shadow: var(--shadow-carousel);
  border: var(--border-container);
  border-top: none;
  padding: var(--font-size-base);
  container-type: inline-size;
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
  width: min-content;
  margin: auto;
}

.carousel-arrow {
  background: var(--gradient-arrow);
  color: var(--color-text-white);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-circle);
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.carousel-arrow:hover:not(.disabled) {
  background: var(--gradient-arrow-hover);
  transform: scale(1.05);
}

.carousel-arrow.disabled {
  background: var(--color-background-muted);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.5;
}

.carousel-swatches {
  display: flex;
  gap: 6px;
  flex: 1;
  justify-content: center;
  min-height: 80px;
  align-items: flex-start;
}


/* Large Desktop (1440px and up) */
@container (min-width: 1440px) {
  .color-carousel {
    padding: var(--font-size-2xl);
  }
  
  .carousel-swatches {
    min-height: 140px;
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
