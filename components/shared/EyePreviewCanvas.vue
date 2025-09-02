<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import BaseButton from './BaseButton.vue'
import ShareEyeDrawingForm from './ShareEyeDrawingForm.vue'
import { useEyeDrawing, SKIN_TONES, EYE_COLORS } from '../../composables/useEyeDrawing.js'
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
  skinTone,
  eyeColor,
  initializeCanvas,
  startDrawing,
  continueDrawing,
  stopDrawing,
  clearAllColors,
  setSkinTone,
  setEyeColor
} = useEyeDrawing()

// Color selection
const { selectedColor: globalSelectedColor, selectColor } = useColorSelection()

const canvasElement = ref(null)
const activeColorIndex = ref(0)
const paletteColors = ref([])
const showShareForm = ref(false)

// Color selection from palette
const handleColorSelect = (colorData, index) => {
  selectColor(colorData)
  activeColorIndex.value = index
  selectedColor.value = colorData
}

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
        // Auto-select first color
        handleColorSelect(paletteColors.value[0], 0)
      }
    } else {
      console.error('Palette not found:', paletteId)
      paletteColors.value = []
      activeColorIndex.value = 0
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

// Handle canvas touch events for mobile
const handleCanvasTouchStart = (event) => {
  event.preventDefault() // Prevent scrolling/zooming
  if (!canvasElement.value || !globalSelectedColor.value) return
  
  const touch = event.touches[0]
  const rect = canvasElement.value.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  
  // Adjust for canvas scaling
  const scaleX = canvasElement.value.width / rect.width
  const scaleY = canvasElement.value.height / rect.height
  
  const canvasX = x * scaleX
  const canvasY = y * scaleY
  
  startDrawing(canvasX, canvasY)
}

const handleCanvasTouchMove = (event) => {
  event.preventDefault() // Prevent scrolling while drawing
  if (!canvasElement.value) return
  
  const touch = event.touches[0]
  const rect = canvasElement.value.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  
  // Adjust for canvas scaling
  const scaleX = canvasElement.value.width / rect.width
  const scaleY = canvasElement.value.height / rect.height
  
  const canvasX = x * scaleX
  const canvasY = y * scaleY
  
  continueDrawing(canvasX, canvasY)
}

const handleCanvasTouchEnd = (event) => {
  event.preventDefault()
  stopDrawing()
}

// Brush control handlers
const setBrushSize = (size) => {
  brushSize.value = size
}

const setBrushOpacity = (opacity) => {
  brushOpacity.value = opacity
}

// Handle skin tone selection
const handleSkinToneSelect = (tone) => {
  setSkinTone(tone.color)
}

// Handle eye color selection
const handleEyeColorSelect = (color) => {
  setEyeColor(color.color)
}

// Handle share button
const handleShare = () => {
  showShareForm.value = true
}

// Handle back to preview
const handleBackToPreview = () => {
  showShareForm.value = false
}
</script>

<template>
    <div v-if="showShareForm" class="share-section">
      <div class="share-header">
        <button @click="handleBackToPreview" class="back-button">
          ← Back to Preview
        </button>
        <h3>Share Your Eye Look</h3>
      </div>
      <ShareEyeDrawingForm 
        v-if="canvasElement"
        :palette-id="paletteId"
        :canvas-ref="canvasElement"
      />
      <div v-else class="loading-message">
        <p>Preparing canvas...</p>
      </div>
    </div>
    
    <div v-else class="preview-section">
      <p class="eye-preview-description">
        Select a color from your palette, then click and drag (or touch and drag) on the eye to paint eyeshadow.
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
        @touchstart="handleCanvasTouchStart"
        @touchmove="handleCanvasTouchMove"
        @touchend="handleCanvasTouchEnd"
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
      
      <!-- Skin & Eye Color Selection -->
      <div class="appearance-controls-section">
        <h3>Appearance</h3>
        <div class="appearance-controls">
          <div class="appearance-control-group">
            <label>Skin Tone</label>
            <div class="color-options">
              <button
                v-for="tone in SKIN_TONES"
                :key="tone.name"
                @click="handleSkinToneSelect(tone)"
                class="appearance-swatch"
                :class="{ 'active': skinTone === tone.color }"
                :style="{ backgroundColor: tone.color }"
                :title="tone.name"
              >
                <span class="appearance-swatch__check" v-if="skinTone === tone.color">✓</span>
              </button>
            </div>
          </div>
          
          <div class="appearance-control-group">
            <label>Eye Color</label>
            <div class="color-options">
              <button
                v-for="color in EYE_COLORS"
                :key="color.name"
                @click="handleEyeColorSelect(color)"
                class="appearance-swatch"
                :class="{ 'active': eyeColor === color.color }"
                :style="{ backgroundColor: color.color }"
                :title="color.name"
              >
                <span class="appearance-swatch__check" v-if="eyeColor === color.color">✓</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Brush controls -->
      <div class="brush-controls-section">
        <h3>Brush Settings</h3>
        <div class="brush-controls">
          <div class="brush-control-group">
            <label>Size</label>
            <div class="brush-buttons">
              <button 
                @click="setBrushSize(8)"
                :class="{ 'active': brushSize === 8 }"
                class="brush-btn"
              >
                Small
              </button>
              <button 
                @click="setBrushSize(15)"
                :class="{ 'active': brushSize === 15 }"
                class="brush-btn"
              >
                Medium
              </button>
              <button 
                @click="setBrushSize(25)"
                :class="{ 'active': brushSize === 25 }"
                class="brush-btn"
              >
                Large
              </button>
            </div>
          </div>
          
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
          <BaseButton
            @click="handleShare"
            :disabled="!hasAnyColors"
            variant="blue"
            size="compact"
          >
            Share Look
          </BaseButton>
          <BaseButton
            @click="clearAllColors"
            :disabled="!hasAnyColors"
            variant="red"
            size="compact"
          >
            Clear All
          </BaseButton>
        </div>
      </div>
    </div>
    </div>
</template>

<style scoped>
/* Container styles applied to modal-content by parent */

.share-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.share-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.back-button {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.back-button:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(139, 129, 165, 0.4);
}

.share-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.loading-message {
  text-align: center;
  padding: 40px;
  color: var(--color-text-secondary);
  font-style: italic;
}

.preview-section {
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
.appearance-controls-section h3,
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

.appearance-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appearance-control-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.appearance-swatch {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.appearance-swatch:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.appearance-swatch.active {
  border-color: rgba(106, 90, 205, 0.8);
  box-shadow: 0 0 0 2px rgba(106, 90, 205, 0.2);
}

.appearance-swatch__check {
  color: white;
  font-weight: var(--font-weight-bold);
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
  font-size: var(--font-size-sm);
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