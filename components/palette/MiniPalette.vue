<script setup>
import { computed } from 'vue'
import Dropdown from '../ui/Dropdown.vue'
import { useColorEffects } from '../../composables/useColorEffects.js'
import { useSound } from '../../composables/useSound.js'

const props = defineProps({
  paletteData: {
    type: Object,
    required: true
  },
  size: {
    type: Number,
    default: 100
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  showShare: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['palette-action'])

// Use color effects composable
const { getEffectClasses } = useColorEffects()

// Use sound composable
const { playSoftClick, playDownSweep, playSharpClick } = useSound()

// Dropdown menu items - conditionally include delete and share based on props
const dropdownItems = computed(() => {
  const items = [
    { label: 'Load Palette', icon: '', action: 'load' },
    { label: 'Preview', icon: '', action: 'eye-preview', badge: 'Beta' }
  ]
  
  if (props.showShare) {
    items.push({ label: 'Share', icon: '', action: 'share' })
  }
  
  if (props.showDelete) {
    items.push({ label: 'Delete', icon: '', action: 'delete' })
  }
  
  return items
})

// Handle dropdown actions
const handleAction = (action) => {
  // Use different sounds for different actions
  if (action === 'delete') {
    playDownSweep() // Downward swoop for delete
  } else {
    playSharpClick() // Sharp click for precise menu selections (load, share, eye-preview)
  }
  
  if (!props.paletteData?.id) {
    console.error('MiniPalette: Missing palette ID', props.paletteData)
    return
  }
  emit('palette-action', action, props.paletteData.id)
}

// Calculate tile size based on overall size
const tileSize = computed(() => {
  const gridSize = props.paletteData?.gridSize || 2
  return Math.floor(props.size / gridSize)
})

// Create grid array with colors placed at their indices
const gridCells = computed(() => {
  console.log('MiniPalette paletteData:', props.paletteData)
  
  // Safety check for gridSize
  const gridSize = props.paletteData?.gridSize || 2
  if (gridSize <= 0 || !Number.isInteger(gridSize)) {
    console.warn('Invalid gridSize in paletteData:', gridSize, 'using default of 2')
    gridSize = 2
  }
  
  const totalCells = gridSize * gridSize
  const cells = new Array(totalCells).fill(null)
  
  // Place colors at their saved indices
  props.paletteData.colors.forEach(({ index, colorData }) => {
    console.log('Processing color at index', index, 'colorData:', colorData)
    if (index < totalCells) {
      cells[index] = colorData
    }
  })
  
  console.log('Final grid cells:', cells)
  return cells
})

// CSS Grid template columns
const gridColumns = computed(() => {
  return `repeat(${props.paletteData.gridSize}, ${tileSize.value}px)`
})
</script>

<template>
  <div class="mini-palette">
    <div class="mini-palette-container">
      <div 
        class="mini-palette-grid"
        :style="{ 
          gridTemplateColumns: gridColumns,
          width: size + 'px',
          height: size + 'px'
        }"
      >
      <div 
        v-for="(colorData, index) in gridCells"
        :key="`mini-cell-${index}`"
        class="mini-palette-tile"
        :class="colorData ? getEffectClasses(colorData.effect) : {}"
        :style="{ 
          backgroundColor: colorData ? colorData.bgColor : 'transparent',
          width: tileSize + 'px',
          height: tileSize + 'px'
        }"
        />
      </div>
      <div v-if="showActions" class="mini-palette-actions">
        <Dropdown 
          :items="dropdownItems" 
          position="bottom-right"
          @action="handleAction"
        />
      </div>
    </div>
    <h3 class="mini-palette-title">
      {{ paletteData.title }}
    </h3>
  </div>
</template>

<style>
.mini-palette {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.mini-palette-container {
  position: relative;
}

.mini-palette-grid {
  display: grid;
  gap: 0;
  border: 1px solid rgba(139, 129, 165, 0.2);
}

.mini-palette-tile {
  position: relative;
  border: none;
}

.mini-palette-actions {
  position: absolute;
  top: 4px;
  right: 4px;
}

.mini-palette-title {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-s);
  color: var(--color-text-secondary);
  text-align: center;
  line-height: var(--line-height-snug);
}
</style>
