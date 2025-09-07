<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import BaseButton from './BaseButton.vue'
import { useEyeDrawing, SKIN_TONES, EYE_COLORS } from '../../composables/useEyeDrawing.js'
import { useColorSelection } from '../../composables/useColorSelection.js'
import { usePaletteStorage } from '../../composables/usePaletteStorage.js'

const props = defineProps({
  paletteId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['eye-share'])

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
  createCompositeCanvas,
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
  // Create composite canvas for sharing
  if (paintCanvas.value && eyeCanvas.value) {
    console.log('Creating composite canvas for sharing')
    try {
      const composite = createCompositeCanvas(paintCanvas.value, eyeCanvas.value)
      console.log('Composite canvas created successfully, emitting eye-share event')
      emit('eye-share', composite)
    } catch (error) {
      console.error('Error creating composite canvas:', error)
    }
  } else {
    console.log('Canvas elements not available for sharing')
  }
}
</script>

<template>
    <div class="eye-preview-canvas">
      <p class="eye-preview-canvas__description">
        Select a color from your palette, then click and drag (or touch and drag) on the eye to paint eyeshadow.
      </p>
      <!-- Main eye preview area -->
      <div class="eye-preview-canvas__canvas-container" :style="{ backgroundColor: skinTone }">
        <div class="eye-preview-canvas__canvas-stack">
          <!-- Paint layer: user's eyeshadow drawing (erasable) -->
          <canvas
            ref="paintCanvas"
            class="eye-preview-canvas__canvas-layer eye-preview-canvas__canvas-layer--paint"
            width="600"
            height="350"
          ></canvas>
          
          <!-- Eye elements layer: SVG eye components (non-erasable) -->
          <canvas
            ref="eyeCanvas"
            class="eye-preview-canvas__canvas-layer eye-preview-canvas__canvas-layer--eye"
            width="600"
            height="350"
          ></canvas>
          
          <!-- Interaction layer: captures mouse events -->
          <canvas
            ref="canvasElement"
            class="eye-preview-canvas__canvas-layer eye-preview-canvas__canvas-layer--interaction"
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
      <div class="eye-preview-canvas__controls-primary">
        <!-- Undo/Redo buttons -->
        <div class="eye-preview-canvas__control-group eye-preview-canvas__control-group--undo">
          <div class="eye-preview-canvas__undo-buttons">
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
        <div class="eye-preview-canvas__control-group eye-preview-canvas__control-group--colors">
          <h4 class="eye-preview-canvas__control-title">Select Color</h4>
          <div v-if="paletteColors.length > 0" class="eye-preview-canvas__color-palette">
            <button
              v-for="(color, index) in paletteColors"
              :key="`eye-color-${index}`"
              @click="handleColorSelect(color, index)"
              class="eye-preview-canvas__color-swatch"
              :class="{ 'eye-preview-canvas__color-swatch--active': activeColorIndex === index }"
              :style="{ backgroundColor: color.bgColor }"
              :title="`${color.colorName} - ${color.hexCode}`"
            >
              <span class="eye-preview-canvas__color-swatch-check" v-if="activeColorIndex === index">✓</span>
            </button>
          </div>
          <div v-else class="eye-preview-canvas__no-colors">
            <p>No colors found in this palette.</p>
          </div>
        </div>
        
        <!-- Brush size -->
        <div class="eye-preview-canvas__control-group eye-preview-canvas__control-group--brush">
          <h4 class="eye-preview-canvas__control-title">Brush Size</h4>
          <div class="eye-preview-canvas__brush-buttons">
            <button 
              @click="setBrushSize(8)"
              :class="{ 'eye-preview-canvas__brush-btn--active': brushSize === 8 }"
              class="eye-preview-canvas__brush-btn"
            >
              Small
            </button>
            <button 
              @click="setBrushSize(15)"
              :class="{ 'eye-preview-canvas__brush-btn--active': brushSize === 15 }"
              class="eye-preview-canvas__brush-btn"
            >
              Medium
            </button>
            <button 
              @click="setBrushSize(25)"
              :class="{ 'eye-preview-canvas__brush-btn--active': brushSize === 25 }"
              class="eye-preview-canvas__brush-btn"
            >
              Large
            </button>
          </div>
          
          <h4 class="eye-preview-canvas__control-title">Brush Opacity</h4>
          <div class="eye-preview-canvas__brush-buttons">
            <button 
              @click="setBrushOpacity(0.3)"
              :class="{ 'eye-preview-canvas__brush-btn--active': brushOpacity === 0.3 }"
              class="eye-preview-canvas__brush-btn"
            >
              Light
            </button>
            <button 
              @click="setBrushOpacity(0.6)"
              :class="{ 'eye-preview-canvas__brush-btn--active': brushOpacity === 0.6 }"
              class="eye-preview-canvas__brush-btn"
            >
              Medium
            </button>
            <button 
              @click="setBrushOpacity(1.0)"
              :class="{ 'eye-preview-canvas__brush-btn--active': brushOpacity === 1.0 }"
              class="eye-preview-canvas__brush-btn"
            >
              Full
            </button>
          </div>
          
          <h4 class="eye-preview-canvas__control-title">Tool Mode</h4>
          <div class="eye-preview-canvas__brush-buttons">
            <button 
              @click="setEraserMode(false)"
              :class="{ 'eye-preview-canvas__brush-btn--active': !isErasing }"
              class="eye-preview-canvas__brush-btn eye-preview-canvas__brush-btn--tool"
            >
              🎨 Paint
            </button>
            <button 
              @click="setEraserMode(true)"
              :class="{ 'eye-preview-canvas__brush-btn--active': isErasing }"
              class="eye-preview-canvas__brush-btn eye-preview-canvas__brush-btn--tool eye-preview-canvas__brush-btn--eraser"
            >
              🧽 Erase
            </button>
          </div>
        </div>
      </div>
    
      <!-- Secondary controls -->
      <div class="eye-preview-canvas__controls-secondary">
        
        <!-- Skin & Eye Color Selection -->
        <div class="eye-preview-canvas__appearance-section">
          <h3 class="eye-preview-canvas__section-title">Appearance</h3>
          <div class="eye-preview-canvas__appearance-controls">
            <div class="eye-preview-canvas__appearance-control-group">
              <label class="eye-preview-canvas__appearance-group-label">Skin Tone</label>
              <div class="eye-preview-canvas__appearance-options">
                <button
                  v-for="tone in SKIN_TONES"
                  :key="tone.name"
                  @click="handleSkinToneSelect(tone)"
                  class="eye-preview-canvas__appearance-swatch"
                  :class="{ 'eye-preview-canvas__appearance-swatch--active': skinTone === tone.color }"
                  :style="{ backgroundColor: tone.color }"
                  :title="tone.name"
                >
                  <span class="eye-preview-canvas__appearance-swatch-check" v-if="skinTone === tone.color">✓</span>
                </button>
              </div>
            </div>
            
            <div class="eye-preview-canvas__appearance-control-group">
              <label class="eye-preview-canvas__appearance-group-label">Eye Color</label>
              <div class="eye-preview-canvas__appearance-options">
                <button
                  v-for="color in EYE_COLORS"
                  :key="color.name"
                  @click="handleEyeColorSelect(color)"
                  class="eye-preview-canvas__appearance-swatch"
                  :class="{ 'eye-preview-canvas__appearance-swatch--active': eyeColor === color.color }"
                  :style="{ backgroundColor: color.color }"
                  :title="color.name"
                >
                  <span class="eye-preview-canvas__appearance-swatch-check" v-if="eyeColor === color.color">✓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="eye-preview-canvas__action-section">
          <div class="eye-preview-canvas__action-buttons">
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

<style>
/* ===== EYE PREVIEW CANVAS COMPONENT - BEM METHODOLOGY ===== */

.eye-preview-canvas {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .eye-preview-canvas {
    gap: 24px;
  }
}

.eye-preview-canvas__description {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  margin: 0;
  padding: 0 8px;
}

@media (min-width: 768px) {
  .eye-preview-canvas__description {
    font-size: var(--font-size-sm);
    padding: 0;
  }
}

/* Canvas Container */
.eye-preview-canvas__canvas-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-md);
  padding: 12px;
  min-height: 200px;
  transition: background-color 0.2s ease;
}

@media (min-width: 480px) {
  .eye-preview-canvas__canvas-container {
    min-height: 280px;
    padding: 16px;
  }
}

@media (min-width: 768px) {
  .eye-preview-canvas__canvas-container {
    padding: 20px;
    min-height: 320px;
  }
}

.eye-preview-canvas__canvas-stack {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 240px;
  border-radius: var(--radius-sm);
}

@media (min-width: 480px) {
  .eye-preview-canvas__canvas-stack {
    max-width: 500px;
    height: 300px;
  }
}

@media (min-width: 768px) {
  .eye-preview-canvas__canvas-stack {
    width: 600px;
    height: 350px;
    max-width: 600px;
  }
}

.eye-preview-canvas__canvas-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.eye-preview-canvas__canvas-layer--paint {
  z-index: 1;
}

.eye-preview-canvas__canvas-layer--eye {
  z-index: 2;
}

.eye-preview-canvas__canvas-layer--interaction {
  z-index: 3;
  cursor: crosshair;
  background: transparent;
}


/* Primary Controls */
.eye-preview-canvas__controls-primary {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .eye-preview-canvas__controls-primary {
    flex-direction: row;
    gap: 24px;
    align-items: flex-start;
    margin-bottom: 24px;
  }
}

.eye-preview-canvas__control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

@media (min-width: 768px) {
  .eye-preview-canvas__control-group {
    gap: 8px;
    flex: 1;
  }

  .eye-preview-canvas__control-group--undo {
    flex: 0 0 auto;
    min-width: 100px;
  }

  .eye-preview-canvas__control-group--colors {
    flex: 2;
    min-width: 0;
  }

  .eye-preview-canvas__control-group--brush {
    flex: 1.5;
    min-width: 200px;
  }
}

.eye-preview-canvas__control-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

@media (min-width: 768px) {
  .eye-preview-canvas__control-title {
    font-size: var(--font-size-sm);
  }
}

.eye-preview-canvas__undo-buttons {
  display: flex;
  gap: 6px;
}

@media (min-width: 768px) {
  .eye-preview-canvas__undo-buttons {
    flex-direction: column;
    gap: 8px;
  }
}

/* Color Palette */
.eye-preview-canvas__color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-start;
}

@media (min-width: 768px) {
  .eye-preview-canvas__color-palette {
    gap: 8px;
  }
}

.eye-preview-canvas__color-swatch {
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

@media (min-width: 768px) {
  .eye-preview-canvas__color-swatch {
    width: 40px;
    height: 40px;
  }
}

.eye-preview-canvas__color-swatch:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.eye-preview-canvas__color-swatch--active {
  border-color: rgba(106, 90, 205, 0.8);
  box-shadow: 0 0 0 2px rgba(106, 90, 205, 0.2);
}

.eye-preview-canvas__color-swatch-check {
  color: white;
  font-weight: var(--font-weight-bold);
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
  font-size: var(--font-size-xs);
}

@media (min-width: 768px) {
  .eye-preview-canvas__color-swatch-check {
    font-size: var(--font-size-base);
  }
}

.eye-preview-canvas__no-colors {
  text-align: center;
  padding: 16px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

@media (min-width: 768px) {
  .eye-preview-canvas__no-colors {
    padding: 20px;
  }
}

/* Brush Controls */
.eye-preview-canvas__brush-buttons {
  display: flex;
  gap: 4px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .eye-preview-canvas__brush-buttons {
    gap: 6px;
  }
}

.eye-preview-canvas__brush-btn {
  padding: 4px 8px;
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

@media (min-width: 768px) {
  .eye-preview-canvas__brush-btn {
    padding: 6px 12px;
  }
}

.eye-preview-canvas__brush-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(139, 129, 165, 0.4);
}

.eye-preview-canvas__brush-btn--active {
  background: rgba(106, 90, 205, 0.1);
  border-color: rgba(106, 90, 205, 0.4);
  color: rgba(106, 90, 205, 0.9);
}

.eye-preview-canvas__brush-btn--tool {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

@media (min-width: 768px) {
  .eye-preview-canvas__brush-btn--tool {
    font-size: var(--font-size-sm);
  }
}

.eye-preview-canvas__brush-btn--eraser.eye-preview-canvas__brush-btn--active {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.4);
  color: rgba(255, 107, 107, 0.9);
}

/* Secondary Controls */
.eye-preview-canvas__controls-secondary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .eye-preview-canvas__controls-secondary {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

.eye-preview-canvas__section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

@media (min-width: 768px) {
  .eye-preview-canvas__section-title {
    font-size: var(--font-size-base);
    margin: 0 0 12px 0;
  }
}

.eye-preview-canvas__appearance-section {
  grid-column: 1 / -1;
  width: 100%;
}

@media (min-width: 768px) {
  .eye-preview-canvas__appearance-section {
    grid-column: auto;
  }
}

.eye-preview-canvas__appearance-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 768px) {
  .eye-preview-canvas__appearance-controls {
    gap: 16px;
  }
}

.eye-preview-canvas__appearance-group-label {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

@media (min-width: 768px) {
  .eye-preview-canvas__appearance-group-label {
    font-size: var(--font-size-sm);
    margin-bottom: 8px;
  }
}

.eye-preview-canvas__appearance-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

@media (min-width: 768px) {
  .eye-preview-canvas__appearance-options {
    gap: 6px;
  }
}

.eye-preview-canvas__appearance-swatch {
  width: 28px;
  height: 28px;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

@media (min-width: 768px) {
  .eye-preview-canvas__appearance-swatch {
    width: 32px;
    height: 32px;
  }
}

.eye-preview-canvas__appearance-swatch:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.eye-preview-canvas__appearance-swatch--active {
  border-color: rgba(106, 90, 205, 0.8);
  box-shadow: 0 0 0 2px rgba(106, 90, 205, 0.2);
}

.eye-preview-canvas__appearance-swatch-check {
  color: white;
  font-weight: var(--font-weight-bold);
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
  font-size: var(--font-size-xs);
}

@media (min-width: 768px) {
  .eye-preview-canvas__appearance-swatch-check {
    font-size: var(--font-size-sm);
  }
}

/* Action Buttons */
.eye-preview-canvas__action-section {
  grid-column: 1 / -1;
}

.eye-preview-canvas__action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .eye-preview-canvas__action-buttons {
    gap: 12px;
  }
}
</style>
