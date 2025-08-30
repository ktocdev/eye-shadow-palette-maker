import { ref } from 'vue'

/**
 * Composable for managing title editing functionality
 * @returns {Object} Title editing state and methods
 */
export function useTitleEditing() {
  const isEditingTitle = ref(false)
  const editedTitle = ref('')

  let originalTitle = ''

  const startTitleEdit = (currentTitle) => {
    originalTitle = currentTitle
    editedTitle.value = currentTitle
    isEditingTitle.value = true
  }

  const saveTitleEdit = () => {
    const newTitle = editedTitle.value.trim()
    if (newTitle !== '') {
      isEditingTitle.value = false
      return {
        success: true,
        newTitle: newTitle,
        hasChanged: newTitle !== originalTitle
      }
    }
    return {
      success: false,
      newTitle: originalTitle,
      hasChanged: false
    }
  }

  const cancelTitleEdit = () => {
    editedTitle.value = originalTitle
    isEditingTitle.value = false
    return originalTitle
  }

  return {
    // State
    isEditingTitle,
    editedTitle,
    
    // Methods
    startTitleEdit,
    saveTitleEdit,
    cancelTitleEdit
  }
}
