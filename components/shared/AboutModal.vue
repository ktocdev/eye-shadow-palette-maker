<script setup>
import { ref, onMounted } from 'vue'
import MiniPalette from './MiniPalette.vue'
import Modal from './Modal.vue'
import { useColorData } from '../../composables/useColorData.js'
import { usePaletteStorage } from '../../composables/usePaletteStorage.js'
import demoPalettesData from '../../data/demoPalettes.json'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'load-palette', 'eye-preview'])

// Use color data composable to get real colors
const { findColorByHex, convertToColorData } = useColorData()

// Use palette storage to register demo palettes
const { registerDemoPalettes } = usePaletteStorage()

// Create demo palettes from predefined JSON data
const createDemoPalettes = () => {
  return demoPalettesData.palettes.map((paletteTemplate, index) => {
    const colors = paletteTemplate.colors.map(colorRef => {
      const foundColor = findColorByHex(colorRef.hex)
      if (foundColor) {
        return {
          index: colorRef.index,
          colorData: convertToColorData(foundColor)
        }
      } else {
        console.warn(`Color not found: ${colorRef.hex}`)
        return null
      }
    }).filter(Boolean) // Remove null entries
    
    return {
      id: `demo-palette-${index}`, // Add proper ID for demo palettes
      title: paletteTemplate.title,
      gridSize: paletteTemplate.gridSize,
      colors,
      createdAt: new Date().toISOString()
    }
  })
}

// Get the demo palettes
const demoPalettes = createDemoPalettes()

// Register demo palettes with storage system so they can be accessed by other components
registerDemoPalettes(demoPalettes)

// Handle palette actions from MiniPalette (same pattern as SavedPalettesGrid)
const handlePaletteAction = (action, paletteId) => {
  if (action === 'load') {
    emit('load-palette', paletteId)
    // Close the about modal
    emit('update:modelValue', false)
  } else if (action === 'eye-preview') {
    emit('eye-preview', paletteId)
    // Close the about modal
    emit('update:modelValue', false)
  }
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <h2>About Eyeshadow Palette Maker</h2>
    
    <div class="app-description">
      <h3>Create Your Perfect Eyeshadow Palette</h3>
      <p class="description-text">
        Build custom eyeshadow palettes by selecting colors from the carousel and placing them in your desired grid layout. Choose from 2x2, 3x3, or 4x4 grid sizes to create anything from a compact travel palette to an extensive collection.
      </p>
      
      <div class="how-to-use">
        <h4>How to Use:</h4>
        <ol class="instructions-list">
          <li><strong>Add a Title:</strong> Enter a name for your palette in the title field</li>
          <li><strong>Open Color Carousel:</strong> Click on any grid cell to open the floating color carousel</li>
          <li><strong>Choose Colors:</strong> Click any eyeshadow in the carousel to place it in the selected cell</li>
          <li><strong>Drag & Drop:</strong> Alternatively, drag colors from the open carousel to any grid cell, or rearrange colors within the grid</li>
          <li><strong>Close Carousel:</strong> Click the × button or click outside to close the color carousel</li>
          <li><strong>Save Your Palette:</strong> Once you have a title and colors, click the ✓ button to save</li>
          <li><strong>Start Fresh:</strong> Click "Start New Palette" to clear everything and begin a new creation</li>
          <li><strong>Try Examples:</strong> Load the demo palettes below by clicking the ⋯ menu and selecting "Load Palette"</li>
        </ol>
      </div>
    </div>
    
    <div class="mini-palette-demo">
      <h4>Example Palettes:</h4>
      <div class="demo-palettes-container">
        <div class="palette-example">
          <h5>2x2 Compact</h5>
          <MiniPalette 
            :palette-data="demoPalettes[0]" 
            :size="120" 
            :show-delete="false"
            :show-share="false"
            @palette-action="handlePaletteAction"
          />
        </div>
        
        <div class="palette-example">
          <h5>3x3 Standard</h5>
          <MiniPalette 
            :palette-data="demoPalettes[1]" 
            :size="120" 
            :show-delete="false"
            :show-share="false"
            @palette-action="handlePaletteAction"
          />
        </div>
        
        <div class="palette-example">
          <h5>4x4 Extended</h5>
          <MiniPalette 
            :palette-data="demoPalettes[2]" 
            :size="120" 
            :show-delete="false"
            :show-share="false"
            @palette-action="handlePaletteAction"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<style>
/* App description section */
.app-description {
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(139, 129, 165, 0.15);
}

.app-description h3 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: 16px;
  text-align: center;
}

.description-text {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: 24px;
  text-align: center;
}

.how-to-use h4 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.instructions-list {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  padding-left: 20px;
  margin: 0;
}

.instructions-list li {
  margin-bottom: 8px;
}

.instructions-list strong {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Mini palette demo styles - Mobile first */
.mini-palette-demo {
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md);
  border: 1px solid rgba(139, 129, 165, 0.2);
}

.mini-palette-demo h4 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: 16px;
  text-align: center;
}

.demo-palettes-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.palette-example {
  text-align: center;
}

.palette-example h5 {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

@media (min-width: 768px) {
  .demo-palettes-container {
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
  }
  
  .palette-example {
    flex: 1;
  }
}
</style>