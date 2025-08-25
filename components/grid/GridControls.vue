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
  font-weight: bold;
  font-size: 14px;
}

.grid-controls select {
  padding: 8px 12px;
  font-size: 16px;
  border: var(--border-standard);
  border-radius: var(--radius-xs);
  min-width: 120px;
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
