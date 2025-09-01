<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import BaseButton from './BaseButton.vue'
import { useEyeDrawing } from '../../composables/useEyeDrawing.js'
import { useColorSelection } from '../../composables/useColorSelection.js'
import { usePaletteStorage } from '../../composables/usePaletteStorage.js'

const props = defineProps({
  paletteId: {
    type: String,
    required: true
  }
})

// Palette storage to find palette by ID
const { findPaletteById, loadSavedPalettes } = usePaletteStorage()

// Eye drawing composable
const {
  canvasRef,
  selectedColor,
  brushSize,
  brushOpacity,
  hasAnyColors,
  initializeCanvas,
  startDrawing,
  continueDrawing,
  stopDrawing,
  clearAllColors
} = useEyeDrawing()

// Color selection
const { selectedColor: globalSelectedColor, selectColor } = useColorSelection()

const canvasElement = ref(null)
const activeColorIndex = ref(0)
const paletteColors = ref([])

// Load palette data when paletteId changes
watch(() => props.paletteId, (paletteId) => {
  if (paletteId) {
    const palette = findPaletteById(paletteId)
    if (palette) {
      // Extract colorData from palette.colors structure: [{ index: 0, colorData: {...} }]
      paletteColors.value = palette.colors.map(({ colorData }) => colorData) || []
      console.log('EyePreviewCanvas loaded palette:', palette.title, 'with colors:', paletteColors.value.length)
      if (paletteColors.value.length > 0) {
        console.log('First color example:', paletteColors.value[0])
      }
    } else {
      console.error('Palette not found:', paletteId)
      paletteColors.value = []
    }
  }
}, { immediate: true })

// Initialize canvas when component is ready
onMounted(async () => {
  // Load saved palettes first
  loadSavedPalettes()
  
  await nextTick()
  
  // Keep trying to initialize canvas until it's ready
  let attempts = 0
  const maxAttempts = 10
  
  const tryInitialize = () => {
    if (canvasElement.value && attempts < maxAttempts) {
      console.log('Attempting to initialize canvas, attempt:', attempts + 1)
      initializeCanvas(canvasElement.value)
      
      // Verify canvas was initialized properly
      if (canvasElement.value.getContext('2d')) {
        console.log('Canvas initialized successfully')
        return
      }
    }
    
    attempts++
    if (attempts < maxAttempts) {
      setTimeout(tryInitialize, 50)
    } else {
      console.error('Failed to initialize canvas after', maxAttempts, 'attempts')
    }
  }
  
  tryInitialize()
})

// Handle canvas mouse events for drawing
const handleCanvasMouseDown = (event) => {
  if (!canvasElement.value || !globalSelectedColor.value) return
  
  const rect = canvasElement.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Adjust for canvas scaling
  const scaleX = canvasElement.value.width / rect.width
  const scaleY = canvasElement.value.height / rect.height
  
  const canvasX = x * scaleX
  const canvasY = y * scaleY
  
  startDrawing(canvasX, canvasY)
}

const handleCanvasMouseMove = (event) => {
  if (!canvasElement.value) return
  
  const rect = canvasElement.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Adjust for canvas scaling
  const scaleX = canvasElement.value.width / rect.width
  const scaleY = canvasElement.value.height / rect.height
  
  const canvasX = x * scaleX
  const canvasY = y * scaleY
  
  continueDrawing(canvasX, canvasY)
}

const handleCanvasMouseUp = () => {
  stopDrawing()
}

// Color selection from palette
const handleColorSelect = (colorData, index) => {
  selectColor(colorData)
  activeColorIndex.value = index
  selectedColor.value = colorData
}

// Brush control handlers
const setBrushSize = (size) => {
  brushSize.value = size
}

const setBrushOpacity = (opacity) => {
  brushOpacity.value = opacity
}
</script>

<template>
  <div class="eye-preview-content">
    <p class="eye-preview-description">
      Select a color from your palette, then click and drag on the eye to paint eyeshadow.
    </p>
    
    <!-- Main eye preview area -->
    <div class="eye-canvas-container">
      <canvas
        ref="canvasElement"
        class="eye-canvas"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
        @mouseleave="handleCanvasMouseUp"
      ></canvas>
    </div>
    
    <!-- Controls section -->
    <div class="eye-controls">
      <!-- Color palette selection -->
      <div class="color-selection-section">
        <h3>Select Color</h3>
        <div v-if="paletteColors.length > 0" class="color-palette">
          <button
            v-for="(color, index) in paletteColors"
            :key="`eye-color-${index}`"
            @click="handleColorSelect(color, index)"
            class="color-swatch"
            :class="{ 'color-swatch--active': activeColorIndex === index }"
            :style="{ backgroundColor: color.bgColor }"
            :title="`${color.colorName} - ${color.hexCode}`"
          >
            <span class="color-swatch__check" v-if="activeColorIndex === index">✓</span>
          </button>
        </div>
        <div v-else class="no-colors-message">
          <p>No colors found in this palette.</p>
        </div>
      </div>
      
      <!-- Brush controls -->
      <div class="brush-controls-section">
        <h3>Brush Settings</h3>
        <div class="brush-controls">
          <div class="brush-control-group">
            <label>Opacity</label>
            <div class="brush-buttons">
              <button 
                @click="setBrushOpacity(0.3)"
                :class="{ 'active': brushOpacity === 0.3 }"
                class="brush-btn"
              >
                Light
              </button>
              <button 
                @click="setBrushOpacity(0.6)"
                :class="{ 'active': brushOpacity === 0.6 }"
                class="brush-btn"
              >
                Medium
              </button>
              <button 
                @click="setBrushOpacity(1.0)"
                :class="{ 'active': brushOpacity === 1.0 }"
                class="brush-btn"
              >
                Full
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="action-buttons-section">
        <div class="action-buttons">
          <button 
            @click="clearAllColors"
            :disabled="!hasAnyColors"
            class="action-btn danger"
            :class="{ 'disabled': !hasAnyColors }"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eye-preview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.eye-preview-description {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.eye-canvas-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-md);
  padding: 20px;
  min-height: 320px;
}

.eye-canvas {
  width: 400px;
  height: 300px;
  max-width: 100%;
  border: 2px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-sm);
  cursor: crosshair;
  background: white;
}

.eye-controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.color-selection-section h3,
.brush-controls-section h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 12px 0;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-swatch:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-swatch--active {
  border-color: rgba(106, 90, 205, 0.8);
  box-shadow: 0 0 0 2px rgba(106, 90, 205, 0.2);
}

.color-swatch__check {
  color: white;
  font-weight: var(--font-weight-bold);
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
  font-size: var(--font-size-base);
}

.no-colors-message {
  text-align: center;
  padding: 20px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}

.brush-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brush-control-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.brush-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.brush-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.brush-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(139, 129, 165, 0.4);
}

.brush-btn.active {
  background: rgba(106, 90, 205, 0.1);
  border-color: rgba(106, 90, 205, 0.4);
  color: rgba(106, 90, 205, 0.9);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  border: 1px solid;
}

.action-btn.danger {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.action-btn.danger:hover:not(.disabled) {
  background: rgba(220, 53, 69, 0.2);
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (min-width: 600px) {
  .eye-controls {
    grid-template-columns: 1fr 1fr;
  }
  
  .action-buttons-section {
    grid-column: 1 / -1;
  }
}

@media (max-width: 480px) {
  .eye-canvas-container {
    padding: 12px;
    min-height: 280px;
  }
  
  .color-swatch {
    width: 35px;
    height: 35px;
  }
  
  .brush-btn {
    padding: 6px 12px;
    font-size: var(--font-size-xs);
  }
}
</style>