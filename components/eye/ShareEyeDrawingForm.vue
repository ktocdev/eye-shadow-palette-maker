<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import { useEyeDrawingExport } from '../../composables/useEyeDrawingExport.js'
import { usePaletteStorage } from '../../composables/usePaletteStorage.js'

const props = defineProps({
  paletteId: {
    type: String,
    required: true
  },
  canvasRef: {
    type: Object,
    required: false,
    default: () => ({ value: null })
  }
})

// Palette storage to find palette by ID
const { findPaletteById, loadSavedPalettes } = usePaletteStorage()

const { 
  isExporting, 
  exportError, 
  exportEyeDrawingAsJPG, 
  copyEyeDrawingToClipboard, 
  shareEyeDrawingViaWebAPI,
  getEyeDrawingShareCapabilities 
} = useEyeDrawingExport()

const shareCapabilities = ref({})
const showSuccess = ref(false)
const successMessage = ref('')
const paletteData = ref(null)

// Get share capabilities on mount
onMounted(() => {
  shareCapabilities.value = getEyeDrawingShareCapabilities()
  // Load saved palettes 
  loadSavedPalettes()
})

// Load palette data when paletteId changes
watch(() => props.paletteId, (paletteId) => {
  if (paletteId) {
    const palette = findPaletteById(paletteId)
    if (palette) {
      paletteData.value = palette
      console.log('ShareEyeDrawingForm loaded palette:', palette.title)
    } else {
      console.error('Palette not found:', paletteId)
      paletteData.value = null
    }
  }
}, { immediate: true })

// Clear success message when palette changes
watch(() => props.paletteId, () => {
  showSuccess.value = false
  successMessage.value = ''
})

// Get palette colors for sharing
const paletteColors = computed(() => {
  if (!paletteData.value) return []
  
  return paletteData.value.colors.map(({ colorData }) => colorData) || []
})

const paletteTitle = computed(() => {
  return paletteData.value ? paletteData.value.title : 'My Eye Look'
})

// Get the actual canvas element
const getCanvasElement = () => {
  return props.canvasRef?.value || props.canvasRef
}

// Handle download as JPG
const handleDownloadJPG = async () => {
  try {
    await exportEyeDrawingAsJPG(getCanvasElement(), paletteColors.value, paletteTitle.value)
    showSuccess.value = true
    successMessage.value = 'Eye look downloaded successfully!'
  } catch (error) {
    console.error('Failed to download eye look:', error)
  }
}

// Handle copy to clipboard
const handleCopyToClipboard = async () => {
  try {
    await copyEyeDrawingToClipboard(getCanvasElement(), paletteColors.value, paletteTitle.value)
    showSuccess.value = true
    successMessage.value = 'Eye look copied to clipboard!'
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

// Handle web share
const handleWebShare = async () => {
  try {
    await shareEyeDrawingViaWebAPI(getCanvasElement(), paletteColors.value, paletteTitle.value)
    showSuccess.value = true
    successMessage.value = 'Eye look shared successfully!'
  } catch (error) {
    console.error('Failed to share:', error)
  }
}

// Computed properties for button states
const hasValidData = computed(() => {
  const canvas = getCanvasElement()
  const hasCanvas = !!canvas && canvas instanceof HTMLCanvasElement
  const hasPalette = !!paletteData.value
  const hasColors = paletteColors.value.length > 0
  
  console.log('ShareEyeDrawingForm validation:', {
    hasCanvas,
    hasPalette,
    hasColors,
    canvas,
    canvasRef: props.canvasRef,
    paletteData: paletteData.value,
    paletteColorsLength: paletteColors.value.length
  })
  
  return hasCanvas && hasPalette && hasColors
})

const canShare = computed(() => {
  return hasValidData.value && !isExporting.value
})

// Generate preview for display
const previewCanvas = ref(null)
const updatePreview = () => {
  if (hasValidData.value && previewCanvas.value) {
    const canvas = previewCanvas.value
    const ctx = canvas.getContext('2d')
    
    // Set small preview size
    canvas.width = 300
    canvas.height = 200
    
    // Clear with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw scaled eye canvas
    const eyeCanvas = getCanvasElement()
    if (eyeCanvas) {
      ctx.drawImage(eyeCanvas, 10, 10, 180, 135)
      
      // Add border
      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 1
      ctx.strokeRect(10, 10, 180, 135)
    }
    
    // Draw mini palette swatches
    const swatchSize = 20
    const startX = 200
    const startY = 15
    
    paletteColors.value.slice(0, 6).forEach((color, index) => {
      const row = Math.floor(index / 2)
      const col = index % 2
      
      const x = startX + col * (swatchSize + 4)
      const y = startY + row * (swatchSize + 4)
      
      ctx.fillStyle = color.bgColor || '#f0f0f0'
      ctx.fillRect(x, y, swatchSize, swatchSize)
      
      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, swatchSize, swatchSize)
    })
    
    // Add title
    ctx.fillStyle = '#333333'
    ctx.font = '12px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(paletteTitle.value, canvas.width / 2, canvas.height - 10)
  }
}

// Update preview when data changes  
watch([() => props.canvasRef, paletteColors, paletteTitle], updatePreview, { flush: 'post' })

// Watch for canvas to become available
watch(() => props.canvasRef, (newRef) => {
  if (newRef && (newRef.value || newRef instanceof HTMLCanvasElement)) {
    setTimeout(updatePreview, 100)
  }
}, { immediate: true, deep: true })

onMounted(() => {
  setTimeout(updatePreview, 200) // Increased delay to ensure canvas is ready
})
</script>

<template>
    <div v-if="!paletteData" class="error-message">
      <p>⚠️ Palette not found.</p>
    </div>
    
    <div v-else-if="!hasValidData" class="error-message">
      <p>⚠️ No eye drawing or palette data to share.</p>
    </div>
    
    <div v-else-if="showSuccess" class="success-section">
      <div class="success-message">
        <p>{{ successMessage }}</p>
      </div>
      <div class="dialog-actions">
        <BaseButton 
          @click="showSuccess = false"
          variant="blue"
          size="compact"
        >
          Share Again
        </BaseButton>
      </div>
    </div>
    
    <div v-else class="share-options">
      <p class="share-description">
        Choose how you'd like to share your "{{ paletteTitle }}" eye look:
      </p>
      
      <!-- Eye Drawing Preview -->
      <div class="preview-container">
        <canvas 
          ref="previewCanvas"
          class="preview-canvas"
        ></canvas>
      </div>
      
      <div class="share-buttons">
        <button 
          @click="handleDownloadJPG"
          :disabled="!canShare"
          class="share-btn"
          :class="{ 'share-btn--disabled': !canShare }"
        >
          <div class="share-btn-content">
            <div class="share-btn-title">Download as JPG</div>
            <div class="share-btn-subtitle">Save image to your device</div>
          </div>
        </button>
        
        <button 
          v-if="shareCapabilities.clipboard"
          @click="handleCopyToClipboard"
          :disabled="!canShare"
          class="share-btn"
          :class="{ 'share-btn--disabled': !canShare }"
        >
          <div class="share-btn-content">
            <div class="share-btn-title">Copy to Clipboard</div>
            <div class="share-btn-subtitle">Paste in other apps</div>
          </div>
        </button>
        
        <button 
          v-if="shareCapabilities.webShare"
          @click="handleWebShare"
          :disabled="!canShare"
          class="share-btn"
          :class="{ 'share-btn--disabled': !canShare }"
        >
          <div class="share-btn-content">
            <div class="share-btn-title">Share</div>
            <div class="share-btn-subtitle">Via social media, messages, etc.</div>
          </div>
        </button>
      </div>
      
      <div v-if="exportError" class="error-message">
        <p>❌ Error: {{ exportError }}</p>
      </div>
      
      <div v-if="isExporting" class="exporting-message">
        <p>🎨 Creating your eye look image...</p>
      </div>
    </div>
</template>

<style scoped>
.share-description {
  text-align: center;
  margin-bottom: 24px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.preview-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(139, 129, 165, 0.1);
  border-radius: var(--radius-md);
}

.preview-canvas {
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-sm);
  background: white;
}

.share-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.share-btn {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  width: 100%;
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
  min-height: auto;
  cursor: pointer;
}

.share-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(139, 129, 165, 0.4);
  box-shadow: 0 2px 8px rgba(139, 129, 165, 0.1);
}

.share-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.5);
}

.share-btn-content {
  flex: 1;
}

.share-btn-title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  margin-bottom: 2px;
}

.share-btn-subtitle {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.success-section {
  text-align: center;
}

.success-message {
  background: rgba(34, 139, 34, 0.1);
  color: #228B22;
  padding: 20px;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: var(--font-weight-semibold);
  margin-bottom: 24px;
  border: 1px solid rgba(34, 139, 34, 0.2);
}

.success-message p {
  margin: 0;
  font-size: var(--font-size-base);
}

.error-message {
  background: rgba(220, 20, 60, 0.1);
  color: #DC143C;
  padding: 16px;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: var(--font-weight-semibold);
  margin-bottom: 16px;
  border: 1px solid rgba(220, 20, 60, 0.2);
}

.error-message p {
  margin: 0;
}

.exporting-message {
  background: rgba(106, 90, 205, 0.1);
  color: rgba(106, 90, 205, 0.9);
  padding: 16px;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: var(--font-weight-semibold);
  margin-bottom: 16px;
  border: 1px solid rgba(106, 90, 205, 0.2);
}

.exporting-message p {
  margin: 0;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .share-btn {
    padding: 12px 16px;
    gap: 12px;
  }
  
  .share-btn-title {
    font-size: var(--font-size-sm);
  }
  
  .share-btn-subtitle {
    font-size: var(--font-size-xs);
  }
  
  .preview-canvas {
    width: 250px;
    height: 167px;
  }
}
</style>
