# Tabbed Modal Refactor Plan

## Overview
Refactor the current modal architecture to eliminate modal stacking issues by creating a simplified SavePaletteModal and a new tabbed PaletteManagerModal for saved palettes, eye preview, and sharing functionality.

## Current Problem
- SavePaletteModal shows both title input AND success state with MiniPalette
- MiniPalette actions (Eye Preview, Share) open additional modals on top
- Results in modal stacking and data management complexity

## Proposed Solution
1. **Simplify SavePaletteModal**: Title input only, no success state
2. **Create PaletteManagerModal**: Tabbed interface for saved palettes, preview, and sharing
3. **Add Back Navigation**: Clear navigation hierarchy within tabbed modal

---

## Phase 1: Simplify SavePaletteModal (Remove Success State)

**File**: `components/shared/SavePaletteModal.vue`

### Changes to Make:

#### 1. Remove Success State Logic
- Remove `showSuccessMessage` ref and related logic
- Remove `savedPaletteData` prop and handling  
- Remove MiniPalette component and related imports
- Remove success message UI (lines ~88-118)

#### 2. Keep Only Title Input Functionality
- Modal only shows title input form
- On save: emit save event and close immediately
- No success state display

#### 3. Update Props and Emits
```js
// Remove these props:
// - savedPaletteData

// Remove these emits:
// - 'share-palette'
// - 'eye-preview-palette'  
// - 'load-palette'

// Keep only:
const emit = defineEmits(['update:modelValue', 'save'])
```

#### 4. Simplified Template Structure
```vue
<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <h2>Save Palette</h2>
    <div class="form-field">
      <label for="palette-title">Palette Title</label>
      <input 
        id="palette-title"
        v-model="paletteTitle"
        type="text" 
        placeholder="Enter palette name"
        class="form-input"
      />
    </div>
    <div class="dialog-actions">
      <button 
        @click="handleSavePalette"
        :disabled="!paletteTitle.trim()"
        class="btn btn-compact btn-gradient-green"
      >
        Save Palette
      </button>
    </div>
  </Modal>
</template>
```

---

## Phase 2: Create Tabbed PaletteManagerModal

**File**: `components/shared/PaletteManagerModal.vue`

### Component Structure

#### 1. Tabbed Interface with Back Navigation
```vue
<template>
  <Modal :model-value="modelValue" @update:model-value="handleClose">
    <!-- Header with back navigation -->
    <div class="modal-header">
      <button 
        v-if="currentTab !== 'saved'" 
        @click="goBackToSaved"
        class="back-button"
      >
        ← Back to All Saved Palettes
      </button>
      <h2>{{ getModalTitle() }}</h2>
    </div>
    
    <!-- Tab navigation (only show when on saved palettes) -->
    <div v-if="currentTab === 'saved'" class="modal-tabs">
      <button :class="{ active: currentTab === 'saved' }">All Palettes</button>
    </div>
    
    <!-- Content area -->
    <div class="modal-content">
      <SavedPalettesGrid 
        v-if="currentTab === 'saved'" 
        @eye-preview="handleEyePreview"
        @share="handleShare"
        @load="handleLoad"
        @delete="handleDelete"
      />
      <EyePreviewCanvas 
        v-if="currentTab === 'preview'" 
        :palette-id="selectedPaletteId"
      />
      <SharePaletteForm 
        v-if="currentTab === 'share'" 
        :palette-id="selectedPaletteId"
      />
    </div>
  </Modal>
</template>
```

#### 2. State Management
```js
<script setup>
import { reactive, computed } from 'vue'
import Modal from './Modal.vue'
// Import tab components
import SavedPalettesGrid from './SavedPalettesGrid.vue'
import EyePreviewCanvas from './EyePreviewCanvas.vue' 
import SharePaletteForm from './SharePaletteForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'load-palette'])

// Modal state
const modalState = reactive({
  currentTab: 'saved', // Always starts on saved palettes
  selectedPaletteId: null,
  previousTab: null // Track navigation history
})

// Navigation methods
const goBackToSaved = () => {
  modalState.currentTab = 'saved'
  modalState.selectedPaletteId = null
}

const getModalTitle = () => {
  switch(modalState.currentTab) {
    case 'saved': return 'Your Saved Palettes'
    case 'preview': return 'Eye Preview'
    case 'share': return 'Share Palette'
    default: return 'Palette Manager'
  }
}

// Action handlers
const handleEyePreview = (paletteId) => {
  modalState.selectedPaletteId = paletteId
  modalState.currentTab = 'preview'
}

const handleShare = (paletteId) => {
  modalState.selectedPaletteId = paletteId
  modalState.currentTab = 'share'
}

const handleLoad = (paletteId) => {
  emit('load-palette', paletteId)
  emit('update:modelValue', false)
}

const handleDelete = (paletteId) => {
  // Handle delete logic
}

const handleClose = (isOpen) => {
  if (!isOpen) {
    // Reset state when closing
    modalState.currentTab = 'saved'
    modalState.selectedPaletteId = null
  }
  emit('update:modelValue', isOpen)
}
</script>
```

#### 3. Styling
```vue
<style>
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: var(--border-container-light);
}

.back-button {
  background: none;
  border: none;
  color: var(--color-success-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: 8px 0;
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: var(--color-success-border-hover);
  text-decoration: underline;
}

.modal-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: var(--border-container-light);
}

.modal-content {
  min-height: 400px;
}
</style>
```

---

## Phase 3: Create Tab Component Files

### 1. SavedPalettesGrid.vue
**File**: `components/shared/SavedPalettesGrid.vue`

Extract the saved palettes grid logic from current SavedPalettesModal:
- Grid of MiniPalette components
- Palette storage integration  
- Action emits for eye-preview, share, load, delete

### 2. EyePreviewCanvas.vue  
**File**: `components/shared/EyePreviewCanvas.vue`

Move eye preview functionality to tab component:
- Accepts `palette-id` prop
- Looks up palette data by ID
- Renders eye preview canvas

### 3. SharePaletteForm.vue
**File**: `components/shared/SharePaletteForm.vue`

Move share functionality to tab component:
- Accepts `palette-id` prop
- Share options and functionality
- Export capabilities

---

## Phase 4: Update SwatchesExplorer Integration

**File**: `components/SwatchesExplorer.vue`

### Changes to Make:

#### 1. Replace SavedPalettesModal Import
```js
// Replace:
import SavedPalettesModal from './shared/SavedPalettesModal.vue'

// With:
import PaletteManagerModal from './shared/PaletteManagerModal.vue'
```

#### 2. Update Modal States
```js
// Replace showSavedPalettesModal with:
const showPaletteManager = ref(false)

// Keep simplified SavePaletteModal:
const showSavePaletteModal = ref(false) // Title input only
```

#### 3. Update Event Handlers
```js
// Simplified - only opens title input modal
const handleViewSavedPalettes = () => {
  showPaletteManager.value = true
}

// Toast action opens palette manager
const handleToastViewSavedPalettes = () => {
  showPaletteManager.value = true
}
```

#### 4. Update Template
```vue
<!-- Simplified Save Modal (title input only) -->
<SavePaletteModal 
  v-model="showSavePaletteModal"
  @save="handleSavePalette"
/>

<!-- New Tabbed Palette Manager -->
<PaletteManagerModal 
  v-model="showPaletteManager"
  @load-palette="handleLoadPalette"
/>
```

---

## Benefits of This Architecture

### ✅ User Experience Benefits
- **No modal stacking** - everything in one cohesive interface
- **Clear navigation** - back button always available
- **Seamless transitions** - smooth tab switching
- **Contextual titles** - always know where you are

### ✅ Technical Benefits  
- **Single data context** - one modal manages palette operations
- **No prop drilling** between modals
- **Simplified state management** - centralized modal state
- **Better performance** - components cached and reused

### ✅ Architectural Benefits
- **Logical separation** - title input vs palette management
- **Extensible design** - easy to add new tabs
- **Consistent UI** - unified design language
- **Maintainable code** - clear component responsibilities

### ✅ Navigation Flow
1. **Save Flow**: SavePaletteModal (title) → Loader → Toast → "View Saved Palettes"
2. **Management Flow**: PaletteManagerModal opens to "All Palettes" tab
3. **Action Flow**: Click Eye Preview/Share → switches to respective tab with back navigation
4. **Return Flow**: "Back to All Saved Palettes" → returns to main grid view

---

## Implementation Order

1. **Phase 1**: Simplify SavePaletteModal (remove success state)
2. **Phase 2**: Create PaletteManagerModal with tabbed structure  
3. **Phase 3**: Extract and create individual tab components
4. **Phase 4**: Update SwatchesExplorer integration
5. **Testing**: Verify all flows work without modal conflicts

## Files to Create/Modify

### New Files:
- `components/shared/PaletteManagerModal.vue`
- `components/shared/SavedPalettesGrid.vue`  
- `components/shared/EyePreviewCanvas.vue`
- `components/shared/SharePaletteForm.vue`

### Modified Files:
- `components/shared/SavePaletteModal.vue` (simplified)
- `components/SwatchesExplorer.vue` (integration)

### Deprecated Files:
- `components/shared/SavedPalettesModal.vue` (replaced by PaletteManagerModal)