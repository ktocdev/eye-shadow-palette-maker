<script setup>
import { onMounted, onUnmounted } from 'vue'

// Components
import ColorCarousel from './carousel/ColorCarousel.vue'
import GridControls from './grid/GridControls.vue'
import PaletteGrid from './grid/PaletteGrid.vue'
import PaletteControls from './shared/PaletteControls.vue'

// Composables
import { useColorData } from '../composables/useColorData.js'
import { ref } from 'vue'

// Use color data composable
const { palette, allColors } = useColorData()

// Reference to PaletteGrid component
const paletteGridRef = ref(null)

// Track current grid size
const currentGridSize = ref(4)

// Handle grid size changes
const handleGridSizeChange = (newSize) => {
  currentGridSize.value = newSize
  console.log('Grid size changed to:', newSize)
}

// Handle palette controls
const handleClear = () => {
  paletteGridRef.value?.clearGrid()
}

const handleRandomize = () => {
  paletteGridRef.value?.generateRandomPalette()
}
</script>

<template>
  <div class="swatches-explorer page-container typography-base">
    
    <ColorCarousel
      :colors="allColors"
      :palette-name="palette.name"
    />
    
    <div class="main-content main-content-layout">
      <div class="palette-container">
        <PaletteGrid
          ref="paletteGridRef"
          :colors="allColors"
          :initial-grid-size="4"
          :grid-size="currentGridSize"
          @grid-size-change="handleGridSizeChange"
        />
        
        <div class="palette-hinges">
          <div class="hinge left-hinge"></div>
          <div class="hinge right-hinge"></div>
        </div>
        
        <div class="palette-lid__container">
          <div class="palette-lid">
            <div class="app-info">
              <h1>Eye Shadow Palette Maker</h1>
              <p>Create beautiful eyeshadow combinations</p>
            </div>

            <GridControls
              :grid-size="currentGridSize"
              @size-change="handleGridSizeChange"
            />

            <PaletteControls 
              @clear="handleClear"
              @randomize="handleRandomize"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import '../styles/shared.css';

.swatches-explorer {
  background: var(--gradient-main-background);
}

.palette-container {
  position: relative;
}

@media (min-width: 769px) {
  .swatches-explorer,
  .main-content {
    padding: 20px;
  }
}
</style>