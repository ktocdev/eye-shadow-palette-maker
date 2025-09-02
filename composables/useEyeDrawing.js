import { ref, computed } from 'vue'

/**
 * Composable for managing eye drawing operations on canvas
 * Handles eye anatomy zones, drawing, and color application
 */

// Eye anatomy zones - these define where different eyeshadow colors can be applied
export const EYE_ZONES = {
  MOBILE_LID: 'mobile_lid',           // Main eyelid area
  CREASE: 'crease',                   // Crease/transition area  
  OUTER_V: 'outer_v',                 // Outer corner V-shape
  INNER_CORNER: 'inner_corner',       // Inner corner highlight
  BROW_BONE: 'brow_bone',            // Brow bone highlight
  LOWER_LASH: 'lower_lash',          // Lower lash line
  WATERLINE: 'waterline'              // Inner rim (optional)
}

// Zone descriptions for UI
export const ZONE_INFO = {
  [EYE_ZONES.MOBILE_LID]: {
    name: 'Lid',
    description: 'Main eyelid area - where most eyeshadow color goes',
    color: '#E8F4FD'
  },
  [EYE_ZONES.CREASE]: {
    name: 'Crease', 
    description: 'Transition area above the lid - for depth and dimension',
    color: '#D1E7DD'
  },
  [EYE_ZONES.OUTER_V]: {
    name: 'Outer V',
    description: 'Outer corner - for drama and eye shape definition',
    color: '#F8D7DA'
  },
  [EYE_ZONES.INNER_CORNER]: {
    name: 'Inner Corner',
    description: 'Inner corner highlight - to brighten and open the eyes',
    color: '#FFF3CD'
  },
  [EYE_ZONES.BROW_BONE]: {
    name: 'Brow Bone',
    description: 'Area under the brow - for highlighting and lifting',
    color: '#E2E3E5'
  },
  [EYE_ZONES.LOWER_LASH]: {
    name: 'Lower Lash',
    description: 'Lower lash line - for definition and color coordination',
    color: '#D4EDDA'
  }
}

// Predefined skin tones
export const SKIN_TONES = [
  { name: 'Fair', color: '#F4E4C1' },
  { name: 'Light', color: '#F2D2A9' },
  { name: 'Medium', color: '#E8B887' },
  { name: 'Tan', color: '#D4A574' },
  { name: 'Deep', color: '#B8956A' },
  { name: 'Dark', color: '#8B6F47' },
  { name: 'Rich', color: '#6D4C35' },
  { name: 'Ebony', color: '#4A3429' }
]

// Predefined eye colors
export const EYE_COLORS = [
  { name: 'Gray', color: '#708090' },
  { name: 'Light Blue', color: '#6BB6FF' },
  { name: 'Blue', color: '#4A90A4' },
  { name: 'Green', color: '#4A7C59' },
  { name: 'Hazel', color: '#6f7a3eff' },
  { name: 'Brown', color: '#914f20ff' },
  { name: 'Medium Brown', color: '#66431fff' },
  { name: 'Dark Brown', color: '#3d281dff' }
]

export function useEyeDrawing() {
  const canvasRef = ref(null)
  const canvasContext = ref(null)
  const isDrawing = ref(false)
  const selectedColor = ref(null)
  const brushSize = ref(15)
  const brushOpacity = ref(0.6)
  const lastDrawPosition = ref({ x: 0, y: 0 })
  const eyeLayer = ref(null) // Store the base eye drawing
  const hasDrawnOnCanvas = ref(false) // Track if user has drawn anything
  const skinTone = ref(SKIN_TONES[0].color) // Default to fair skin
  const eyeColor = ref(EYE_COLORS[3].color) // Default to blue eyes

  /**
   * Initialize the canvas and draw the base eye shape
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  const initializeCanvas = (canvas) => {
    console.log('initializeCanvas called with:', canvas)
    
    if (!canvas) {
      console.error('Canvas element is null or undefined')
      return false
    }
    
    canvasRef.value = canvas
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      console.error('Failed to get 2D context from canvas')
      return false
    }
    
    canvasContext.value = ctx
    
    // Set canvas size
    canvas.width = 400
    canvas.height = 300
    console.log('Canvas size set to:', canvas.width, 'x', canvas.height)
    
    // Draw the base eye
    const drawResult = drawBaseEye()
    console.log('Base eye drawing completed:', drawResult)
    
    return true
  }

  /**
   * Draw the basic eye shape and anatomy based on almond eye reference
   */
  const drawBaseEye = () => {
    const ctx = canvasContext.value
    console.log('drawBaseEye called, context:', ctx)
    
    if (!ctx) {
      console.error('No canvas context available for drawing')
      return false
    }

    try {
      // Clear canvas
      ctx.clearRect(0, 0, 400, 300)
      console.log('Canvas cleared')
      
      // Draw base skin tone
      ctx.fillStyle = skinTone.value
      ctx.fillRect(0, 0, 400, 300)
      console.log('Base skin tone drawn')
      
      // Eye coordinates (centered in 400x300 canvas)
      const centerX = 200
      const centerY = 150
      
      // === LAYER 1: UPPER EYE MASK (SHALLOW U SHAPE) ===
      ctx.beginPath()
      ctx.fillStyle = skinTone.value // Base skin tone
      ctx.moveTo(centerX - 100, centerY - 50) // Top left
      ctx.lineTo(centerX + 100, centerY - 50) // Top right  
      ctx.lineTo(centerX + 100, centerY - 5) // Right side down
      ctx.quadraticCurveTo(centerX + 40, centerY - 15, centerX, centerY - 12)
      ctx.quadraticCurveTo(centerX - 40, centerY - 15, centerX - 100, centerY - 5)
      ctx.lineTo(centerX - 100, centerY - 50)
      ctx.closePath()
      ctx.fill()
      
      // === LAYER 1: LOWER EYE MASK (INVERTED SHALLOW U SHAPE) ===
      ctx.beginPath()
      ctx.fillStyle = skinTone.value // Base skin tone
      ctx.moveTo(centerX - 100, centerY + 5)
      ctx.quadraticCurveTo(centerX - 40, centerY + 15, centerX, centerY + 12)
      ctx.quadraticCurveTo(centerX + 40, centerY + 15, centerX + 100, centerY + 5)
      ctx.lineTo(centerX + 100, centerY + 50)
      ctx.lineTo(centerX - 100, centerY + 50)
      ctx.lineTo(centerX - 100, centerY + 5)
      ctx.closePath()
      ctx.fill()
      
      // === EYE WHITE (SCLERA) ===
      ctx.beginPath()
      ctx.fillStyle = '#FFFFFF'
      ctx.moveTo(centerX - 80, centerY) // Left point
      ctx.quadraticCurveTo(centerX - 40, centerY - 30, centerX, centerY - 25) // Top curve
      ctx.quadraticCurveTo(centerX + 40, centerY - 30, centerX + 80, centerY) // Right point
      ctx.quadraticCurveTo(centerX + 40, centerY + 25, centerX, centerY + 20) // Bottom curve
      ctx.quadraticCurveTo(centerX - 40, centerY + 25, centerX - 80, centerY) // Back to left point
      ctx.closePath()
      ctx.fill()
      
      // === IRIS ===
      ctx.beginPath()
      ctx.fillStyle = eyeColor.value // Customizable iris color
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2)
      ctx.fill()
      
      // === PUPIL ===
      ctx.beginPath()
      ctx.fillStyle = '#000000'
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
      ctx.fill()
      
      // === UPPER LASH LINE (PERFECTLY ALIGNED TO EYE SHAPE) ===
      ctx.beginPath()
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 2
      // Follow the exact same curve as the top of the eye white
      ctx.moveTo(centerX - 80, centerY) // Left point (same as eye)
      ctx.quadraticCurveTo(centerX - 40, centerY - 30, centerX, centerY - 25) // Top curve (same as eye)
      ctx.quadraticCurveTo(centerX + 40, centerY - 30, centerX + 80, centerY) // Right point (same as eye)
      ctx.stroke()
      
      // === LOWER LASH LINE (PERFECTLY ALIGNED TO EYE SHAPE) ===
      ctx.beginPath()
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1.5
      // Follow the exact same curve as the bottom of the eye white
      ctx.moveTo(centerX - 80, centerY) // Left point (same as eye)
      ctx.quadraticCurveTo(centerX - 40, centerY + 25, centerX, centerY + 20) // Bottom curve (same as eye)
      ctx.quadraticCurveTo(centerX + 40, centerY + 25, centerX + 80, centerY) // Right point (same as eye)
      ctx.stroke()
      
      // === CREASE LINE ===
      ctx.beginPath()
      ctx.strokeStyle = '#888888'
      ctx.lineWidth = 1
      ctx.moveTo(centerX - 70, centerY - 30)
      ctx.quadraticCurveTo(centerX - 30, centerY - 40, centerX, centerY - 38)
      ctx.quadraticCurveTo(centerX + 30, centerY - 40, centerX + 70, centerY - 30)
      ctx.stroke()
      
      // Store the base eye for later restoration
      eyeLayer.value = ctx.getImageData(0, 0, 400, 300)
      
      // Reset drawn state when drawing base eye
      hasDrawnOnCanvas.value = false
      
      console.log('Simplified eye drawing completed successfully')
      return true
      
    } catch (error) {
      console.error('Error drawing base eye:', error)
      return false
    }
  }

  /**
   * Start drawing at mouse position
   */
  const startDrawing = (x, y) => {
    if (!selectedColor.value || !canvasContext.value) return
    
    isDrawing.value = true
    lastDrawPosition.value = { x, y }
    drawAtPosition(x, y)
  }

  /**
   * Continue drawing as mouse moves
   */
  const continueDrawing = (x, y) => {
    if (!isDrawing.value || !selectedColor.value || !canvasContext.value) return
    
    drawLine(lastDrawPosition.value.x, lastDrawPosition.value.y, x, y)
    lastDrawPosition.value = { x, y }
  }

  /**
   * Stop drawing
   */
  const stopDrawing = () => {
    isDrawing.value = false
  }

  /**
   * Draw a single dot at position
   */
  const drawAtPosition = (x, y) => {
    const ctx = canvasContext.value
    if (!ctx) return

    ctx.save()
    ctx.globalAlpha = brushOpacity.value
    ctx.fillStyle = selectedColor.value.bgColor
    ctx.beginPath()
    ctx.arc(x, y, brushSize.value / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    // Mark that we've drawn on the canvas
    hasDrawnOnCanvas.value = true
  }

  /**
   * Draw a line between two positions for smooth drawing
   */
  const drawLine = (x1, y1, x2, y2) => {
    const ctx = canvasContext.value
    if (!ctx) return

    ctx.save()
    ctx.globalAlpha = brushOpacity.value
    ctx.strokeStyle = selectedColor.value.bgColor
    ctx.lineWidth = brushSize.value
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.restore()
    
    // Mark that we've drawn on the canvas
    hasDrawnOnCanvas.value = true
  }

  /**
   * Clear all drawing and restore base eye
   */
  const clearAllColors = () => {
    console.log('clearAllColors called')
    const ctx = canvasContext.value
    console.log('Canvas context:', ctx)
    console.log('Eye layer available:', !!eyeLayer.value)
    
    if (!ctx) {
      console.error('No canvas context available for clearing')
      return
    }
    
    if (!eyeLayer.value) {
      console.warn('No eye layer available, redrawing base eye')
      // If eyeLayer is not available, redraw the base eye
      drawBaseEye()
    } else {
      console.log('Restoring eye layer')
      // Restore the base eye layer
      ctx.putImageData(eyeLayer.value, 0, 0)
      console.log('Eye layer restored successfully')
    }
    
    // Reset the drawn state
    hasDrawnOnCanvas.value = false
  }

  /**
   * Check if there are any colors applied
   */
  const hasAnyColors = computed(() => {
    // Use the reactive flag instead of comparing image data
    return hasDrawnOnCanvas.value
  })

  /**
   * Update skin tone and redraw base eye
   */
  const setSkinTone = (color) => {
    skinTone.value = color
    if (canvasContext.value) {
      drawBaseEye()
    }
  }

  /**
   * Update eye color and redraw base eye
   */
  const setEyeColor = (color) => {
    eyeColor.value = color
    if (canvasContext.value) {
      drawBaseEye()
    }
  }

  return {
    // Refs
    canvasRef,
    canvasContext,
    isDrawing,
    selectedColor,
    brushSize,
    brushOpacity,
    skinTone,
    eyeColor,
    
    // Computed
    hasAnyColors,
    
    // Methods
    initializeCanvas,
    drawBaseEye,
    startDrawing,
    continueDrawing,
    stopDrawing,
    clearAllColors,
    setSkinTone,
    setEyeColor
  }
}
