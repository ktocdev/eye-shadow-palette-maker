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
  const isErasing = ref(false) // Track if eraser tool is active
  const eyeLayer = ref(null) // Store the SVG eye elements
  const hasDrawnOnCanvas = ref(false) // Track if user has drawn anything
  const skinTone = ref(SKIN_TONES[0].color) // Default to fair skin
  const eyeColor = ref(EYE_COLORS[3].color) // Default to blue eyes
  
  // Cache for pre-rendered SVG eye layers by color
  const eyeLayerCache = new Map()
  
  // SVG loader for artwork
  const { loadSVGToCanvas, loadSVGAsLayers, isLoading: svgLoading, loadError: svgError } = useSVGLoader()
  
  // Undo/Redo functionality - Optimized with compression
  const undoHistory = ref([]) // Stack of compressed canvas states
  const redoHistory = ref([]) // Stack of undone states for redo
  const maxUndoSteps = 20 // Limit history to prevent memory issues
  const baseState = ref(null) // Base empty canvas state for delta compression

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
    
    // Initialize base state for undo system after a small delay
    setTimeout(() => {
      initializeBaseState()
      // Save initial empty state to undo history
      saveStateToUndoHistory()
    }, 50)
    
    // Pre-cache other eye colors in the background for fast switching
    setTimeout(() => {
      preCacheEyeColors()
    }, 100) // Small delay to not block initial render
    
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
   * Generate cache key for eye layer based on canvas dimensions and eye color
   */
  const getEyeLayerCacheKey = (width, height, color) => {
    return `${width}x${height}_${color}`
  }

  /**
   * Pre-render and cache eye layer for a specific color and canvas size
   */
  const cacheEyeLayerForColor = async (color, width, height) => {
    const cacheKey = getEyeLayerCacheKey(width, height, color)
    
    if (eyeLayerCache.has(cacheKey)) {
      return eyeLayerCache.get(cacheKey)
    }

    try {
      // Create temporary canvas for rendering
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = width
      tempCanvas.height = height
      
      const styleOverrides = {
        '.cls-2': {
          fill: color
        }
      }
      
      // Render SVG to temporary canvas
      const imageData = await loadSVGToCanvas(eyeSvgUrl, tempCanvas, styleOverrides)
      
      // Cache the rendered canvas
      eyeLayerCache.set(cacheKey, tempCanvas)
      
      return tempCanvas
    } catch (error) {
      console.error('Error caching eye layer for color:', color, error)
      return null
    }
  }

  /**
   * Pre-cache common eye colors for current canvas dimensions
   */
  const preCacheEyeColors = async () => {
    const eyeLayerCanvas = eyeCanvasRef.value
    if (!eyeLayerCanvas) return

    const { width, height } = eyeLayerCanvas
    
    // Pre-cache all available eye colors for current canvas size
    const cachePromises = EYE_COLORS.map(eyeColorOption => 
      cacheEyeLayerForColor(eyeColorOption.color, width, height)
    )
    
    try {
      await Promise.all(cachePromises)
      console.log('Pre-cached', EYE_COLORS.length, 'eye colors for', width, 'x', height, 'canvas')
    } catch (error) {
      console.error('Error pre-caching eye colors:', error)
    }
  }

  /**
   * Draw the SVG eye elements on the eye layer (non-erasable) - Optimized with caching
   */
  const drawEyeLayer = async () => {
    const ctx = eyeContext.value
    
    if (!ctx) {
      console.error('No eye layer context available')
      return false
    }

    try {
      const eyeLayerCanvas = eyeCanvasRef.value
      const cacheKey = getEyeLayerCacheKey(eyeLayerCanvas.width, eyeLayerCanvas.height, eyeColor.value)
      
      // Check if we have a cached version
      let cachedCanvas = eyeLayerCache.get(cacheKey)
      
      if (!cachedCanvas) {
        // Not cached, generate and cache it
        cachedCanvas = await cacheEyeLayerForColor(eyeColor.value, eyeLayerCanvas.width, eyeLayerCanvas.height)
        if (!cachedCanvas) {
          return false
        }
      }
      
      // Clear the eye layer and draw cached canvas
      ctx.clearRect(0, 0, eyeLayerCanvas.width, eyeLayerCanvas.height)
      ctx.drawImage(cachedCanvas, 0, 0)
      
      // Store reference to the layer data
      eyeLayer.value = ctx.getImageData(0, 0, eyeLayerCanvas.width, eyeLayerCanvas.height)
      
      return true
      
    } catch (error) {
      console.error('Error loading SVG eye layer:', error)
      return false
    }
  }





  /**
   * Start drawing at mouse position
   */
  const startDrawing = (x, y) => {
    if (!paintContext.value) return
    if (!isErasing.value && !selectedColor.value) return // Need color for painting, but not for erasing
    
    isDrawing.value = true
    lastDrawPosition.value = { x, y }
    drawAtPosition(x, y)
  }

  /**
   * Continue drawing as mouse moves
   */
  const continueDrawing = (x, y) => {
    if (!isDrawing.value || !paintContext.value) return
    if (!isErasing.value && !selectedColor.value) return // Need color for painting, but not for erasing
    
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
    
    if (isErasing.value) {
      // Erase mode - remove paint
      ctx.globalCompositeOperation = 'destination-out'
      ctx.globalAlpha = 1.0 // Full opacity for erasing
    } else {
      // Paint mode - add color
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = brushOpacity.value
      ctx.fillStyle = selectedColor.value.bgColor
    }
    
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
    
    if (isErasing.value) {
      // Erase mode - remove paint
      ctx.globalCompositeOperation = 'destination-out'
      ctx.globalAlpha = 1.0 // Full opacity for erasing
    } else {
      // Paint mode - add color
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = brushOpacity.value
      ctx.strokeStyle = selectedColor.value.bgColor
    }
    
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
    const canvas = paintCanvasRef.value
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
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
   * Create a composite canvas with background + paint + eye layers for export/sharing
   * @param {HTMLCanvasElement} paintCanvasEl - Paint canvas element
   * @param {HTMLCanvasElement} eyeCanvasEl - Eye canvas element
   * @returns {HTMLCanvasElement} Composite canvas with all layers combined
   */
  const createCompositeCanvas = (paintCanvasEl, eyeCanvasEl) => {
    // Create output canvas with same dimensions as paint canvas
    const composite = document.createElement('canvas')
    composite.width = paintCanvasEl.width
    composite.height = paintCanvasEl.height
    const ctx = composite.getContext('2d')

    // 1. Fill with skin tone background
    ctx.fillStyle = skinTone.value
    ctx.fillRect(0, 0, composite.width, composite.height)

    // 2. Draw paint layer (user's eyeshadow)
    if (paintCanvasEl) {
      ctx.drawImage(paintCanvasEl, 0, 0)
    }

    // 3. Draw eye layer (SVG elements) on top
    if (eyeCanvasEl) {
      ctx.drawImage(eyeCanvasEl, 0, 0)
    }

    return composite
  }

  /**
   * Toggle eraser mode on/off
   */
  const toggleEraser = () => {
    isErasing.value = !isErasing.value
    console.log('Eraser mode:', isErasing.value ? 'ON' : 'OFF')
  }

  /**
   * Set eraser mode explicitly
   */
  const setEraserMode = (enabled) => {
    isErasing.value = enabled
  }

  /**
   * Create compressed canvas state using reduced resolution
   */
  const createCompressedState = () => {
    const ctx = paintContext.value
    const canvas = paintCanvasRef.value
    if (!ctx || !canvas) return null
    
    // Use reduced resolution for undo data (1/4 the original size)
    const scale = 0.5
    const compressedWidth = Math.max(1, Math.floor(canvas.width * scale))
    const compressedHeight = Math.max(1, Math.floor(canvas.height * scale))
    
    // Create temporary canvas at reduced size
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = compressedWidth
    tempCanvas.height = compressedHeight
    const tempCtx = tempCanvas.getContext('2d')
    
    // Draw scaled down version (preserve transparency)
    tempCtx.drawImage(canvas, 0, 0, compressedWidth, compressedHeight)
    
    // Convert to PNG data URL (preserves transparency)
    return {
      dataURL: tempCanvas.toDataURL('image/png'),
      originalWidth: canvas.width,
      originalHeight: canvas.height,
      scale: scale
    }
  }

  /**
   * Restore canvas from compressed state
   */
  const restoreFromCompressedState = (compressedState) => {
    return new Promise((resolve) => {
      if (!compressedState) {
        resolve(false)
        return
      }
      
      const ctx = paintContext.value
      const canvas = paintCanvasRef.value
      if (!ctx || !canvas) {
        resolve(false)
        return
      }
      
      const img = new Image()
      img.onload = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Draw scaled up image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(true)
      }
      img.onerror = () => resolve(false)
      img.src = compressedState.dataURL
    })
  }

  /**
   * Initialize base state for comparison
   */
  const initializeBaseState = () => {
    baseState.value = createCompressedState()
  }

  /**
   * Save current canvas state to undo history - Memory optimized
   */
  const saveStateToUndoHistory = () => {
    const compressedState = createCompressedState()
    if (!compressedState) return
    
    undoHistory.value.push(compressedState)
    
    // Limit history size to prevent memory issues
    if (undoHistory.value.length > maxUndoSteps) {
      undoHistory.value.shift() // Remove oldest state
    }
  }

  /**
   * Undo the last drawing action - Memory optimized
   */
  const undoLastAction = async () => {
    if (undoHistory.value.length <= 1) return // Keep at least base state
    
    // Save current state to redo history before undoing
    const currentState = createCompressedState()
    if (currentState) {
      redoHistory.value.push(currentState)
      
      // Limit redo history size
      if (redoHistory.value.length > maxUndoSteps) {
        redoHistory.value.shift()
      }
    }
    
    // Remove current state from undo history
    undoHistory.value.pop()
    
    // Restore previous state
    const previousState = undoHistory.value[undoHistory.value.length - 1]
    if (previousState) {
      await restoreFromCompressedState(previousState)
      
      // Update drawn state based on whether we're back to base state
      hasDrawnOnCanvas.value = undoHistory.value.length > 1
    }
  }

  /**
   * Redo the last undone action - Memory optimized
   */
  const redoLastAction = async () => {
    if (redoHistory.value.length === 0) return
    
    // Get the state to redo
    const stateToRedo = redoHistory.value.pop()
    if (stateToRedo) {
      // Add current state to undo history
      const currentState = createCompressedState()
      if (currentState) {
        undoHistory.value.push(currentState)
      }
      
      // Restore the redone state
      await restoreFromCompressedState(stateToRedo)
      
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
    isErasing,
    skinTone,
    eyeColor,
    
    // Computed
    hasAnyColors,
    canUndo,
    canRedo,
    
    // Methods
    initializeCanvas,
    initializeCanvasLayers,
    drawEyeLayer,
    preCacheEyeColors,
    startDrawing,
    continueDrawing,
    stopDrawing,
    clearAllColors,
    setSkinTone,
    setEyeColor,
    createCompositeCanvas,
    toggleEraser,
    setEraserMode,
    undoLastAction,
    redoLastAction
  }
}
