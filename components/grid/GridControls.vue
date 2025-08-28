<script setup>
const props = defineProps({
  gridSize: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['size-change'])

const handleSizeChange = (event) => {
  emit('size-change', parseInt(event.target.value))
}
</script>

<template>
  <div class="grid-controls">
    <label for="gridSize">Palette Grid Size:</label>
    <select 
      id="gridSize" 
      :value="gridSize"
      @change="handleSizeChange"
    >
      <option value="2">2×2</option>
      <option value="3">3×3</option>
      <option value="4">4×4</option>
    </select>
  </div>
</template>

<style>

/* Component-specific styles */
.grid-controls {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grid-controls label {
  font-weight: var(--font-weight-semibold);
  font-size: 13px;
}

.grid-controls select {
  padding: 8px;
  font-size: 14px;
  border: var(--border-standard);
  border-radius: var(--radius-xs);
}

@media (min-width: 481px) {
  .grid-controls {
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }
  
  .grid-controls select {
    font-size: 14px;
    padding: 6px 10px;
  }
}

@media (min-width: 973px) {
  .grid-controls {
    justify-content: flex-start;
  }
  
  .grid-controls select {
    padding: 5px 10px;
  }
}
</style>
