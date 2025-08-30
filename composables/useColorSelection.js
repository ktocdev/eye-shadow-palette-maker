import { ref, computed } from 'vue'

/**
 * Global composable for managing color selection state
 * Allows users to select colors from carousel and place them precisely in the grid
 */

// Global reactive state - shared across all components
const selectedColor = ref(null)

export function useColorSelection() {
  
  /**
   * Select a color for placement
   * @param {Object} colorData - Color data object to select
   */
  const selectColor = (colorData) => {
    selectedColor.value = colorData
  }
  
  /**
   * Clear the current selection
   */
  const clearSelection = () => {
    selectedColor.value = null
  }
  
  /**
   * Check if a specific color is currently selected
   * @param {Object} colorData - Color data to check
   * @returns {boolean} Whether this color is selected
   */
  const isColorSelected = (colorData) => {
    if (!selectedColor.value || !colorData) return false
    return selectedColor.value.hexCode === colorData.hexCode && 
           selectedColor.value.colorName === colorData.colorName
  }
  
  /**
   * Check if any color is currently selected
   * @returns {boolean} Whether there is a selected color
   */
  const hasSelection = computed(() => {
    return selectedColor.value !== null
  })
  
  return {
    selectedColor: computed(() => selectedColor.value),
    hasSelection,
    selectColor,
    clearSelection,
    isColorSelected
  }
}