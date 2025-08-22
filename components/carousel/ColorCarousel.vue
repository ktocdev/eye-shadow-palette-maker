<script setup>
import { computed } from 'vue'
import SwatchBlock from '../swatch/SwatchBlock.vue'
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
        <SwatchBlock 
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
  padding: 15px;
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

/* Mobile carousel swatch blocks - fixed sizing */
.carousel-swatches .swatch-block {
  width: 50px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.carousel-swatches .swatch {
  width: 50px;
  height: 50px;
  margin-bottom: 2px;
  flex-shrink: 0;
  border-radius: var(--radius-swatch);
  box-shadow: var(--shadow-swatch);
}

.carousel-swatches .color-name {
  font-size: var(--font-size-xs);
  line-height: 1;
  text-align: center;
  max-width: 100%;
  white-space: normal;
  word-wrap: break-word;
  min-height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-swatches .hex-code {
  font-size: var(--font-size-xs);
  line-height: 1;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

/* Tablet swatch sizing - fixed dimensions */
/* @media (min-width: 481px) {
  .color-carousel {
    padding: 20px;
  }
  
  .carousel-swatches {
    min-height: 100px;
    gap: 8px;
  }

  .carousel-swatches .swatch-block {
    width: 70px;
    height: 100px;
  }

  .carousel-swatches .swatch {
    width: 70px;
    height: 70px;
    margin-bottom: 3px;
    border-radius: var(--radius-container);
  }

  .carousel-swatches .color-name {
    font-size: var(--font-size-xs);
    min-height: 14px;
  }

  .carousel-swatches .hex-code {
    font-size: var(--font-size-xs);
    height: 10px;
    margin-top: 2px;
  }
} */

/* Desktop layout adjustments - container queries handle sizing */
/* @media (min-width: 973px) {
  .color-carousel {
    padding: 25px;
  }
  
  .carousel-swatches {
    min-height: 120px;
    gap: 10px;
  }

  .carousel-swatches .swatch {
    margin-bottom: 4px;
    border-radius: var(--radius-lg);
  }

  .carousel-swatches .hex-code {
    height: 12px;
    margin-top: 2px;
  }
} */

/* Container Queries for smooth responsive transitions */
@container (max-width: 320px) {
  .carousel-swatches .swatch-block {
    width: 45px;
    height: 75px;
  }
  
  .carousel-swatches .swatch {
    width: 45px;
    height: 45px;
    border-radius: var(--radius-xs);
  }
  
  .carousel-swatches .color-name {
    font-size: var(--font-size-xs);
  }
  
  .carousel-swatches .hex-code {
    font-size: var(--font-size-xxs);
  }
}

@container (min-width: 400px) and (max-width: 540px) {
  .carousel-swatches .swatch-block {
    width: 55px;
    height: 85px;
  }
  
  .carousel-swatches .swatch {
    width: 55px;
    height: 55px;
    border-radius: var(--radius-swatch);
  }
  
  .carousel-swatches .color-name {
    font-size: var(--font-size-xs);
    min-height: 13px;
  }
  
  .carousel-swatches .hex-code {
    font-size: var(--font-size-xs);
  }
}

@container (min-width: 540px) and (max-width: 650px) {
  .carousel-swatches .swatch-block {
    width: 65px;
    height: 95px;
  }
  
  .carousel-swatches .swatch {
    width: 65px;
    height: 65px;
    border-radius: var(--radius-sm);
  }
  
  .carousel-swatches .color-name {
    font-size: var(--font-size-xs);
    min-height: 14px;
  }
  
  .carousel-swatches .hex-code {
    font-size: var(--font-size-xs);
  }
}

@container (min-width: 650px) and (max-width: 920px) {
  .carousel-swatches .swatch-block {
    width: 85px;
    height: 115px;
  }
  
  .carousel-swatches .swatch {
    width: 85px;
    height: 85px;
    border-radius: var(--radius-md);
  }
  
  .carousel-swatches .color-name {
    font-size: var(--font-size-sm);
    min-height: 15px;
  }
  
  .carousel-swatches .hex-code {
    font-size: var(--font-size-xs);
  }
}

@container (min-width: 920px) {
  .carousel-swatches .swatch-block {
    width: 90px;
    height: 120px;
  }
  
  .carousel-swatches .swatch {
    width: 90px;
    height: 90px;
    border-radius: var(--radius-lg);
  }
  
  .carousel-swatches .color-name {
    font-size: var(--font-size-sm);
    min-height: 16px;
  }
  
  .carousel-swatches .hex-code {
    font-size: var(--font-size-xs);
  }
}

/* Large Desktop (1440px and up) */
@container (min-width: 1440px) {
  .color-carousel {
    padding: 30px;
  }
  
  .carousel-swatches {
    min-height: 140px;
    gap: 15px;
  }

  .carousel-swatches .swatch-block {
    width: 110px;
    height: 160px;
  }
  
  .carousel-swatches .swatch {
    width: 110px;
    height: 110px;
    margin-bottom: 5px;
    border-radius: var(--radius-xl);
  }
  
  .carousel-swatches .color-name {
    font-size: var(--font-size-base);
    min-height: 18px;
  }
  
  .carousel-swatches .hex-code {
    font-size: var(--font-size-sm);
    height: 14px;
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