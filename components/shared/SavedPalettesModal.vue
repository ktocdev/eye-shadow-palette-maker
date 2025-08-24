<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import MiniPalette from './MiniPalette.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const savedPalettes = ref([])

// Load saved palettes from localStorage
const loadSavedPalettes = () => {
  try {
    const saved = localStorage.getItem('eyeshadow-saved-palettes')
    if (saved) {
      savedPalettes.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading saved palettes:', error)
    savedPalettes.value = []
  }
}

const closeSavedPalettesModal = () => {
  emit('update:modelValue', false)
}

const handleEscapeKey = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    closeSavedPalettesModal()
  }
}

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    closeSavedPalettesModal()
  }
}

// Load saved palettes when component mounts and when modal opens
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  loadSavedPalettes()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})

// Reload palettes when modal opens (in case new ones were saved)
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadSavedPalettes()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Test palette data for demo when no saved palettes exist
const testPaletteData = {
  title: 'Electric Dreams & Forgotten Sunsets',
  gridSize: 4,
  colors: [
    { index: 0, colorData: { hex: '#FF1493', effect: 'sparkly', name: 'Deep Pink' } },
    { index: 1, colorData: { hex: '#00FF7F', effect: 'matte', name: 'Spring Green' } },
    { index: 2, colorData: { hex: '#FFD700', effect: 'shimmer', name: 'Gold' } },
    { index: 3, colorData: { hex: '#8A2BE2', effect: 'sparkly', name: 'Blue Violet' } },
    { index: 4, colorData: { hex: '#FF4500', effect: 'matte', name: 'Orange Red' } },
    { index: 5, colorData: { hex: '#40E0D0', effect: 'shimmer', name: 'Turquoise' } },
    { index: 6, colorData: { hex: '#DC143C', effect: 'sparkly', name: 'Crimson' } },
    { index: 7, colorData: { hex: '#ADFF2F', effect: 'matte', name: 'Green Yellow' } },
    { index: 8, colorData: { hex: '#FF69B4', effect: 'shimmer', name: 'Hot Pink' } },
    { index: 9, colorData: { hex: '#4169E1', effect: 'sparkly', name: 'Royal Blue' } },
    { index: 10, colorData: { hex: '#FF8C00', effect: 'matte', name: 'Dark Orange' } },
    { index: 11, colorData: { hex: '#9932CC', effect: 'shimmer', name: 'Dark Orchid' } },
    { index: 12, colorData: { hex: '#32CD32', effect: 'sparkly', name: 'Lime Green' } },
    { index: 13, colorData: { hex: '#FF6347', effect: 'matte', name: 'Tomato' } },
    { index: 14, colorData: { hex: '#00CED1', effect: 'shimmer', name: 'Dark Turquoise' } },
    { index: 15, colorData: { hex: '#DA70D6', effect: 'sparkly', name: 'Orchid' } }
  ],
  createdAt: new Date().toISOString()
}

const test3x3PaletteData = {
  title: 'Midnight Carnival',
  gridSize: 3,
  colors: [
    { index: 0, colorData: { hex: '#800080', effect: 'matte', name: 'Purple' } },
    { index: 1, colorData: { hex: '#FFD700', effect: 'sparkly', name: 'Gold' } },
    { index: 2, colorData: { hex: '#FF1493', effect: 'shimmer', name: 'Deep Pink' } },
    { index: 3, colorData: { hex: '#00FFFF', effect: 'matte', name: 'Cyan' } },
    { index: 4, colorData: { hex: '#000000', effect: 'sparkly', name: 'Black' } },
    { index: 5, colorData: { hex: '#FF4500', effect: 'shimmer', name: 'Orange Red' } },
    { index: 6, colorData: { hex: '#9ACD32', effect: 'matte', name: 'Yellow Green' } },
    { index: 7, colorData: { hex: '#FF69B4', effect: 'sparkly', name: 'Hot Pink' } },
    { index: 8, colorData: { hex: '#4B0082', effect: 'shimmer', name: 'Indigo' } }
  ],
  createdAt: new Date().toISOString()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container">
        <div class="modal-content">
          <button class="modal-close" @click="closeSavedPalettesModal" aria-label="Close modal">
            ×
          </button>
          <div class="modal-inner-content">
            <h2>{{ savedPalettes.length > 0 ? 'Your Saved Palettes' : 'Save Palette Examples' }}</h2>
            
            <!-- Show saved palettes if they exist -->
            <div v-if="savedPalettes.length > 0" class="saved-palettes-grid">
              <div 
                v-for="(palette, index) in savedPalettes" 
                :key="`saved-palette-${index}`"
                class="saved-palette-item"
              >
                <MiniPalette :palette-data="palette" :size="120" />
              </div>
            </div>
            
            <!-- Show demo if no saved palettes -->
            <template v-else>
              <p>This shows how saved palettes are displayed using the MiniPalette component:</p>
              
              <div class="mini-palette-demo">
                <h2>Palette Demo</h2>
                <div class="palette-example">
                  <h3>4x4 Grid Example</h3>
                  <MiniPalette :palette-data="testPaletteData" :size="120" />
                </div>
                
                <div class="palette-example">
                  <h3>3x3 Compact Example</h3>
                  <MiniPalette :palette-data="test3x3PaletteData" :size="120" />
                </div>
              </div>
              
              <p>The MiniPalette component features:</p>
              <ul>
                <li>Miniature grid showing all saved colors (9 for 3x3, 16 for 4x4)</li>
                <li>Colors displayed at their exact saved positions</li>
                <li>Artsy palette titles for creative expression</li>
                <li>Visual effects preserved (matte, shimmer, sparkly)</li>
                <li>Compact display perfect for palette galleries</li>
              </ul>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.modal-container {
  width: 100%;
  height: 100%;
  max-width: 600px;
  max-height: 80vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-content {
  width: 100%;
  height: 100%;
  background: var(--gradient-container-primary);
  border-radius: var(--radius-container-large);
  box-shadow: var(--shadow-palette-container);
  border: var(--border-container);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.2);
}

.modal-inner-content {
  padding: 30px;
  background: var(--gradient-container-secondary);
  border-radius: var(--radius-container-large);
  box-shadow: var(--shadow-grid-inner);
  border: var(--border-container-light);
  margin: 15px;
  flex: 1;
  overflow-y: auto;
}

.modal-inner-content h2 {
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.modal-inner-content p {
  margin-bottom: 12px;
}

/* Mobile first */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 8px;
  }
  
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-close {
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    font-size: 20px;
  }
  
  .modal-inner-content {
    padding: 20px;
    margin: 10px;
  }
}

/* Tablet and up */
@media (min-width: 481px) {
  .modal-container {
    max-width: 700px;
    max-height: 85vh;
  }
  
  .modal-inner-content {
    margin: 18px;
  }
}

/* Desktop and up */
@media (min-width: 1200px) {
  .modal-container {
    max-width: 1000px;
    max-height: 90vh;
  }
  
  .modal-content {
    box-shadow: var(--shadow-grid-container-desktop);
  }
  
  .modal-inner-content {
    margin: 30px;
  }
}

/* Saved palettes grid */
.saved-palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.saved-palette-item {
  display: flex;
  justify-content: center;
}

@media (max-width: 480px) {
  .saved-palettes-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
  }
}

/* Mini palette demo styles */
.mini-palette-demo {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md);
  border: 1px solid rgba(139, 129, 165, 0.2);
}

.palette-example {
  text-align: center;
}

.palette-example h3 {
  font-size: var(--font-size-sm);
  margin-bottom: 12px;
  color: var(--color-text-secondary);
}

@media (max-width: 480px) {
  .mini-palette-demo {
    flex-direction: column;
    gap: 16px;
  }
}
</style>