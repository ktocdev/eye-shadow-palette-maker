<script setup>
import { ref, onMounted, watch } from 'vue'
import MiniPalette from './MiniPalette.vue'
import Modal from './Modal.vue'

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

// Load saved palettes when component mounts and when modal opens
onMounted(() => {
  loadSavedPalettes()
})

// Reload palettes when modal opens (in case new ones were saved)
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadSavedPalettes()
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
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
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
  </Modal>
</template>

<style>
p {
  margin-bottom: 12px;
}

/* Saved palettes grid - Mobile first */
.saved-palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.saved-palette-item {
  display: flex;
  justify-content: center;
}

@media (min-width: 481px) {
  .saved-palettes-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 20px;
  }
}

/* Mini palette demo styles - Mobile first */
.mini-palette-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

@media (min-width: 481px) {
  .mini-palette-demo {
    flex-direction: row;
    justify-content: space-around;
    gap: 20px;
  }
}
</style>
