import { ref, computed } from 'vue'

/**
 * Composable for managing palette state including titles, user interactions, and display logic
 * @returns {Object} Palette state and methods
 */
export function usePaletteState() {
  const loadedPaletteTitle = ref('')
  const loadedPaletteModified = ref(false)
  const hasUserInteracted = ref(false)
  const shouldCollapseAppInfo = ref(false)
  const inlinePaletteTitle = ref('')

  const showInlineTitleInput = computed(() => {
    return (loadedPaletteTitle.value === '' && hasUserInteracted.value) || 
           (loadedPaletteTitle.value !== '' && loadedPaletteModified.value)
  })

  const showLoadedPaletteTitle = computed(() => {
    return loadedPaletteTitle.value !== '' && !loadedPaletteModified.value
  })

  const showAppInfo = computed(() => {
    return !hasUserInteracted.value && loadedPaletteTitle.value === ''
  })

  const appInfoInitiallyOpen = computed(() => {
    return !shouldCollapseAppInfo.value
  })

  const canSavePalette = computed(() => {
    if (loadedPaletteTitle.value === '') {
      return inlinePaletteTitle.value.trim() !== ''
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