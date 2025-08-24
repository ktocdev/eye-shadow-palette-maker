import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable for handling swipe gestures on mobile devices
 * @param {Object} options - Swipe options
 * @returns {Object} Swipe utilities and event handlers
 */
export function useSwipe(options = {}) {
  const {
    threshold = 50, // Minimum distance for swipe
    timeout = 300,  // Maximum time for swipe gesture
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    onSwipeUp = () => {},
    onSwipeDown = () => {}
  } = options

  const startX = ref(0)
  const startY = ref(0)
  const startTime = ref(0)
  const isTracking = ref(false)

  /**
   * Handle touch start event
   * @param {TouchEvent} event - Touch start event
   */
  const handleTouchStart = (event) => {
    // Don't start swipe tracking if touch started on a draggable element
    if (event.target.closest('[draggable="true"]')) {
      return
    }

    const touch = event.touches[0]
    startX.value = touch.clientX
    startY.value = touch.clientY
    startTime.value = Date.now()
    isTracking.value = true
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} event - Touch end event
   */
  const handleTouchEnd = (event) => {
    if (!isTracking.value) return

    const touch = event.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    const endTime = Date.now()

    const deltaX = endX - startX.value
    const deltaY = endY - startY.value
    const deltaTime = endTime - startTime.value

    // Reset tracking
    isTracking.value = false

    // Check if gesture was within time limit
    if (deltaTime > timeout) return

    // Check if horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight()
        } else {
          onSwipeLeft()
        }
      }
    }
    // Check if vertical swipe
    else if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        onSwipeDown()
      } else {
        onSwipeUp()
      }
    }
  }

  /**
   * Handle touch move event (prevent scrolling during swipe)
   * @param {TouchEvent} event - Touch move event
   */
  const handleTouchMove = (event) => {
    if (!isTracking.value) return

    // Don't interfere with draggable elements
    if (event.target.closest('[draggable="true"]')) {
      return
    }

    // Prevent default scrolling behavior during horizontal swipes
    const touch = event.touches[0]
    const deltaX = Math.abs(touch.clientX - startX.value)
    const deltaY = Math.abs(touch.clientY - startY.value)

    // If horizontal movement is greater than vertical and exceeds small threshold, prevent default
    if (deltaX > deltaY && deltaX > 10) {
      event.preventDefault()
    }
  }

  /**
   * Add swipe event listeners to an element
   * @param {HTMLElement} element - Element to add listeners to
   */
  const addSwipeListeners = (element) => {
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
  }

  /**
   * Remove swipe event listeners from an element
   * @param {HTMLElement} element - Element to remove listeners from
   */
  const removeSwipeListeners = (element) => {
    if (!element) return

    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('touchmove', handleTouchMove)
  }

  return {
    addSwipeListeners,
    removeSwipeListeners,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove
  }
}
