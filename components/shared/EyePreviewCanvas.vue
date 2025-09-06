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
  isErasing,
  hasAnyColors,
  canUndo,
  canRedo,
  skinTone,
  eyeColor,
  initializeCanvas,
  initializeCanvasLayers,
  startDrawing,
  continueDrawing,
  stopDrawing,
  clearAllColors,
  undoLastAction,
  redoLastAction,
  setSkinTone,
  setEyeColor,
  toggleEraser,
  setEraserMode
} = useEyeDrawing()

// Color selection
const { selectedColor: globalSelectedColor, selectColor } = useColorSelection()

const canvasElement = ref(null)
const paintCanvas = ref(null)
const eyeCanvas = ref(null)
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
  
  const tryInitialize = async () => {
    if (canvasElement.value && paintCanvas.value && eyeCanvas.value && attempts < maxAttempts) {
      console.log('Attempting to initialize multi-layer canvas system, attempt:', attempts + 1)
      const success = await initializeCanvasLayers(canvasElement.value, paintCanvas.value, eyeCanvas.value)
      
      // Verify canvases were initialized properly
      if (success && canvasElement.value.getContext('2d')) {
        console.log('Multi-layer canvas system initialized successfully')
        return
      }
    }
    
    attempts++
    if (attempts < maxAttempts) {
      setTimeout(tryInitialize, 50)
    } else {
      console.error('Failed to initialize multi-layer canvas system after', maxAttempts, 'attempts')
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
const handleSkinToneSelect = async (tone) => {
  await setSkinTone(tone.color)
}

// Handle eye color selection
const handleEyeColorSelect = async (color) => {
  await setEyeColor(color.color)
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
    <div class="eye-canvas-container" :style="{ backgroundColor: skinTone }">
      <div class="canvas-stack">
        <!-- Background layer: skin tone (handled by container background) -->
        
        <!-- Paint layer: user's eyeshadow drawing (erasable) -->
        <canvas
          ref="paintCanvas"
          class="canvas-layer paint-layer"
          width="600"
          height="350"
        ></canvas>
        
        <!-- Eye elements layer: SVG eye components (non-erasable) -->
        <canvas
          ref="eyeCanvas"
          class="canvas-layer eye-layer"
          width="600"
          height="350"
        ></canvas>
        
        <!-- Interaction layer: captures mouse events -->
        <canvas
          ref="canvasElement"
          class="canvas-layer interaction-layer"
          width="600"
          height="350"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          @mouseleave="handleCanvasMouseUp"
          @touchstart="handleCanvasTouchStart"
          @touchmove="handleCanvasTouchMove"
          @touchend="handleCanvasTouchEnd"
        ></canvas>
      </div>
    </div>
    
    <!-- Primary controls row -->
    <div class="primary-controls-row">
      <!-- Undo/Redo buttons -->
      <div class="control-group">
        <div class="undo-redo-buttons">
          <BaseButton
            @click="undoLastAction"
            :disabled="!canUndo"
            variant="gray"
            size="compact"
          >
            ↶ Undo
          </BaseButton>
          <BaseButton
            @click="redoLastAction"
            :disabled="!canRedo"
            variant="gray"
            size="compact"
          >
            ↷ Redo
          </BaseButton>
        </div>
      </div>
      
      <!-- Color selection -->
      <div class="control-group">
        <h4>Select Color</h4>
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
      
      <!-- Brush size -->
      <div class="control-group">
        <h4>Brush Size</h4>
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
        
        <h4>Brush Opacity</h4>
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
        
        <h4>Tool Mode</h4>
        <div class="brush-buttons">
          <button 
            @click="setEraserMode(false)"
            :class="{ 'active': !isErasing }"
            class="brush-btn tool-btn"
          >
            🎨 Paint
          </button>
          <button 
            @click="setEraserMode(true)"
            :class="{ 'active': isErasing }"
            class="brush-btn tool-btn eraser-btn"
          >
            🧽 Erase
          </button>
        </div>
      </div>
    </div>
    
    <!-- Secondary controls -->
    <div class="eye-controls">
      
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
  /* background color is now dynamic via :style binding */
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-md);
  padding: 20px;
  min-height: 320px;
  transition: background-color 0.2s ease;
}

.canvas-stack {
  position: relative;
  width: 600px;
  height: 350px;
  max-width: 100%;
  border: 2px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-sm);
}

.canvas-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 600px;
  height: 350px;
  max-width: 100%;
}

.paint-layer {
  z-index: 1;
  /* This layer will contain user's eyeshadow painting */
}

.eye-layer {
  z-index: 2;
  /* This layer contains SVG eye elements (non-erasable) */
}

.interaction-layer {
  z-index: 3;
  cursor: crosshair;
  /* This transparent layer captures mouse events */
  background: transparent;
}

.primary-controls-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.control-group:first-child {
  flex: 0 0 auto;
  min-width: 100px;
}

.control-group:nth-child(2) {
  flex: 2;
  min-width: 0;
}

.control-group:nth-child(3) {
  flex: 1.5;
  min-width: 200px;
}

.control-group h4 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.undo-redo-buttons {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.eye-controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.appearance-controls-section {
  grid-column: 1 / -1;
  width: 100%;
}

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
  justify-content: flex-start;
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
  gap: 6px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.brush-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  flex: 1;
  min-width: 0;
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

.eraser-btn.active {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.4);
  color: rgba(255, 107, 107, 0.9);
}

.tool-btn {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
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
