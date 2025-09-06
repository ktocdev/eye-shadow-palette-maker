import { ref, computed } from 'vue'
import { useSVGLoader } from './useSVGLoader.js'
import eyeSvgUrl from '../src/assets/espm-eye.svg'

/**
 * Composable for managing eye drawing operations on canvas
 * Handles eye anatomy zones, drawing, and color application using SVG artwork
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
  const canvasRef = ref(null) // Interaction layer (transparent)
  const paintCanvasRef = ref(null) // Paint layer (user drawing)
  const eyeCanvasRef = ref(null) // Eye layer (SVG elements)
  const canvasContext = ref(null) // Interaction layer context
  const paintContext = ref(null) // Paint layer context  
  const eyeContext = ref(null) // Eye layer context
  const isDrawing = ref(false)
  const selectedColor = ref(null)
  const brushSize = ref(15)
  const brushOpacity = ref(0.6)
  const lastDrawPosition = ref({ x: 0, y: 0 })
  const eyeLayer = ref(null) // Store the SVG eye elements
  const hasDrawnOnCanvas = ref(false) // Track if user has drawn anything
  const skinTone = ref(SKIN_TONES[0].color) // Default to fair skin
  const eyeColor = ref(EYE_COLORS[3].color) // Default to blue eyes
  
  // SVG loader for artwork
  const { loadSVGToCanvas, loadSVGAsLayers, isLoading: svgLoading, loadError: svgError } = useSVGLoader()
  
  // Undo/Redo functionality
  const undoHistory = ref([]) // Stack of canvas states
  const redoHistory = ref([]) // Stack of undone states for redo
  const maxUndoSteps = 20 // Limit history to prevent memory issues

  /**
   * Initialize the multi-layer canvas system
   * @param {HTMLCanvasElement} interactionCanvas - The interaction layer canvas
   * @param {HTMLCanvasElement} paintCanvas - The paint layer canvas  
   * @param {HTMLCanvasElement} eyeCanvas - The eye layer canvas
   */
  const initializeCanvasLayers = async (interactionCanvas, paintCanvas, eyeCanvas) => {
    console.log('initializeCanvasLayers called')
    
    if (!interactionCanvas || !paintCanvas || !eyeCanvas) {
      console.error('One or more canvas elements are missing')
      return false
    }
    
    // Store canvas references
    canvasRef.value = interactionCanvas
    paintCanvasRef.value = paintCanvas
    eyeCanvasRef.value = eyeCanvas
    
    // Get contexts
    canvasContext.value = interactionCanvas.getContext('2d')
    paintContext.value = paintCanvas.getContext('2d')
    eyeContext.value = eyeCanvas.getContext('2d')
    
    if (!canvasContext.value || !paintContext.value || !eyeContext.value) {
      console.error('Failed to get 2D contexts')
      return false
    }
    
    console.log('All canvas layers initialized successfully')
    
    // Draw the SVG eye on the eye layer
    const drawResult = await drawEyeLayer()
    console.log('Eye layer drawing completed:', drawResult)
    
    return drawResult
  }

  /**
   * Legacy single canvas initialization for backward compatibility
   */
  const initializeCanvas = async (canvas) => {
    console.log('Legacy initializeCanvas called - this should be updated to use multi-layer system')
    return initializeCanvasLayers(canvas, canvas, canvas)
  }

  /**
   * Draw the SVG eye elements on the eye layer (non-erasable)
   */
  const drawEyeLayer = async () => {
    const ctx = eyeContext.value
    console.log('drawEyeLayer called, context:', ctx)
    
    if (!ctx) {
      console.error('No eye layer context available')
      return false
    }

    try {
      // Define iris color override
      const styleOverrides = {
        '.cls-2': {
          fill: eyeColor.value
        }
      }

      console.log('Loading SVG eye elements, iris color:', eyeColor.value)
      
      // Clear the eye layer
      ctx.clearRect(0, 0, 600, 350)
      
      // Load and render SVG to the eye layer
      const eyeLayerCanvas = eyeCanvasRef.value
      const imageData = await loadSVGToCanvas(eyeSvgUrl, eyeLayerCanvas, styleOverrides)
      
      // Store the eye layer data
      eyeLayer.value = imageData
      
      console.log('SVG eye layer completed successfully')
      return true
      
    } catch (error) {
      console.error('Error loading SVG eye layer:', error)
      return drawFallbackEyeLayer()
    }
  }

  /**
   * Fallback eye drawing on the eye layer
   */
  const drawFallbackEyeLayer = () => {
    const ctx = eyeContext.value
    
    if (!ctx) {
      console.error('No eye layer context available for fallback')
      return false
    }

    try {
      // Clear eye layer
      ctx.clearRect(0, 0, 600, 350)
      
      // Eye coordinates (centered in 600x300 canvas)
      const centerX = 300
      const centerY = 150
      
      // === EYE WHITE (SCLERA) ===
      ctx.beginPath()
      ctx.fillStyle = '#FFFFFF'
      ctx.moveTo(centerX - 80, centerY)
      ctx.quadraticCurveTo(centerX - 40, centerY - 30, centerX, centerY - 25)
      ctx.quadraticCurveTo(centerX + 40, centerY - 30, centerX + 80, centerY)
      ctx.quadraticCurveTo(centerX + 40, centerY + 25, centerX, centerY + 20)
      ctx.quadraticCurveTo(centerX - 40, centerY + 25, centerX - 80, centerY)
      ctx.closePath()
      ctx.fill()
      
      // === IRIS ===
      ctx.beginPath()
      ctx.fillStyle = eyeColor.value
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2)
      ctx.fill()
      
      // === PUPIL ===
      ctx.beginPath()
      ctx.fillStyle = '#000000'
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
      ctx.fill()
      
      // === UPPER LASH LINE ===
      ctx.beginPath()
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 2
      ctx.moveTo(centerX - 80, centerY)
      ctx.quadraticCurveTo(centerX - 40, centerY - 30, centerX, centerY - 25)
      ctx.quadraticCurveTo(centerX + 40, centerY - 30, centerX + 80, centerY)
      ctx.stroke()
      
      // === LOWER LASH LINE ===
      ctx.beginPath()
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1.5
      ctx.moveTo(centerX - 80, centerY)
      ctx.quadraticCurveTo(centerX - 40, centerY + 25, centerX, centerY + 20)
      ctx.quadraticCurveTo(centerX + 40, centerY + 25, centerX + 80, centerY)
      ctx.stroke()
      
      // Store the fallback eye layer
      eyeLayer.value = ctx.getImageData(0, 0, 600, 350)
      
      console.log('Fallback eye layer completed successfully')
      return true
      
    } catch (error) {
      console.error('Error drawing fallback eye layer:', error)
      return false
    }
  }

  /**
   * Legacy function for backward compatibility
   */
  const drawBaseEye = async () => {
    const canvas = canvasRef.value
    const ctx = canvasContext.value
    console.log('drawBaseEye called with SVG, canvas:', canvas, 'context:', ctx)
    
    if (!canvas || !ctx) {
      console.error('No canvas or context available for drawing')
      return false
    }

    try {
      // Define iris color override
      const styleOverrides = {
        '.cls-2': {
          fill: eyeColor.value
        }
      }

      console.log('Loading SVG with basic rendering, iris color:', eyeColor.value)
      
      // First, draw skin tone background
      ctx.fillStyle = skinTone.value
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      console.log('Skin tone background applied:', skinTone.value)
      
      // Then render SVG on top
      const imageData = await loadSVGToCanvas(eyeSvgUrl, canvas, styleOverrides)
      
      // Composite SVG onto skin background
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.putImageData(imageData, 0, 0)
      
      // Draw SVG on top of skin background
      ctx.drawImage(tempCanvas, 0, 0)
      
      // Store the complete composition
      eyeLayer.value = ctx.getImageData(0, 0, canvas.width, canvas.height)
      console.log('SVG eye with skin tone completed successfully')
      
      // Reset drawn state when drawing base eye
      hasDrawnOnCanvas.value = false
      
      // Clear undo and redo history when redrawing base eye
      undoHistory.value = []
      redoHistory.value = []
      
      // Save initial state to undo history
      saveStateToUndoHistory()
      
      return true
      
    } catch (error) {
      console.error('Error loading SVG eye:', error)
      
      // Fallback to programmatic drawing
      console.log('Falling back to programmatic eye drawing')
      return drawFallbackEye()
    }
  }

  /**
   * Render the layered eye composition (background + paint + foreground)
   */
  const renderLayeredEye = async () => {
    const ctx = canvasContext.value
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, 600, 350)

    // 1. Draw background layer (brow, sclera)
    if (backgroundLayer.value) {
      ctx.putImageData(backgroundLayer.value, 0, 0)
    }

    // 2. Draw paint layer (user's eyeshadow) - this will be applied by the drawing functions
    if (paintLayer.value) {
      ctx.putImageData(paintLayer.value, 0, 0)
    }

    // 3. Draw foreground layer (iris, eye details) on top
    if (foregroundLayer.value) {
      // Use source-over to composite the foreground
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = 600
      tempCanvas.height = 350
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.putImageData(foregroundLayer.value, 0, 0)
      
      ctx.drawImage(tempCanvas, 0, 0)
    }

    // Store the complete composition
    eyeLayer.value = ctx.getImageData(0, 0, 600, 350)
  }

  /**
   * Fallback eye drawing using the original programmatic approach
   */
  const drawFallbackEye = () => {
    const ctx = canvasContext.value
    
    if (!ctx) {
      console.error('No canvas context available for fallback drawing')
      return false
    }

    try {
      // Clear canvas
      ctx.clearRect(0, 0, 600, 350)
      console.log('Canvas cleared for fallback')
      
      // Draw base skin tone
      ctx.fillStyle = skinTone.value
      ctx.fillRect(0, 0, 600, 350)
      
      // Eye coordinates (centered in 600x300 canvas)
      const centerX = 300
      const centerY = 150
      
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
      ctx.fillStyle = eyeColor.value
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2)
      ctx.fill()
      
      // === PUPIL ===
      ctx.beginPath()
      ctx.fillStyle = '#000000'
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
      ctx.fill()
      
      // === UPPER LASH LINE ===
      ctx.beginPath()
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 2
      ctx.moveTo(centerX - 80, centerY)
      ctx.quadraticCurveTo(centerX - 40, centerY - 30, centerX, centerY - 25)
      ctx.quadraticCurveTo(centerX + 40, centerY - 30, centerX + 80, centerY)
      ctx.stroke()
      
      // === LOWER LASH LINE ===
      ctx.beginPath()
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1.5
      ctx.moveTo(centerX - 80, centerY)
      ctx.quadraticCurveTo(centerX - 40, centerY + 25, centerX, centerY + 20)
      ctx.quadraticCurveTo(centerX + 40, centerY + 25, centerX + 80, centerY)
      ctx.stroke()
      
      // Store the base eye for later restoration
      eyeLayer.value = ctx.getImageData(0, 0, 600, 350)
      
      // Reset drawn state when drawing base eye
      hasDrawnOnCanvas.value = false
      
      // Clear undo and redo history when redrawing base eye
      undoHistory.value = []
      redoHistory.value = []
      
      // Save initial state to undo history
      saveStateToUndoHistory()
      
      console.log('Fallback eye drawing completed successfully')
      return true
      
    } catch (error) {
      console.error('Error drawing fallback eye:', error)
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
   * Stop drawing and save state for undo
   */
  const stopDrawing = () => {
    if (isDrawing.value) {
      isDrawing.value = false
      // Clear redo history when new action is performed
      redoHistory.value = []
      // Save state to undo history after drawing is complete
      saveStateToUndoHistory()
    }
  }

  /**
   * Draw a single dot at position on the paint layer
   */
  const drawAtPosition = (x, y) => {
    const ctx = paintContext.value
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
   * Draw a line between two positions for smooth drawing on the paint layer
   */
  const drawLine = (x1, y1, x2, y2) => {
    const ctx = paintContext.value
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
   * Update the paint layer with current user drawing
   */
  const updatePaintLayer = () => {
    const ctx = canvasContext.value
    if (!ctx || !backgroundLayer.value) return
    
    // Extract just the user's paint by subtracting background from current canvas
    const currentCanvas = ctx.getImageData(0, 0, 600, 350)
    
    // Create a canvas to isolate paint layer
    const paintCanvas = document.createElement('canvas')
    paintCanvas.width = 600
    paintCanvas.height = 350
    const paintCtx = paintCanvas.getContext('2d')
    
    // Start with current canvas
    paintCtx.putImageData(currentCanvas, 0, 0)
    
    // Subtract background to isolate paint
    paintCtx.globalCompositeOperation = 'destination-out'
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 600
    tempCanvas.height = 350
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(backgroundLayer.value, 0, 0)
    paintCtx.drawImage(tempCanvas, 0, 0)
    
    // Store the isolated paint layer
    paintLayer.value = paintCtx.getImageData(0, 0, 600, 350)
  }

  /**
   * Clear all paint from the paint layer (erasable layer)
   */
  const clearAllColors = async () => {
    console.log('clearAllColors called')
    const ctx = paintContext.value
    
    if (!ctx) {
      console.error('No paint layer context available for clearing')
      return
    }
    
    console.log('Clearing paint layer')
    // Clear only the paint layer - eye layer and skin tone remain intact
    ctx.clearRect(0, 0, 600, 350)
    
    // Reset the drawn state
    hasDrawnOnCanvas.value = false
    
    console.log('Paint layer cleared successfully')
  }

  /**
   * Check if there are any colors applied
   */
  const hasAnyColors = computed(() => {
    // Use the reactive flag instead of comparing image data
    return hasDrawnOnCanvas.value
  })

  /**
   * Update skin tone (background will update via reactive CSS)
   */
  const setSkinTone = async (color) => {
    skinTone.value = color
    // Skin tone is handled by the container background CSS
    console.log('Skin tone updated to:', color)
  }

  /**
   * Update eye color and redraw eye layer
   */
  const setEyeColor = async (color) => {
    eyeColor.value = color
    if (eyeContext.value) {
      await drawEyeLayer()
    }
  }

  /**
   * Save current canvas state to undo history
   */
  const saveStateToUndoHistory = () => {
    const ctx = canvasContext.value
    if (!ctx) return
    
    const imageData = ctx.getImageData(0, 0, 600, 350)
    undoHistory.value.push(imageData)
    
    // Limit history size to prevent memory issues
    if (undoHistory.value.length > maxUndoSteps) {
      undoHistory.value.shift() // Remove oldest state
    }
  }

  /**
   * Undo the last drawing action
   */
  const undoLastAction = () => {
    const ctx = canvasContext.value
    if (!ctx || undoHistory.value.length <= 1) return // Keep at least base state
    
    // Save current state to redo history before undoing
    const currentState = undoHistory.value.pop()
    if (currentState) {
      redoHistory.value.push(currentState)
      
      // Limit redo history size
      if (redoHistory.value.length > maxUndoSteps) {
        redoHistory.value.shift()
      }
    }
    
    // Restore previous state
    const previousState = undoHistory.value[undoHistory.value.length - 1]
    if (previousState) {
      ctx.putImageData(previousState, 0, 0)
      
      // Update drawn state based on whether we're back to base state
      hasDrawnOnCanvas.value = undoHistory.value.length > 1
    }
  }

  /**
   * Redo the last undone action
   */
  const redoLastAction = () => {
    const ctx = canvasContext.value
    if (!ctx || redoHistory.value.length === 0) return
    
    // Get the state to redo
    const stateToRedo = redoHistory.value.pop()
    if (stateToRedo) {
      // Add current state back to undo history
      undoHistory.value.push(stateToRedo)
      
      // Restore the redone state
      ctx.putImageData(stateToRedo, 0, 0)
      
      // Update drawn state
      hasDrawnOnCanvas.value = undoHistory.value.length > 1
    }
  }

  /**
   * Check if undo is available
   */
  const canUndo = computed(() => {
    return undoHistory.value.length > 1 // More than just the base state
  })

  /**
   * Check if redo is available
   */
  const canRedo = computed(() => {
    return redoHistory.value.length > 0
  })

  return {
    // Refs
    canvasRef,
    canvasContext,
    paintCanvasRef,
    paintContext,
    eyeCanvasRef,
    eyeContext,
    isDrawing,
    selectedColor,
    brushSize,
    brushOpacity,
    skinTone,
    eyeColor,
    
    // Computed
    hasAnyColors,
    canUndo,
    canRedo,
    
    // Methods
    initializeCanvas,
    initializeCanvasLayers,
    drawBaseEye,
    drawEyeLayer,
    startDrawing,
    continueDrawing,
    stopDrawing,
    clearAllColors,
    setSkinTone,
    setEyeColor,
    undoLastAction,
    redoLastAction
  }
}
