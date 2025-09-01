<script setup>
import { ref, nextTick } from 'vue'
import BaseButton from './shared/BaseButton.vue'
import { useSound } from '../composables/useSound.js'
import { useTitleEditing } from '../composables/useTitleEditing.js'

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
  },
  isEditingTitle: {
    type: Boolean,
    default: false
  },
  editedTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update:inline-palette-title',
  'update:edited-title',
  'title-saved',
  'title-edit-cancelled',
  'inline-title-saved',
  'inline-title-cancelled',
  'start-title-edit'
])

const appTitle = "Eyeshadow Palette Maker"

// Use sound composable
const { playDropSuccess } = useSound()

// Use title editing composable
const {
  startTitleEdit,
  saveTitleEdit,
  cancelTitleEdit
} = useTitleEditing()

const updateInlineTitle = (event) => {
  emit('update:inline-palette-title', event.target.value)
}

// Inline title input focus state
const isInlineTitleFocused = ref(false)

const handleInlineTitleFocus = () => {
  playDropSuccess()
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
    playDropSuccess()
    emit('inline-title-saved', props.inlinePaletteTitle.trim())
    isInlineTitleFocused.value = false
  }
}

const handleCancelInlineTitle = () => {
  playDropSuccess()
  emit('inline-title-cancelled')
  isInlineTitleFocused.value = false
}

// Title editing handlers (moved from SwatchesExplorer)
const handleStartTitleEdit = async (currentTitle) => {
  playDropSuccess()
  startTitleEdit(currentTitle)
  emit('start-title-edit', currentTitle)
  // Focus the input after DOM update
  await nextTick()
  const input = document.querySelector('.palette-title-input')
  input?.focus()
  input?.select()
}

const handleSaveTitleEdit = () => {
  playDropSuccess()
  const result = saveTitleEdit()
  if (result.success && result.hasChanged) {
    emit('title-saved', { oldTitle: props.loadedPaletteTitle, newTitle: result.newTitle })
  }
}

const handleCancelTitleEdit = () => {
  playDropSuccess()
  cancelTitleEdit()
  emit('title-edit-cancelled')
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
          @keyup.enter="handleSaveInlineTitle"
          @keyup.escape="handleCancelInlineTitle"
        />
        <Transition name="inline-actions">
          <div v-if="isInlineTitleFocused || inlinePaletteTitle.trim()" class="edit-actions">
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
      <div class="palette-title-container">
        <div v-if="!isEditingTitle" class="title-display">
          <h2 
            class="loaded-palette-title" 
            @click="handleStartTitleEdit(loadedPaletteTitle)"
          >
            {{ loadedPaletteTitle }}
          </h2>
          <button 
            @click="handleStartTitleEdit(loadedPaletteTitle)"
            class="edit-title-btn"
          >
            Edit
          </button>
        </div>
        
        <div v-else class="title-edit-form">
          <input
            :value="editedTitle"
            @input="$emit('update:edited-title', $event.target.value)"
            type="text"
            class="palette-title-input"
            @keyup.enter="handleSaveTitleEdit"
            @keyup.escape="handleCancelTitleEdit"
          />
          <div class="edit-actions">
            <BaseButton
              variant="green"
              size="compact"
              @click="handleSaveTitleEdit"
            >
              ✓
            </BaseButton>
            <BaseButton
              variant="red"
              size="compact"
              @click="handleCancelTitleEdit"
            >
              ✕
            </BaseButton>
          </div>
        </div>
      </div>
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
  cursor: pointer;
  transition: color 0.2s ease;
}

.loaded-palette-title:hover {
  color: var(--color-success-primary);
}

.title-display {
  position: relative;
  display: inline-block;
}

.title-display:hover .edit-title-btn {
  opacity: 1;
}

.edit-title-btn {
  position: absolute;
  top: 50%;
  right: -35px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: var(--font-size-s);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.edit-title-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(106, 90, 205, 0.4);
  box-shadow: 0 2px 4px rgba(139, 129, 165, 0.2);
}

.title-edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.palette-title-input {
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

.palette-title-input:focus {
  outline: none;
  border-color: rgba(106, 90, 205, 0.5);
  box-shadow: 0 0 0 3px rgba(106, 90, 205, 0.1);
}

.edit-actions {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(139, 129, 165, 0.1);
}

/* Mobile base styles - edit actions centered when wrapped */
.edit-actions {
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
