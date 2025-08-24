<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'
import MiniPalette from './MiniPalette.vue'

const props = defineProps({
  canSave: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['clear', 'randomize', 'save'])

const isModalOpen = ref(false)
const isDialogOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
}

const openDialog = () => {
  isDialogOpen.value = true
}

const paletteTitle = ref('')

const handleSavePalette = () => {
  // Pass the palette title to the parent component
  emit('save', paletteTitle.value)
}

// Test palette data for MiniPalette demo
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

// Test 3x3 palette data with full 9 colors
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
  <div class="palette-controls">
    <button @click="$emit('randomize')" class="btn btn-compact btn-gradient-purple">
      Random Palette
    </button>
    <button @click="$emit('clear')" class="btn btn-compact btn-gradient-red">
      Clear Palette
    </button>
    <button 
      @click="openDialog"
      :disabled="!canSave"
      class="btn btn-compact btn-gradient-green"
      :class="{ 'btn-disabled': !canSave }"
    >
      Save Palette
    </button>
    <button @click="openModal" class="btn btn-compact btn-gradient-gray">
      View Saved Palettes
    </button>
  </div>

  <Modal v-model="isDialogOpen" :dialog="true">
    <h2>Save Palette</h2>
    <div class="form-field">
      <label for="palette-title">Palette Title</label>
      <input 
        id="palette-title"
        v-model="paletteTitle"
        type="text" 
        placeholder="Enter palette name"
        class="form-input"
      />
    </div>
    <button 
      @click="handleSavePalette"
      :disabled="!paletteTitle.trim()"
      class="btn btn-compact btn-gradient-green"
      :class="{ 'btn-disabled': !paletteTitle.trim() }"
    >
      Save Palette
    </button>
  </Modal>

  <Modal v-model="isModalOpen">
    <h2>Save Palette Examples</h2>
    <p>This shows how saved palettes are displayed using the MiniPalette component:</p>
    
    <div class="mini-palette-demo">
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
  </Modal>
</template>

<style>

/* Component-specific responsive layout */
.palette-controls {
  display: flex;
  gap: 8px;
}

@media (min-width: 481px) {
  .palette-controls {
    flex-direction: row;
    gap: 28px;
  }
}

/* Disabled button styles */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-disabled:hover {
  background: var(--gradient-button-green) !important;
  box-shadow: var(--shadow-button) !important;
}

/* Form field styles */
.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: rgba(106, 90, 205, 0.5);
  box-shadow: 0 0 0 3px rgba(106, 90, 205, 0.1);
}

.form-input::placeholder {
  color: var(--color-text-muted);
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