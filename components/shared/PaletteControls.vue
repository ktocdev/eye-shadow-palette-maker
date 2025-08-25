<script setup>
const props = defineProps({
  canSave: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['clear', 'randomize', 'open-save-modal', 'view-saved-palettes'])
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
      @click="$emit('open-save-modal')"
      :disabled="!canSave"
      class="btn btn-compact btn-gradient-green"
      :class="{ 'btn-disabled': !canSave }"
    >
      Save Palette
    </button>
    <button @click="$emit('view-saved-palettes')" class="btn btn-compact btn-gradient-gray">
      View Saved Palettes
    </button>
  </div>
</template>

<style>

/* Component-specific responsive layout */
.palette-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 264px;
}

@media (min-width: 600px) {
  .palette-controls {
    flex-direction: row;
    gap: 20px;
  }
}

</style>