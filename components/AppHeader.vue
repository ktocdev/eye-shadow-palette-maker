<script setup>
import CollapsibleText from './shared/CollapsibleText.vue'

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
  isEditingTitle: {
    type: Boolean,
    default: false
  },
  editedTitle: {
    type: String,
    default: ''
  },
  loadedPaletteModified: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:inline-palette-title',
  'update:edited-title',
  'start-title-edit',
  'save-title-edit',
  'cancel-title-edit'
])

const appTitle = "Eyeshadow Palette Maker"
const appDescription = "Create custom eyeshadow palettes by selecting colors from our curated collection. Drag colors from the carousel to your palette grid, or click to select and place them. You can drag colors out of the grid to remove them. Save your creations and load them anytime!"

const updateInlineTitle = (event) => {
  emit('update:inline-palette-title', event.target.value)
}

const updateEditedTitle = (event) => {
  emit('update:edited-title', event.target.value)
}

const handleStartEdit = () => {
  emit('start-title-edit', props.loadedPaletteTitle)
}

const handleSaveEdit = () => {
  emit('save-title-edit')
}

const handleCancelEdit = () => {
  emit('cancel-title-edit')
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
      <input
        :value="inlinePaletteTitle"
        @input="updateInlineTitle"
        type="text"
        :placeholder="loadedPaletteModified ? 'Add Palette Title' : 'New Palette Title'"
        class="inline-title-input"
      />
    </div>

    <!-- Loaded Palette Title -->
    <div v-else-if="showLoadedPaletteTitle" class="loaded-palette-section">
      <div class="palette-title-container">
        <div v-if="!isEditingTitle" class="palette-title-display">
          <h2 class="loaded-palette-title">{{ loadedPaletteTitle }}</h2>
          <button 
            @click="handleStartEdit"
            class="edit-title-btn"
            aria-label="Edit palette title"
          >
            ✏️
          </button>
        </div>
        <div v-else class="palette-title-edit">
          <input
            :value="editedTitle"
            @input="updateEditedTitle"
            type="text"
            class="palette-title-input"
            @keyup.enter="handleSaveEdit"
            @keyup.escape="handleCancelEdit"
          />
          <div class="edit-actions">
            <button @click="handleSaveEdit" class="save-btn">✓</button>
            <button @click="handleCancelEdit" class="cancel-btn">✕</button>
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
  line-height: 1;
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

.palette-title-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
}

.palette-title-display:hover .edit-title-btn {
  opacity: 1;
}

.loaded-palette-title {
  font-size: var(--font-size-lg);
  margin: 0;
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
}

.edit-title-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-base);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  opacity: 0;
}

.edit-title-btn:hover {
  opacity: 1;
  background: rgba(106, 90, 205, 0.1);
}

.palette-title-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

.palette-title-input {
  flex: 1;
  padding: 8px 12px;
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
}

.save-btn,
.cancel-btn {
  background: none;
  border: 1px solid rgba(139, 129, 165, 0.3);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
}

.save-btn {
  color: #228B22;
  border-color: rgba(34, 139, 34, 0.3);
}

.save-btn:hover {
  background: rgba(34, 139, 34, 0.1);
  border-color: rgba(34, 139, 34, 0.5);
}

.cancel-btn {
  color: #DC143C;
  border-color: rgba(220, 20, 60, 0.3);
}

.cancel-btn:hover {
  background: rgba(220, 20, 60, 0.1);
  border-color: rgba(220, 20, 60, 0.5);
}
</style>
