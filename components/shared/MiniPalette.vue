<script setup>
import { computed } from 'vue'

const props = defineProps({
  paletteData: {
    type: Object,
    required: true
  },
  size: {
    type: Number,
    default: 100
  }
})

// Calculate tile size based on overall size
const tileSize = computed(() => {
  return Math.floor(props.size / props.paletteData.gridSize)
})

// Create grid array with colors placed at their indices
const gridCells = computed(() => {
  const totalCells = props.paletteData.gridSize * props.paletteData.gridSize
  const cells = new Array(totalCells).fill(null)
  
  // Place colors at their saved indices
  props.paletteData.colors.forEach(({ index, colorData }) => {
    if (index < totalCells) {
      cells[index] = colorData
    }
  })
  
  return cells
})

// CSS Grid template columns
const gridColumns = computed(() => {
  return `repeat(${props.paletteData.gridSize}, ${tileSize.value}px)`
})
</script>

<template>
  <div class="mini-palette">
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
        :class="{
          'effect-matte': colorData && colorData.effect === 'matte',
          'effect-shimmer': colorData && colorData.effect === 'shimmer', 
          'effect-sparkly': colorData && colorData.effect === 'sparkly'
        }"
        :style="{ 
          backgroundColor: colorData ? colorData.hex : 'transparent',
          width: tileSize + 'px',
          height: tileSize + 'px'
        }"
      />
    </div>
    <div class="mini-palette-title">
      {{ paletteData.title }}
    </div>
  </div>
</template>

<style>
.mini-palette {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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

.mini-palette-title {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.2;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>