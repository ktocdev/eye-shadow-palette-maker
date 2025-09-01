<script setup>
import BaseButton from './BaseButton.vue'
import { useSound } from '../../composables/useSound.js'

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

// Use sound composable
const { playSubtleClick, playSoftClick } = useSound()

// Handle button clicks with sound
const handleSaveClick = () => {
  playSoftClick()
  emit('open-save-modal')
}

const handleClearClick = () => {
  playSubtleClick()
  emit('clear')
}

const handleViewSavedClick = () => {
  playSoftClick()
  emit('view-saved-palettes')
}

const handleRandomizeClick = () => {
  playSoftClick()
  emit('randomize')
}

const handleAboutClick = () => {
  playSoftClick()
  emit('open-about-modal')
}
</script>

<template>
  <div class="palette-controls">
    <BaseButton 
      variant="green"
      size="standard"
      :disabled="!canSave"
      @click="handleSaveClick"
    >
      Save Palette
    </BaseButton>
    <BaseButton 
      variant="red"
      size="standard"
      :disabled="!hasColors"
      @click="handleClearClick"
    >
      Clear Palette
    </BaseButton>
    <BaseButton 
      variant="blue"
      size="standard"
      :disabled="!hasSavedPalettes"
      @click="handleViewSavedClick"
    >
      View Saved Palettes
    </BaseButton>
    <BaseButton 
      variant="purple"
      size="standard"
      @click="handleRandomizeClick"
    >
      Random Palette
    </BaseButton>
    <BaseButton 
      variant="orange"
      size="standard"
      @click="handleAboutClick"
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