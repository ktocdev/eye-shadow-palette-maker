<script setup>
import BaseButton from './BaseButton.vue'

const props = defineProps({
  hasSavedPalettes: {
    type: Boolean,
    default: false
  },
  hasColors: {
    type: Boolean,
    default: false
  },
  canSave: {
    type: Boolean,
    default: false
  },
  isModalOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['clear', 'randomize', 'open-save-modal', 'view-saved-palettes', 'open-about-modal'])
</script>

<template>
  <div class="palette-controls">
    <BaseButton 
      variant="green"
      size="standard"
      :disabled="!canSave"
      @click="$emit('open-save-modal')"
    >
      Save Palette
    </BaseButton>
    <BaseButton 
      variant="red"
      size="standard"
      :disabled="!hasColors"
      @click="$emit('clear')"
    >
      Clear Palette
    </BaseButton>
    <BaseButton 
      variant="blue"
      size="standard"
      :disabled="!hasSavedPalettes"
      @click="$emit('view-saved-palettes')"
    >
      View Saved Palettes
    </BaseButton>
    <BaseButton 
      variant="purple"
      size="standard"
      @click="$emit('randomize')"
    >
      Random Palette
    </BaseButton>
    <BaseButton 
      variant="orange"
      size="standard"
      @click="$emit('open-about-modal')"
    >
      About
    </BaseButton>
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