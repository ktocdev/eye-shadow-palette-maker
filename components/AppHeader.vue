<script setup>
import { ref } from 'vue'
import CollapsibleText from './shared/CollapsibleText.vue'
import BaseButton from './shared/BaseButton.vue'

const props = defineProps({
  showAppInfo: {
    type: Boolean,
    default: true
  },
  appInfoInitiallyOpen: {
    type: Boolean,
    default: true
  },
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
  'save-inline-title',
  'cancel-inline-title'
])

const appTitle = "Eyeshadow Palette Maker"
const appDescription = "Create custom eyeshadow palettes by selecting colors from our curated collection. Drag colors from the carousel to your palette grid, or click to select and place them. You can drag colors out of the grid to remove them. Save your creations and load them anytime!"

const updateInlineTitle = (event) => {
  emit('update:inline-palette-title', event.target.value)
}

// Inline title input focus state
const isInlineTitleFocused = ref(false)

const handleInlineTitleFocus = () => {
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
    emit('save-inline-title')
    isInlineTitleFocused.value = false
  }
}

const handleCancelInlineTitle = () => {
  emit('cancel-inline-title')
  isInlineTitleFocused.value = false
}
</script>

<template>
  <div class="app-header">
    <!-- App Info Section -->
    <div v-if="showAppInfo" class="app-info">
      <CollapsibleText 
        :title="appTitle"
        :text="appDescription"
        :initially-open="appInfoInitiallyOpen"
      />
    </div>

    <!-- Inline Title Input -->
    <div v-else-if="showInlineTitleInput" class="inline-title-section">
      <h1 v-if="!loadedPaletteModified" class="app-title">{{ appTitle }}</h1>
      <div class="inline-title-input-container">
        <input
          :value="inlinePaletteTitle"
          @input="updateInlineTitle"
          @focus="handleInlineTitleFocus"
          @blur="handleInlineTitleBlur"
          type="text"
          :placeholder="loadedPaletteModified ? 'Add Palette Title' : 'New Palette Title'"
          class="inline-title-input"
          @keyup.enter="handleSaveInlineTitle"
          @keyup.escape="handleCancelInlineTitle"
        />
        <Transition name="inline-actions">
          <div v-if="isInlineTitleFocused || inlinePaletteTitle.trim()" class="edit-actions">
            <BaseButton
              variant="ghost-green"
              size="compact"
              :disabled="!inlinePaletteTitle.trim() || !isGridFull"
              @click="handleSaveInlineTitle"
            >
              ✓
            </BaseButton>
            <BaseButton
              variant="ghost-red"
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
      <div class="palette-title-container">
        <h2 class="loaded-palette-title">{{ loadedPaletteTitle }}</h2>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-header {
  width: 100%;
}

.app-info {
  width: 100%;
}

.inline-title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loaded-palette-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.app-title {
  font-size: var(--font-size-xl);
  line-height: var(--line-height-tight);
  margin: 0;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
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
  align-items: center;
  gap: 12px;
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
  margin: 0;
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
}


.edit-actions {
  display: flex;
  gap: 8px;
}

</style>
