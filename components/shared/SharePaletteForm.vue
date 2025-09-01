<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BaseButton from './BaseButton.vue'
import { usePaletteExport } from '../../composables/usePaletteExport.js'
import { usePaletteStorage } from '../../composables/usePaletteStorage.js'

const props = defineProps({
  paletteId: {
    type: String,
    required: true
  }
})

// Palette storage to find palette by ID
const { findPaletteById, loadSavedPalettes } = usePaletteStorage()

const { 
  isExporting, 
  exportError, 
  exportAsJPG, 
  copyToClipboard, 
  shareViaWebAPI,
  getShareCapabilities 
} = usePaletteExport()

const shareCapabilities = ref({})
const showSuccess = ref(false)
const successMessage = ref('')
const paletteData = ref(null)

// Get share capabilities on mount
onMounted(() => {
  shareCapabilities.value = getShareCapabilities()
  // Load saved palettes 
  loadSavedPalettes()
})

// Load palette data when paletteId changes
watch(() => props.paletteId, (paletteId) => {
  if (paletteId) {
    const palette = findPaletteById(paletteId)
    if (palette) {
      paletteData.value = palette
      console.log('SharePaletteForm loaded palette:', palette.title)
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

// Handle download as JPG
const handleDownloadJPG = async () => {
  try {
    await exportAsJPG(actualGridData.value, actualGridSize.value, actualTitle.value)
    showSuccess.value = true
    successMessage.value = 'Palette downloaded successfully!'
  } catch (error) {
    console.error('Failed to download palette:', error)
  }
}

// Handle copy to clipboard
const handleCopyToClipboard = async () => {
  try {
    await copyToClipboard(actualGridData.value, actualGridSize.value, actualTitle.value)
    showSuccess.value = true
    successMessage.value = 'Palette copied to clipboard!'
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

// Handle web share
const handleWebShare = async () => {
  try {
    await shareViaWebAPI(actualGridData.value, actualGridSize.value, actualTitle.value)
    showSuccess.value = true
    successMessage.value = 'Palette shared successfully!'
  } catch (error) {
    console.error('Failed to share:', error)
  }
}

// Computed properties for actual data to use
const actualGridData = computed(() => {
  if (!paletteData.value) return []
  
  // Convert saved palette data to grid format
  const gridSize = paletteData.value.gridSize || 2
  const totalCells = gridSize * gridSize
  const gridData = new Array(totalCells).fill(null)
  
  paletteData.value.colors.forEach(({ index, colorData }) => {
    if (index < totalCells) {
      gridData[index] = colorData
    }
  })
  
  return gridData
})

const actualGridSize = computed(() => {
  return paletteData.value ? paletteData.value.gridSize : 2
})

const actualTitle = computed(() => {
  return paletteData.value ? paletteData.value.title : 'My Palette'
})

// Computed properties for button states
const hasValidData = computed(() => {
  const data = actualGridData.value
  return data && data.length > 0 && data.some(cell => cell !== null)
})

const canShare = computed(() => {
  return hasValidData.value && !isExporting.value
})
</script>

<template>
  <div class="share-palette-content">
    <div v-if="!paletteData" class="error-message">
      <p>⚠️ Palette not found.</p>
    </div>
    
    <div v-else-if="!hasValidData" class="error-message">
      <p>⚠️ No palette data to share.</p>
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
        Choose how you'd like to share your "{{ actualTitle }}":
      </p>
      
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
        <p>🎨 Creating your palette image...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.share-palette-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.share-description {
  text-align: center;
  margin-bottom: 24px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
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
}
</style>