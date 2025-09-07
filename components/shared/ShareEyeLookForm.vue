<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BaseButton from './BaseButton.vue'
import { useEyeDrawingExport } from '../../composables/useEyeDrawingExport.js'
import { usePaletteStorage } from '../../composables/usePaletteStorage.js'

const props = defineProps({
  paletteId: {
    type: String,
    required: true
  },
  compositeCanvas: {
    type: [HTMLCanvasElement, Object],
    required: true
  }
})

const emit = defineEmits(['back-to-preview'])

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
const previewCanvas = ref(null)
const previewImageSrc = ref(null)

// Get share capabilities on mount
onMounted(() => {
  shareCapabilities.value = getEyeDrawingShareCapabilities()
  loadSavedPalettes()
  generatePreviewImage()
})

// Load palette data when paletteId changes
watch(() => props.paletteId, (paletteId) => {
  if (paletteId) {
    const palette = findPaletteById(paletteId)
    if (palette) {
      paletteData.value = palette
      console.log('ShareEyeLookForm loaded palette:', palette.title)
    } else {
      console.error('Palette not found:', paletteId)
      paletteData.value = null
    }
  }
}, { immediate: true })

// Get palette colors for sharing
const paletteColors = computed(() => {
  if (!paletteData.value) return []
  return paletteData.value.colors.map(({ colorData }) => colorData) || []
})

// Generate preview when canvas or palette changes
watch([() => props.compositeCanvas, paletteColors], () => {
  // Reset cached image when dependencies change
  previewImageSrc.value = null
  generatePreviewImage()
}, { flush: 'post' })

const paletteTitle = computed(() => {
  return paletteData.value ? paletteData.value.title : 'My Eye Look'
})

// Get the actual canvas element
const getCanvasElement = () => {
  return props.compositeCanvas?.value || props.compositeCanvas
}

// Generate and cache preview image
function generatePreviewImage() {
  // Only generate if we don't have a cached preview and have valid data
  if (!previewImageSrc.value && hasValidData.value) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Set preview size
    canvas.width = 300
    canvas.height = 200
    
    // Clear with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw scaled eye canvas
    const eyeCanvas = getCanvasElement()
    if (eyeCanvas && eyeCanvas instanceof HTMLCanvasElement) {
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
    
    // Cache as data URL
    previewImageSrc.value = canvas.toDataURL('image/png')
  }
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

// Handle back navigation
const handleBackToPreview = () => {
  emit('back-to-preview')
}

// Clear success message and go to share again
const handleShareAgain = () => {
  showSuccess.value = false
  successMessage.value = ''
  // Preview image is already cached, no need to regenerate
}

// Computed properties for button states
const hasValidData = computed(() => {
  const canvas = getCanvasElement()
  const hasCanvas = !!canvas && (canvas instanceof HTMLCanvasElement || canvas?.tagName === 'CANVAS')
  const hasPalette = !!paletteData.value
  const hasColors = paletteColors.value.length > 0
  
  return hasCanvas && hasPalette && hasColors
})

const canShare = computed(() => {
  return hasValidData.value && !isExporting.value
})
</script>

<template>
  <div class="share-eye-look">
    <!-- Error states -->
    <div v-if="!paletteData" class="share-eye-look__error">
      <p>⚠️ Palette not found.</p>
    </div>
    
    <div v-else-if="!hasValidData" class="share-eye-look__error">
      <p>⚠️ No eye drawing data available to share.</p>
    </div>
    
    <!-- Success state -->
    <div v-else-if="showSuccess" class="share-eye-look__success">
      <div class="share-eye-look__success-message">
        <p>{{ successMessage }}</p>
      </div>
      <div class="share-eye-look__actions">
        <BaseButton 
          @click="handleShareAgain"
          variant="blue"
          size="compact"
        >
          Share Again
        </BaseButton>
        <BaseButton 
          @click="handleBackToPreview"
          variant="gray"
          size="compact"
        >
          Back to Preview
        </BaseButton>
      </div>
    </div>
    
    <!-- Main share interface -->
    <div v-else class="share-eye-look__content">
      <div class="share-eye-look__description">
        <p>Share your "{{ paletteTitle }}" eye look:</p>
      </div>
      
      <!-- Eye Drawing Preview -->
      <div class="share-eye-look__preview">
        <img 
          v-if="previewImageSrc"
          :src="previewImageSrc"
          alt="Eye look preview"
          class="share-eye-look__preview-image"
        />
        <div v-else class="share-eye-look__preview-placeholder">
          <p>Generating preview...</p>
        </div>
      </div>
      
      <!-- Share Options -->
      <div class="share-eye-look__options">
        <button 
          @click="handleDownloadJPG"
          :disabled="!canShare"
          class="share-eye-look__option"
          :class="{ 'share-eye-look__option--disabled': !canShare }"
        >
          <div class="share-eye-look__option-content">
            <div class="share-eye-look__option-title">Download as JPG</div>
            <div class="share-eye-look__option-subtitle">Save image to your device</div>
          </div>
        </button>
        
        <button 
          v-if="shareCapabilities.clipboard"
          @click="handleCopyToClipboard"
          :disabled="!canShare"
          class="share-eye-look__option"
          :class="{ 'share-eye-look__option--disabled': !canShare }"
        >
          <div class="share-eye-look__option-content">
            <div class="share-eye-look__option-title">Copy to Clipboard</div>
            <div class="share-eye-look__option-subtitle">Paste in other apps</div>
          </div>
        </button>
        
        <button 
          v-if="shareCapabilities.webShare"
          @click="handleWebShare"
          :disabled="!canShare"
          class="share-eye-look__option"
          :class="{ 'share-eye-look__option--disabled': !canShare }"
        >
          <div class="share-eye-look__option-content">
            <div class="share-eye-look__option-title">Share</div>
            <div class="share-eye-look__option-subtitle">Via social media, messages, etc.</div>
          </div>
        </button>
      </div>
      
      <!-- Error/Loading Messages -->
      <div v-if="exportError" class="share-eye-look__error">
        <p>❌ Error: {{ exportError }}</p>
      </div>
      
      <div v-if="isExporting" class="share-eye-look__loading">
        <p>🎨 Creating your eye look image...</p>
      </div>
    </div>
  </div>
</template>

<style>
/* ===== SHARE EYE LOOK COMPONENT - BEM METHODOLOGY ===== */

.share-eye-look {
  padding: 16px;
  max-width: 100%;
}

@media (min-width: 768px) {
  .share-eye-look {
    padding: 24px;
  }
}

.share-eye-look__description {
  text-align: center;
  margin-bottom: 16px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@media (min-width: 768px) {
  .share-eye-look__description {
    font-size: var(--font-size-base);
    margin-bottom: 24px;
  }
}

.share-eye-look__preview {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(139, 129, 165, 0.1);
  border-radius: var(--radius-md);
}

@media (min-width: 768px) {
  .share-eye-look__preview {
    padding: 20px;
  }
}

.share-eye-look__preview-image {
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-sm);
  background: white;
  width: 250px;
  height: 167px;
  object-fit: contain;
}

@media (min-width: 768px) {
  .share-eye-look__preview-image {
    width: 300px;
    height: 200px;
  }
}

.share-eye-look__preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.8);
  width: 250px;
  height: 167px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@media (min-width: 768px) {
  .share-eye-look__preview-placeholder {
    width: 300px;
    height: 200px;
  }
}

.share-eye-look__options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.share-eye-look__option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  width: 100%;
  border: 1px solid rgba(139, 129, 165, 0.2);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: var(--font-size-sm);
}

@media (min-width: 768px) {
  .share-eye-look__option {
    padding: 16px 20px;
    font-size: var(--font-size-base);
  }
}

.share-eye-look__option:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(139, 129, 165, 0.4);
  box-shadow: 0 2px 8px rgba(139, 129, 165, 0.1);
}

.share-eye-look__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.5);
}

.share-eye-look__option-content {
  flex: 1;
  text-align: left;
}

.share-eye-look__option-title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  margin-bottom: 2px;
}

@media (min-width: 768px) {
  .share-eye-look__option-title {
    font-size: var(--font-size-base);
  }
}

.share-eye-look__option-subtitle {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

@media (min-width: 768px) {
  .share-eye-look__option-subtitle {
    font-size: var(--font-size-sm);
  }
}

.share-eye-look__success {
  text-align: center;
}

.share-eye-look__success-message {
  background: rgba(34, 139, 34, 0.1);
  color: #228B22;
  padding: 16px;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: var(--font-weight-semibold);
  margin-bottom: 20px;
  border: 1px solid rgba(34, 139, 34, 0.2);
  font-size: var(--font-size-sm);
}

@media (min-width: 768px) {
  .share-eye-look__success-message {
    padding: 20px;
    margin-bottom: 24px;
    font-size: var(--font-size-base);
  }
}

.share-eye-look__success-message p {
  margin: 0;
}

.share-eye-look__error {
  background: rgba(220, 20, 60, 0.1);
  color: #DC143C;
  padding: 12px;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: var(--font-weight-semibold);
  margin-bottom: 16px;
  border: 1px solid rgba(220, 20, 60, 0.2);
  font-size: var(--font-size-sm);
}

@media (min-width: 768px) {
  .share-eye-look__error {
    padding: 16px;
    font-size: var(--font-size-base);
  }
}

.share-eye-look__error p {
  margin: 0;
}

.share-eye-look__loading {
  background: rgba(106, 90, 205, 0.1);
  color: rgba(106, 90, 205, 0.9);
  padding: 12px;
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: var(--font-weight-semibold);
  margin-bottom: 16px;
  border: 1px solid rgba(106, 90, 205, 0.2);
  font-size: var(--font-size-sm);
}

@media (min-width: 768px) {
  .share-eye-look__loading {
    padding: 16px;
    font-size: var(--font-size-base);
  }
}

.share-eye-look__loading p {
  margin: 0;
}

.share-eye-look__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .share-eye-look__actions {
    gap: 16px;
  }
}
</style>