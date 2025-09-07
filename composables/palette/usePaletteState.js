import { ref, computed } from 'vue'

/**
 * Composable for managing palette state including titles, user interactions, and display logic
 * @param {Object} options - Configuration options
 * @param {import('vue').Ref<boolean>} options.isGridFull - Reactive reference to grid full state
 * @returns {Object} Palette state and methods
 */
export function usePaletteState(options = {}) {
  const { isGridFull } = options
  const loadedPaletteTitle = ref('')
  const loadedPaletteModified = ref(false)
  const hasUserInteracted = ref(false)
  const shouldCollapseAppInfo = ref(false)
  const inlinePaletteTitle = ref('')

  const showInlineTitleInput = computed(() => {
    // Always show title input when no palette is loaded or when loaded palette is modified
    return loadedPaletteTitle.value === '' || 
           (loadedPaletteTitle.value !== '' && loadedPaletteModified.value)
  })

  const showLoadedPaletteTitle = computed(() => {
    return loadedPaletteTitle.value !== '' && !loadedPaletteModified.value
  })

  const showAppInfo = computed(() => {
    // Never show app info - always show title input or loaded title instead
    return false
  })

  const appInfoInitiallyOpen = computed(() => {
    return !shouldCollapseAppInfo.value
  })

  const canSavePalette = computed(() => {
    if (loadedPaletteTitle.value === '') {
      // Allow save if grid is full OR if title is provided
      const hasTitle = inlinePaletteTitle.value.trim() !== ''
      const gridIsFull = isGridFull && isGridFull.value
      return hasTitle || gridIsFull
    }
    return loadedPaletteModified.value
  })

  const triggerUserInteraction = () => {
    if (!hasUserInteracted.value) {
      hasUserInteracted.value = true
    }
  }

  const loadPalette = (paletteData) => {
    loadedPaletteTitle.value = paletteData.title
    loadedPaletteModified.value = false
    shouldCollapseAppInfo.value = true
    triggerUserInteraction()
  }

  const modifyPalette = () => {
    if (loadedPaletteTitle.value !== '') {
      loadedPaletteModified.value = true
      shouldCollapseAppInfo.value = true
    }
    triggerUserInteraction()
  }

  const clearPalette = () => {
    loadedPaletteTitle.value = ''
    loadedPaletteModified.value = false
    inlinePaletteTitle.value = ''
    shouldCollapseAppInfo.value = true
    triggerUserInteraction()
  }

  const updateLoadedPaletteTitle = (newTitle) => {
    loadedPaletteTitle.value = newTitle
  }


  return {
    // State
    loadedPaletteTitle,
    loadedPaletteModified,
    hasUserInteracted,
    shouldCollapseAppInfo,
    inlinePaletteTitle,
    
    // Computed
    showInlineTitleInput,
    showLoadedPaletteTitle,
    showAppInfo,
    appInfoInitiallyOpen,
    canSavePalette,
    
    // Methods
    triggerUserInteraction,
    loadPalette,
    modifyPalette,
    clearPalette,
    updateLoadedPaletteTitle
  }
}
