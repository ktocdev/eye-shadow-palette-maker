<script setup>
import { ref, computed, onMounted } from 'vue'
import Modal from './Modal.vue'
import BaseButton from './BaseButton.vue'
import { usePaletteExport } from '../../composables/usePaletteExport.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  savedPaletteData: {
    type: Object,
    default: null
  },
  gridData: {
    type: Array,
    default: () => []
  },
  gridSize: {
    type: Number,
    default: 2
  },
  title: {
    type: String,
    default: 'My Palette'
  }
})

const emit = defineEmits(['update:modelValue'])

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

// Get share capabilities on mount
onMounted(() => {
  shareCapabilities.value = getShareCapabilities()
})

// Clear success message when modal opens/closes
const handleModalChange = (isOpen) => {
  emit('update:modelValue', isOpen)
  if (!isOpen) {
    showSuccess.value = false
    successMessage.value = ''
  } else {
    // Always start with the share options screen when opening
    showSuccess.value = false
    successMessage.value = ''
  }
}

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
  if (props.savedPaletteData) {
    // Convert saved palette data to grid format
    const gridSize = props.savedPaletteData.gridSize || 2
    const totalCells = gridSize * gridSize
    const gridData = new Array(totalCells).fill(null)
    
    props.savedPaletteData.colors.forEach(({ index, colorData }) => {
      if (index < totalCells) {
        gridData[index] = colorData
      }
    })
    
    return gridData
  }
  
  // Extract colorData from current grid format { index, colorData }
  return props.gridData.map(({ colorData }) => colorData)
})

const actualGridSize = computed(() => {
  return props.savedPaletteData ? props.savedPaletteData.gridSize : props.gridSize
})

const actualTitle = computed(() => {
  return props.savedPaletteData ? props.savedPaletteData.title : props.title
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
  <Modal 
    :model-value="modelValue" 
    @update:model-value="handleModalChange" 
    :dialog="true"
  >
    <h2>Share Palette</h2>
    
    <div v-if="!hasValidData" class="error-message">
      <p>⚠️ No palette data to share. Please create a palette first.</p>
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
        <BaseButton 
          @click="$emit('update:modelValue', false)"
          variant="gray"
          size="compact"
        >
          Close
        </BaseButton>
      </div>
    </div>
    
    <div v-else class="share-options">
      <p class="share-description">
        Choose how you'd like to share your {{ actualTitle }}:
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
      
      <div class="dialog-actions">
        <BaseButton 
          @click="$emit('update:modelValue', false)"
          variant="gray"
          size="compact"
        >
          Cancel
        </BaseButton>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
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
  
  .share-icon {
    font-size: var(--font-size-lg);
  }
  
  .share-btn-title {
    font-size: var(--font-size-sm);
  }
  
  .share-btn-subtitle {
    font-size: var(--font-size-xs);
  }
}
</style>