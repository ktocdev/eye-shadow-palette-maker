<script setup>
defineEmits(['clear', 'randomize'])
</script>

<template>
  <div class="palette-controls">
    <button @click="$emit('randomize')" class="btn btn-compact btn-gradient-purple">
      Random Palette
    </button>
    <button @click="$emit('clear')" class="btn btn-compact btn-gradient-red">
      Clear Palette
    </button>
  </div>
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
</style>