import { ref, computed } from 'vue'

// Singleton state - shared across all instances
const savedPalettes = ref([])
const demoPalettes = ref([])

/**
 * Composable for managing palette storage operations with localStorage
 * @returns {Object} Storage state and methods
 */
export function usePaletteStorage() {

  const hasSavedPalettes = computed(() => {
    return savedPalettes.value.length > 0
  })

  const loadSavedPalettes = () => {
    const palettes = localStorage.getItem('eyeshadow-saved-palettes')
    if (palettes) {
      try {
        let loadedPalettes = JSON.parse(palettes)
        
        // Migrate palettes that don't have IDs (from older versions)
        let needsUpdate = false
        loadedPalettes = loadedPalettes.map(palette => {
          if (!palette.id) {
            needsUpdate = true
            return {
              ...palette,
              id: `migrated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }
          }
          return palette
        })
        
        // Save back to localStorage if we added IDs
        if (needsUpdate) {
          localStorage.setItem('eyeshadow-saved-palettes', JSON.stringify(loadedPalettes))
        }
        
        savedPalettes.value = loadedPalettes
      } catch (error) {
        console.error('Failed to parse saved palettes:', error)
        savedPalettes.value = []
      }
    } else {
      savedPalettes.value = []
    }
  }

  const savePalette = (paletteData, title, gridSize = 2) => {
    const newPalette = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      gridSize: gridSize,
      colors: paletteData.filter(color => color !== null),
      createdAt: new Date().toISOString()
    }

    try {
      savedPalettes.value.push(newPalette)
      localStorage.setItem('eyeshadow-saved-palettes', JSON.stringify(savedPalettes.value))
    } catch (error) {
      console.error('Failed to save palette:', error)
      // Rollback the addition if localStorage fails
      const index = savedPalettes.value.findIndex(p => p.id === newPalette.id)
      if (index !== -1) {
        savedPalettes.value.splice(index, 1)
      }
      throw error
    }
    
    return newPalette
  }

  const deletePalette = (paletteId) => {
    const index = savedPalettes.value.findIndex(p => p.id === paletteId)
    if (index !== -1) {
      const removedPalette = savedPalettes.value[index]
      try {
        savedPalettes.value.splice(index, 1)
        localStorage.setItem('eyeshadow-saved-palettes', JSON.stringify(savedPalettes.value))
      } catch (error) {
        console.error('Failed to delete palette:', error)
        // Rollback the deletion if localStorage fails
        savedPalettes.value.splice(index, 0, removedPalette)
        throw error
      }
    }
  }

  const updatePaletteTitle = (paletteId, newTitle) => {
    const palette = savedPalettes.value.find(p => p.id === paletteId)
    if (palette) {
      const oldTitle = palette.title
      try {
        palette.title = newTitle.trim()
        localStorage.setItem('eyeshadow-saved-palettes', JSON.stringify(savedPalettes.value))
      } catch (error) {
        console.error('Failed to update palette title:', error)
        // Rollback the title change if localStorage fails
        palette.title = oldTitle
        throw error
      }
    }
  }

  const findPaletteById = (paletteId) => {
    // Check saved palettes first
    const savedPalette = savedPalettes.value.find(p => p.id === paletteId)
    if (savedPalette) return savedPalette
    
    // Check demo palettes
    const demoPalette = demoPalettes.value.find(p => p.id === paletteId)
    if (demoPalette) return demoPalette
    
    return null
  }

  const registerDemoPalettes = (palettes) => {
    demoPalettes.value = palettes
  }


  return {
    // State
    savedPalettes,
    
    // Computed
    hasSavedPalettes,
    
    // Methods
    loadSavedPalettes,
    savePalette,
    deletePalette,
    updatePaletteTitle,
    findPaletteById,
    registerDemoPalettes
  }
}
