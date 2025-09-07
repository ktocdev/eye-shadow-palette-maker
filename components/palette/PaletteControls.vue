<script setup>
import BaseButton from '../ui/BaseButton.vue'
import Select from '../ui/Select.vue'
import { useSound } from '../../composables/useSound.js'
import { useTheme } from '../../composables/useTheme.js'

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

// Use theme composable
const { currentTheme, themeOptions, setTheme } = useTheme()

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

const handleThemeChange = (themeKey) => {
  playSoftClick()
  setTheme(themeKey)
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
    
    <!-- Theme selector -->
    <div class="theme-selector">
      <Select
        :value="currentTheme"
        :options="themeOptions"
        @change="handleThemeChange"
        placeholder="Select Theme"
        class="theme-dropdown"
      />
    </div>
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

.theme-selector {
  margin-top: 12px;
  width: 100%;
  max-width: 200px;
}

@media (min-width: 600px) {
  .theme-selector {
    margin-top: 0;
    width: auto;
    min-width: 150px;
  }
}

.theme-dropdown {
  width: 100%;
}

</style>