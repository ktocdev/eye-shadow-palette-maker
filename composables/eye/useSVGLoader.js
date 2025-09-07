import { ref } from 'vue'

/**
 * Composable for loading and manipulating SVG artwork for canvas rendering
 */
export function useSVGLoader() {
  const isLoading = ref(false)
  const loadError = ref(null)

  /**
   * Load SVG from a path and modify its CSS styles before rendering to canvas
   * @param {string} svgPath - Path to the SVG file
   * @param {HTMLCanvasElement} canvas - Target canvas element
   * @param {Object} styleOverrides - CSS styles to override (e.g., { '.cls-2': { fill: '#ff0000' } })
   * @param {Object} options - Rendering options
   * @returns {Promise<ImageData>} - Canvas ImageData for layer storage
   */
  const loadSVGToCanvas = async (svgPath, canvas, styleOverrides = {}, options = {}) => {
    const {
      width = canvas.width,
      height = canvas.height,
      preserveAspectRatio = 'xMidYMid meet'
    } = options

    try {
      isLoading.value = true
      loadError.value = null

      // Fetch SVG content - handle both URLs and paths
      let svgText
      
      if (svgPath.startsWith('data:') || svgPath.startsWith('blob:') || svgPath.includes('assets')) {
        // This is a Vite-processed asset URL, we can use it directly
        // For Vite assets, we need to fetch the content to modify styles
        const response = await fetch(svgPath)
        if (!response.ok) {
          console.error('SVG asset fetch failed:', response.status, response.statusText)
          throw new Error(`Failed to load SVG asset: ${response.statusText}`)
        }
        svgText = await response.text()
      } else {
        // This is a regular path, fetch normally
        const response = await fetch(svgPath)
        if (!response.ok) {
          console.error('SVG fetch failed:', response.status, response.statusText)
          throw new Error(`Failed to load SVG: ${response.statusText}`)
        }
        svgText = await response.text()
      }
      

      // Apply style overrides by modifying SVG content
      const modifiedSVG = applySVGStyleOverrides(svgText, styleOverrides)

      // Create image from modified SVG
      const img = new Image()
      const svgBlob = new Blob([modifiedSVG], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const ctx = canvas.getContext('2d')
            
            // Clear canvas to transparent
            ctx.clearRect(0, 0, width, height)
            
            // Dynamic SVG scaling based on canvas size
            // SVG original aspect ratio: ~1.28:1 (width:height)
            const svgAspectRatio = 384 / 300 // Original proportions
            
            // Scale SVG to fit canvas while maintaining aspect ratio
            // Use 85% of canvas height to leave space below for lower eyeshadow
            const maxSvgHeight = height * 0.85
            const maxSvgWidth = width * 0.95 // Use most of canvas width
            
            // Calculate dimensions maintaining aspect ratio
            let svgHeight = maxSvgHeight
            let svgWidth = svgHeight * svgAspectRatio
            
            // If width exceeds canvas, scale down by width instead
            if (svgWidth > maxSvgWidth) {
              svgWidth = maxSvgWidth
              svgHeight = svgWidth / svgAspectRatio
            }
            
            const offsetX = (width - svgWidth) / 2
            const offsetY = 0 // Position at top
            
            // Draw SVG to canvas with scaling and centering
            ctx.drawImage(img, offsetX, offsetY, svgWidth, svgHeight)
            
            // Get image data for layer storage
            const imageData = ctx.getImageData(0, 0, width, height)
            
            // Clean up
            URL.revokeObjectURL(url)
            resolve(imageData)
          } catch (error) {
            console.error('Error in SVG onload:', error)
            URL.revokeObjectURL(url)
            reject(error)
          }
        }
        
        img.onerror = () => {
          console.error('SVG image failed to load')
          URL.revokeObjectURL(url)
          reject(new Error('Failed to load SVG as image'))
        }
        
        img.src = url
      })
    } catch (error) {
      loadError.value = error.message
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Apply CSS style overrides to SVG content
   * @param {string} svgText - Original SVG content
   * @param {Object} styleOverrides - Style overrides object
   * @returns {string} - Modified SVG content
   */
  const applySVGStyleOverrides = (svgText, styleOverrides) => {
    if (!styleOverrides || Object.keys(styleOverrides).length === 0) {
      return svgText
    }


    // Parse the SVG to modify styles
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
    
    // Check for parse errors
    const parseError = svgDoc.querySelector('parsererror')
    if (parseError) {
      console.error('SVG parse error:', parseError.textContent)
      return svgText
    }
    
    // Find the style element
    let styleElement = svgDoc.querySelector('style')
    if (!styleElement) {
      // Create style element if it doesn't exist
      styleElement = svgDoc.createElement('style')
      const defsElement = svgDoc.querySelector('defs') || svgDoc.querySelector('svg')
      defsElement.appendChild(styleElement)
    }

    // Get existing styles
    let styleContent = styleElement.textContent || ''

    // Apply overrides
    Object.entries(styleOverrides).forEach(([selector, styles]) => {
      Object.entries(styles).forEach(([property, value]) => {
        const regex = new RegExp(`(${selector.replace('.', '\\.')}\\s*{[^}]*)(${property}\\s*:[^;]*;?)`, 'g')
        const newProperty = `${property}: ${value};`
        
        if (regex.test(styleContent)) {
          // Replace existing property
          styleContent = styleContent.replace(regex, `$1${newProperty}`)
        } else {
          // Add property to existing selector or create new selector
          const selectorRegex = new RegExp(`(${selector.replace('.', '\\.')}\\s*{[^}]*)(})`, 'g')
          if (selectorRegex.test(styleContent)) {
            styleContent = styleContent.replace(selectorRegex, `$1${newProperty}$2`)
          } else {
            // Add new selector
            styleContent += `\n${selector} { ${newProperty} }`
          }
        }
      })
    })


    // Update style element
    styleElement.textContent = styleContent

    // Return modified SVG
    const modifiedSVG = new XMLSerializer().serializeToString(svgDoc)
    return modifiedSVG
  }

  /**
   * Create layered rendering of SVG for drawing behind certain elements
   * @param {string} svgPath - Path to the SVG file
   * @param {HTMLCanvasElement} backgroundCanvas - Canvas for elements user draws behind
   * @param {HTMLCanvasElement} foregroundCanvas - Canvas for elements drawn on top
   * @param {Object} styleOverrides - CSS style overrides
   * @param {Array} foregroundElements - SVG element IDs to render in foreground
   * @returns {Promise<{background: ImageData, foreground: ImageData}>}
   */
  const loadSVGAsLayers = async (svgPath, backgroundCanvas, foregroundCanvas, styleOverrides = {}, foregroundElements = ['iris', 'eye']) => {
    try {
      isLoading.value = true
      loadError.value = null

      const response = await fetch(svgPath)
      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.statusText}`)
      }
      const svgText = await response.text()
      const modifiedSVG = applySVGStyleOverrides(svgText, styleOverrides)

      // Parse SVG
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(modifiedSVG, 'image/svg+xml')
      const svgElement = svgDoc.querySelector('svg')

      // Create background SVG (everything except foreground elements)
      const backgroundSVG = svgDoc.cloneNode(true)
      foregroundElements.forEach(elementId => {
        const element = backgroundSVG.querySelector(`#${elementId}`)
        if (element) element.remove()
      })

      // Create foreground SVG (only foreground elements)
      const foregroundSVG = svgDoc.cloneNode(true)
      const allGroups = foregroundSVG.querySelectorAll('g[id]')
      allGroups.forEach(group => {
        if (!foregroundElements.includes(group.id)) {
          group.remove()
        }
      })

      // Render background
      const backgroundImageData = await renderSVGToCanvas(
        new XMLSerializer().serializeToString(backgroundSVG),
        backgroundCanvas
      )

      // Render foreground
      const foregroundImageData = await renderSVGToCanvas(
        new XMLSerializer().serializeToString(foregroundSVG),
        foregroundCanvas
      )

      return {
        background: backgroundImageData,
        foreground: foregroundImageData
      }
    } catch (error) {
      loadError.value = error.message
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Helper function to render SVG string to canvas
   */
  const renderSVGToCanvas = (svgString, canvas) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        try {
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          URL.revokeObjectURL(url)
          resolve(imageData)
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(error)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to render SVG to canvas'))
      }

      img.src = url
    })
  }

  return {
    isLoading,
    loadError,
    loadSVGToCanvas,
    loadSVGAsLayers
  }
}