<script setup>
defineEmits(['clear', 'randomize'])
</script>

<template>
  <div class="palette-controls flex-column-mobile flex-center">
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
  gap: 8px;
}

@media (min-width: 481px) {
  .palette-controls {
    flex-direction: row;
    gap: 28px;
  }
}
</style>