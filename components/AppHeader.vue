<script setup>
import { ref, computed } from 'vue'
import BaseButton from './shared/BaseButton.vue'
import { useSound } from '../composables/useSound.js'

const props = defineProps({
  showInlineTitleInput: {
    type: Boolean,
    default: false
  },
  showLoadedPaletteTitle: {
    type: Boolean,
    default: false
  },
  inlinePaletteTitle: {
    type: String,
    default: ''
  },
  loadedPaletteTitle: {
    type: String,
    default: ''
  },
  loadedPaletteModified: {
    type: Boolean,
    default: false
  },
  isGridFull: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:inline-palette-title',
  'inline-title-saved',
  'inline-title-cancelled',
  'new-palette'
])

const appTitle = "Eyeshadow Palette Maker"

// Use sound composable
const { playSoftClick } = useSound()

const updateInlineTitle = (event) => {
  emit('update:inline-palette-title', event.target.value)
}

// Inline title input focus state
const isInlineTitleFocused = ref(false)

// Form helper message based on grid state and input content
const formHelperMessage = computed(() => {
  const hasTitle = props.inlinePaletteTitle.trim().length > 0
  const isGridFull = props.isGridFull
  
  if (hasTitle && !isGridFull) {
    return 'Fill the grid with swatches to save palette'
  } else if (!hasTitle && isGridFull) {
    return 'Add a title to save the palette'
  } else if (!hasTitle && !isGridFull) {
    return 'Fill the grid and add title to save palette'
  }
  
  return 'Ready to save palette' // Both title and grid are complete
})

const handleInlineTitleFocus = () => {
  playSoftClick()
  isInlineTitleFocused.value = true
}

const handleInlineTitleBlur = (event) => {
  // Check if the blur is moving to one of our action buttons
  const relatedTarget = event.relatedTarget
  if (relatedTarget && (relatedTarget.classList.contains('save-btn') || relatedTarget.classList.contains('cancel-btn'))) {
    return // Keep focused state when moving to action buttons
  }
  isInlineTitleFocused.value = false
}

const handleSaveInlineTitle = () => {
  if (props.inlinePaletteTitle.trim() && props.isGridFull) {
    playSoftClick()
    emit('inline-title-saved', props.inlinePaletteTitle.trim())
    isInlineTitleFocused.value = false
  }
}

const handleCancelInlineTitle = () => {
  playSoftClick()
  emit('inline-title-cancelled')
  isInlineTitleFocused.value = false
}

const handleNewPalette = () => {
  playSoftClick()
  emit('new-palette')
}

</script>

<template>
  <div class="app-header">
    <!-- Inline Title Input -->
    <div v-if="showInlineTitleInput" class="inline-title-section">
      <h1 v-if="!loadedPaletteModified" class="app-title">{{ appTitle }}</h1>
      <div class="inline-title-input-container">
        <input
          :value="inlinePaletteTitle"
          @input="updateInlineTitle"
          @focus="handleInlineTitleFocus"
          @blur="handleInlineTitleBlur"
          type="text"
          placeholder="Add Palette Title Here"
          class="inline-title-input"
          id="inline-palette-title-input"
          @keyup.enter="handleSaveInlineTitle"
          @keyup.escape="handleCancelInlineTitle"
        />
        <div class="form-helper">
          {{ formHelperMessage }}
        </div>
        <Transition name="inline-actions">
          <div v-if="inlinePaletteTitle.trim() && isGridFull" class="edit-actions">
            <BaseButton
              variant="green"
              size="compact"
              :disabled="!inlinePaletteTitle.trim() || !isGridFull"
              @click="handleSaveInlineTitle"
            >
              ✓
            </BaseButton>
            <BaseButton
              variant="red"
              size="compact"
              @click="handleCancelInlineTitle"
            >
              ✕
            </BaseButton>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Loaded Palette Title -->
    <div v-else-if="showLoadedPaletteTitle" class="loaded-palette-section">
      <h1 class="loaded-palette-title">{{ loadedPaletteTitle }}</h1>
      <BaseButton
        variant="purple"
        size="compact"
        @click="handleNewPalette"
        class="new-palette-btn"
      >
        Start New Palette
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.app-header {
  width: 100%;
}

.inline-title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Desktop enhancements */
@media (min-width: 481px) {
  .inline-title-section {
    gap: 16px;
  }
}

.loaded-palette-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

@media (min-width: 481px) {
  .loaded-palette-section {
    gap: 16px;
  }
}

.app-title {
  font-size: var(--font-size-xl);
  line-height: var(--line-height-very-tight);
  margin: 0;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
}

@media (min-width: 600px) {
  .app-title {
    line-height: var(--line-height-tight);
  }
}

.inline-title-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border: 1px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.inline-title-input:focus {
  outline: none;
  border-color: rgba(106, 90, 205, 0.5);
  box-shadow: 0 0 0 3px rgba(106, 90, 205, 0.1);
}

.inline-title-input::placeholder {
  color: var(--color-text-muted);
}

.inline-title-input-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* Form helper styles */
.form-helper {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-align: center;
  padding: 4px 8px;
  margin-top: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(139, 129, 165, 0.2);
}

/* Transition for form helper */
.form-helper-enter-active,
.form-helper-leave-active {
  transition: all 0.3s ease;
}

.form-helper-enter-from,
.form-helper-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.form-helper-enter-to,
.form-helper-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Transition for inline actions */
.inline-actions-enter-active,
.inline-actions-leave-active {
  transition: all 0.3s ease;
}

.inline-actions-enter-from,
.inline-actions-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.inline-actions-enter-to,
.inline-actions-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.loaded-palette-title {
  font-size: var(--font-size-lg);
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
}

.edit-actions {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(139, 129, 165, 0.1);
  flex: 1 1 auto;
  justify-content: center;
  min-width: 120px;
}

/* Desktop enhancements - edit actions align normally */
@media (min-width: 481px) {
  .edit-actions {
    flex: 0 1 auto;
    justify-content: flex-start;
    min-width: auto;
  }
}

</style>
