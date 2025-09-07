import { ref } from 'vue'

/**
 * Composable for handling drag and drop operations
 * @returns {Object} Drag and drop utilities
 */
export function useDragDrop(options = {}) {
  const isDragging = ref(false)
  const dragData = ref(null)
  const dragPreview = ref(null)
  const touchStartData = ref(null)
  const dragConfirmed = ref(false) // Track when we've confirmed this is a drag, not a swipe
  
  // Swipe detection options
  const {
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    onDragStart = () => {},
    onDragOut = () => {},
    onDropSuccess = () => {},
    swipeThreshold = 50,
    swipeAngleThreshold = 30, // degrees from horizontal
    dragConfirmThreshold = 20 // pixels of non-sideways movement to confirm drag
  } = options
  
  
  /**
   * Create standardized color data object
   * @param {Object} color - Color object with various possible structures
   * @returns {Object} Standardized color data
   */
  const createColorData = (color) => {
    // Handle different color object structures
    if (color.colorName) {
      // Already in the right format
      return color
    }
    
    // Handle palette color format
    return {
      colorName: color.name,
      hexCode: color.hex,
      bgColor: color.hex,
      isDark: color.is_dark || false
    }
  }
  
  /**
   * Calculate angle between two points in degrees
   * @param {number} x1 - Start X coordinate
   * @param {number} y1 - Start Y coordinate
   * @param {number} x2 - End X coordinate
   * @param {number} y2 - End Y coordinate
   * @returns {number} Angle in degrees from horizontal
   */
  const calculateAngle = (x1, y1, x2, y2) => {
    const deltaX = x2 - x1
    const deltaY = y2 - y1
    const angle = Math.abs(Math.atan2(deltaY, deltaX) * (180 / Math.PI))
    return Math.min(angle, 180 - angle) // Return acute angle
  }
  
  /**
   * Check if movement is primarily horizontal (sideways)
   * @param {number} startX - Start X coordinate
   * @param {number} startY - Start Y coordinate
   * @param {number} endX - End X coordinate
   * @param {number} endY - End Y coordinate
   * @param {boolean} requireFullDistance - Whether to require full swipe threshold distance
   * @returns {boolean} True if movement is primarily sideways
   */
  const isPrimarilySideways = (startX, startY, endX, endY, requireFullDistance = true) => {
    const deltaX = Math.abs(endX - startX)
    const deltaY = Math.abs(endY - startY)
    
    // For early detection during touchmove, use a smaller threshold
    const minDistance = requireFullDistance ? swipeThreshold : dragConfirmThreshold
    
    // Must move at least the minimum distance horizontally
    if (deltaX < minDistance) return false
    
    // Must be primarily horizontal (more horizontal than vertical movement)
    if (deltaX <= deltaY) return false
    
    // Calculate angle from horizontal
    const angle = calculateAngle(startX, startY, endX, endY)
    
    // Must be within angle threshold of horizontal
    return angle <= swipeAngleThreshold
  }
  
  /**
   * Check if we should confirm this as a drag operation
   * @param {number} startX - Start X coordinate
   * @param {number} startY - Start Y coordinate
   * @param {number} currentX - Current X coordinate
   * @param {number} currentY - Current Y coordinate
   * @returns {boolean} True if we should confirm drag
   */
  const shouldConfirmDrag = (startX, startY, currentX, currentY) => {
    const deltaX = Math.abs(currentX - startX)
    const deltaY = Math.abs(currentY - startY)
    const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // If we haven't moved enough, don't confirm yet
    if (totalDistance < dragConfirmThreshold) return false
    
    // Movement is sufficient - confirm drag
    return true
  }
  
  /**
   * Create drag preview element for both desktop and mobile events
   * @param {HTMLElement} sourceElement - Element being dragged
   * @param {Object} position - Position object with clientX and clientY properties
   * @returns {HTMLElement} Drag preview element
   */
  const createDragPreview = (sourceElement, position) => {
    // Clone the source element
    const preview = sourceElement.cloneNode(true)
    
    // Style the preview
    preview.classList.add('drag-preview')
    preview.style.position = 'fixed'
    preview.style.zIndex = '10000'
    preview.style.pointerEvents = 'none'
    preview.style.opacity = '0.7'
    preview.style.transform = 'scale(0.9)'
    preview.style.borderRadius = 'var(--radius-container, 8px)'
    preview.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
    
    // Position at cursor/touch location
    const rect = sourceElement.getBoundingClientRect()
    preview.style.left = `${position.clientX - rect.width / 2}px`
    preview.style.top = `${position.clientY - rect.height / 2}px`
    preview.style.width = `${rect.width}px`
    preview.style.height = `${rect.height}px`
    
    // Add to body
    document.body.appendChild(preview)
    
    return preview
  }
  
  /**
   * Update drag preview position for both desktop and mobile events
   * @param {Object} position - Position object with clientX and clientY properties
   */
  const updateDragPreview = (position) => {
    if (dragPreview.value) {
      const rect = dragPreview.value.getBoundingClientRect()
      dragPreview.value.style.left = `${position.clientX - rect.width / 2}px`
      dragPreview.value.style.top = `${position.clientY - rect.height / 2}px`
    }
  }
  
  /**
   * Remove drag preview element
   */
  const removeDragPreview = () => {
    if (dragPreview.value) {
      document.body.removeChild(dragPreview.value)
      dragPreview.value = null
    }
  }
  
  /**
   * Handle drag start for desktop/mouse events
   * @param {Event} event - Drag event
   * @param {Object} colorData - Color data to drag
   * @param {boolean} isFromGrid - Whether drag is from grid cell
   */
  const handleDragStart = (event, colorData, isFromGrid = false) => {
    try {
      const standardizedData = createColorData(colorData)
      
      dragData.value = standardizedData
      isDragging.value = true
      
      // Set data transfer for desktop drag
      const jsonData = JSON.stringify(standardizedData)
      event.dataTransfer.setData('application/json', jsonData)
      
      if (isFromGrid) {
        event.dataTransfer.setData('text/plain', 'grid-item')
      }
      
      // Hide default drag image and use our custom preview
      const emptyImg = new Image()
      emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='
      event.dataTransfer.setDragImage(emptyImg, 0, 0)
      
      // Add visual feedback to source
      event.target.classList.add('dragging')
      
      // Create custom drag preview for desktop
      const position = { 
        clientX: event.clientX, 
        clientY: event.clientY 
      }
      dragPreview.value = createDragPreview(event.target, position)
      
      // Play appropriate drag sound based on source
      if (!isFromGrid) {
        onDragStart() // Upward sweep for carousel swatches
      } else {
        onDragOut() // Downward sweep for grid swatches
      }
    } catch (error) {
      console.error('Error in handleDragStart:', error, { colorData, isFromGrid })
    }
  }
  
  /**
   * Handle drag for desktop/mouse events (to update preview position)
   * @param {Event} event - Drag event
   */
  const handleDrag = (event) => {
    if (!isDragging.value || !dragPreview.value) return
    
    // Update drag preview position for desktop
    const position = { 
      clientX: event.clientX, 
      clientY: event.clientY 
    }
    updateDragPreview(position)
  }
  
  /**
   * Handle drag end for desktop/mouse events
   * @param {Event} event - Drag event
   */
  const handleDragEnd = (event) => {
    isDragging.value = false
    dragData.value = null
    
    // Remove drag preview
    removeDragPreview()
    
    event.target.classList.remove('dragging')
  }
  
  /**
   * Handle touch start for mobile events
   * @param {Event} event - Touch event
   * @param {Object} colorData - Color data to drag
   * @param {boolean} isFromGrid - Whether drag is from grid cell
   */
  const handleTouchStart = (event, colorData, isFromGrid = false) => {
    try {
      const touch = event.touches[0]
      const standardizedData = createColorData(colorData)
      
      // Store initial touch data for swipe detection
      touchStartData.value = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        colorData: standardizedData,
        isFromGrid,
        target: event.target
      }
      
      // Reset drag confirmation
      dragConfirmed.value = false
      
      // Don't immediately start drag - wait to see if it's a swipe
      // We'll start the actual drag in touchmove if needed
    } catch (error) {
      console.error('Error in handleTouchStart:', error, { colorData, isFromGrid })
    }
  }
  
  /**
   * Handle touch move for mobile events
   * @param {Event} event - Touch event
   */
  const handleTouchMove = (event) => {
    if (!touchStartData.value) return
    
    const touch = event.touches[0]
    const startData = touchStartData.value
    const deltaX = touch.clientX - startData.x
    const deltaY = touch.clientY - startData.y
    
    // Early prevention for mobile pull-to-refresh on any non-trivial vertical movement
    // This prevents the browser from starting pull-to-refresh while we determine intent
    if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
      event.preventDefault()
    }
    
    // If we haven't confirmed this as a drag yet, check what type of gesture this is
    if (!dragConfirmed.value) {
      // Check if this is primarily a sideways movement (swipe) - but only treat as swipe for carousel items
      if (isPrimarilySideways(startData.x, startData.y, touch.clientX, touch.clientY, false)) {
        // Check if this is a carousel swatch that should handle swipes for navigation
        const isCarouselSwatch = startData.target.classList.contains('carousel-swatch')
        
        if (isCarouselSwatch) {
          // This looks like a swipe in progress for carousel navigation - return early
          return
        }
        // If this is a grid swatch, treat horizontal movement as a drag immediately
        // This allows grid items to drag horizontally without waiting for more movement
        dragConfirmed.value = true
        
        // Start drag
        dragData.value = { ...startData.colorData, isFromGrid: startData.isFromGrid }
        isDragging.value = true
        
        // Add visual feedback to source
        startData.target.classList.add('dragging')
        
        // Create drag preview
        dragPreview.value = createDragPreview(startData.target, touch)
        
        // Play appropriate drag sound based on source
        if (!startData.isFromGrid) {
          onDragStart() // Upward sweep for carousel swatches
        } else {
          onDragOut() // Downward sweep for grid swatches
        }
      } else if (shouldConfirmDrag(startData.x, startData.y, touch.clientX, touch.clientY)) {
        // Confirm this is a drag operation
        dragConfirmed.value = true
        
        // Start drag
        dragData.value = { ...startData.colorData, isFromGrid: startData.isFromGrid }
        isDragging.value = true
        
        // Add visual feedback to source
        startData.target.classList.add('dragging')
        
        // Create drag preview ONLY now that we're confirmed
        dragPreview.value = createDragPreview(startData.target, touch)
        
        // Play appropriate drag sound based on source
        if (!startData.isFromGrid) {
          onDragStart() // Upward sweep for carousel swatches
        } else {
          onDragOut() // Downward sweep for grid swatches
        }
      } else {
        // Not enough movement to confirm either gesture yet - but we've already prevented default
        return
      }
    }
    
    // If we get here, we have a confirmed drag operation (default already prevented)
    
    // Update drag preview position
    updateDragPreview(touch)
    
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    
    // Remove drag-over class from all grid cells
    document.querySelectorAll('.grid-cell').forEach(cell => {
      cell.classList.remove('drag-over')
    })
    
    // Add drag-over class to current cell
    const gridCell = elementBelow?.closest('.grid-cell')
    if (gridCell) {
      gridCell.classList.add('drag-over')
    }
  }
  
  /**
   * Handle touch end for mobile events
   * @param {Event} event - Touch event
   */
  const handleTouchEnd = (event) => {
    if (!touchStartData.value) return
    
    const touch = event.changedTouches[0]
    const startData = touchStartData.value
    
    // If drag was never confirmed, check if this was a completed swipe
    if (!dragConfirmed.value) {
      // Check if this was a swipe - use full threshold for final confirmation
      if (isPrimarilySideways(startData.x, startData.y, touch.clientX, touch.clientY, true)) {
        // Handle swipe
        const deltaX = touch.clientX - startData.x
        
        if (deltaX > 0) {
          // Swipe right
          onSwipeRight()
        } else {
          // Swipe left
          onSwipeLeft()
        }
      }
      
      // Clean up and return (no drag to handle)
      touchStartData.value = null
      dragConfirmed.value = false
      return
    }
    
    // If we get here, it was a confirmed drag operation
    if (!isDragging.value) {
      // This shouldn't happen, but clean up just in case
      touchStartData.value = null
      dragConfirmed.value = false
      return
    }
    
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    const gridCell = elementBelow?.closest('.grid-cell')
    
    if (gridCell && dragData.value) {
      // Dispatch custom drop event
      const dropEvent = new CustomEvent('touchdrop', {
        detail: {
          dragData: dragData.value,
          targetCell: gridCell,
          isFromGrid: dragData.value.isFromGrid || false
        }
      })
      document.dispatchEvent(dropEvent)
    }
    
    // Clean up
    document.querySelectorAll('.grid-cell').forEach(cell => {
      cell.classList.remove('drag-over')
    })
    
    // Remove drag preview
    removeDragPreview()
    
    if (startData.target) {
      startData.target.classList.remove('dragging')
    }
    
    isDragging.value = false
    dragData.value = null
    touchStartData.value = null
    dragConfirmed.value = false
  }
  
  /**
   * Handle drop events for desktop/mouse
   * @param {Event} event - Drop event
   * @returns {Object|null} Parsed drag data or null if error
   */
  const handleDrop = (event) => {
    event.preventDefault()
    
    try {
      const jsonData = event.dataTransfer.getData('application/json')
      if (!jsonData) {
        console.warn('No JSON data found in drop event')
        return null
      }
      
      const colorData = JSON.parse(jsonData)
      const isGridItem = event.dataTransfer.getData('text/plain') === 'grid-item'
      
      // Validate color data structure
      if (!colorData || typeof colorData !== 'object') {
        console.warn('Invalid color data structure:', colorData)
        return null
      }
      
      return {
        colorData,
        isFromGrid: isGridItem
      }
    } catch (err) {
      console.error('Error parsing drop data:', err, {
        types: event.dataTransfer.types,
        jsonData: event.dataTransfer.getData('application/json')
      })
      return null
    }
  }
  
  /**
   * Handle drag over events
   * @param {Event} event - Drag over event
   */
  const handleDragOver = (event) => {
    event.preventDefault()
    event.currentTarget.classList.add('drag-over')
  }
  
  /**
   * Handle drag leave events
   * @param {Event} event - Drag leave event
   */
  const handleDragLeave = (event) => {
    event.currentTarget.classList.remove('drag-over')
  }
  
  /**
   * Reset drag state (useful for cleanup)
   */
  const resetDragState = () => {
    isDragging.value = false
    dragData.value = null
    touchStartData.value = null
    dragConfirmed.value = false
    
    // Remove drag preview
    removeDragPreview()
    
    // Remove any remaining drag visual feedback
    document.querySelectorAll('.dragging, .drag-over').forEach(element => {
      element.classList.remove('dragging', 'drag-over')
    })
  }
  
  return {
    isDragging,
    dragData,
    createColorData,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    resetDragState
  }
}