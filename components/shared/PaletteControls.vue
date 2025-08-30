<script setup>
const props = defineProps({
  canSave: {
    type: Boolean,
    default: false
  },
  hasSavedPalettes: {
    type: Boolean,
    default: false
  },
  hasColors: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['clear', 'randomize', 'open-save-modal', 'view-saved-palettes', 'open-about-modal'])
</script>

<template>
  <div class="palette-controls">
    <button 
      @click="$emit('open-save-modal')"
      :disabled="!canSave"
      class="btn btn-standard btn-gradient-green"
      :class="{ 'btn-disabled': !canSave }"
    >
      Save Palette
    </button>
    <button 
      @click="$emit('view-saved-palettes')"
      :disabled="!hasSavedPalettes"
      class="btn btn-standard btn-gradient-blue"
      :class="{ 'btn-disabled': !hasSavedPalettes }"
    >
      View Saved Palettes
    </button>
    <button @click="$emit('randomize')" class="btn btn-standard btn-gradient-purple">
      Random Palette
    </button>
    <button 
      @click="$emit('clear')"
      :disabled="!hasColors"
      class="btn btn-standard btn-gradient-red"
      :class="{ 'btn-disabled': !hasColors }"
    >
      Clear Palette
    </button>
    <button @click="$emit('open-about-modal')" class="btn btn-standard btn-gradient-orange">
      About
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
}

@media (min-width: 600px) {
  .palette-controls {
    flex-direction: row;
    gap: 20px;
  }
}

</style>