import { ref } from 'vue'

export function useEyeDrawingExport() {
  const isExporting = ref(false)
  const exportError = ref(null)

  /**
   * Generate a canvas element with the eye drawing and palette rendered on it
   * @param {HTMLCanvasElement} eyeCanvas - The eye canvas with the drawing
   * @param {Array} paletteColors - Array of color data used in the palette
   * @param {string} paletteTitle - Palette title
   * @param {number} canvasWidth - Width of the output canvas
   * @param {number} canvasHeight - Height of the output canvas
   * @returns {HTMLCanvasElement} Canvas element with the combined image
   */
  const generateEyeDrawingCanvas = (eyeCanvas, paletteColors, paletteTitle, canvasWidth = 1000, canvasHeight = 700) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw title
    if (paletteTitle) {
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 32px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(paletteTitle, canvasWidth / 2, 40)
    }
    
    // Calculate layout
    const eyeArea = {
      x: 50,
      y: 80,
      width: 600,
      height: 450
    }
    
    const paletteArea = {
      x: 680,
      y: 80,
      width: 270,
      height: 450
    }
    
    // Draw eye canvas (scaled to fit)
    if (eyeCanvas) {
      ctx.drawImage(eyeCanvas, eyeArea.x, eyeArea.y, eyeArea.width, eyeArea.height)
      
      // Add border around eye area
      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 2
      ctx.strokeRect(eyeArea.x, eyeArea.y, eyeArea.width, eyeArea.height)
    }
    
    // Draw palette section
    if (paletteColors && paletteColors.length > 0) {
      // Title for palette section
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 18px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Colors Used', paletteArea.x + paletteArea.width / 2, paletteArea.y - 10)
      
      // Calculate swatch layout
      const swatchSize = 45
      const swatchPadding = 8
      const swatchesPerRow = 4
      const startX = paletteArea.x + (paletteArea.width - (swatchesPerRow * (swatchSize + swatchPadding) - swatchPadding)) / 2
      let startY = paletteArea.y + 20
      
      paletteColors.forEach((color, index) => {
        const row = Math.floor(index / swatchesPerRow)
        const col = index % swatchesPerRow
        
        const x = startX + col * (swatchSize + swatchPadding)
        const y = startY + row * (swatchSize + swatchPadding + 25) // Extra space for color name
        
        // Draw swatch
        ctx.fillStyle = color.bgColor || '#f0f0f0'
        drawRoundedRect(ctx, x, y, swatchSize, swatchSize, 6)
        ctx.fill()
        
        // Draw border
        ctx.strokeStyle = '#cccccc'
        ctx.lineWidth = 1
        ctx.stroke()
        
        // Draw color name
        if (color.colorName) {
          ctx.fillStyle = '#333333'
          ctx.font = '11px Arial, sans-serif'
          ctx.textAlign = 'center'
          
          // Truncate long names
          let displayName = color.colorName
          if (displayName.length > 12) {
            displayName = displayName.substring(0, 9) + '...'
          }
          
          ctx.fillText(displayName, x + swatchSize / 2, y + swatchSize + 15)
        }
      })
      
      // Add border around palette area
      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 1
      ctx.strokeRect(paletteArea.x, paletteArea.y, paletteArea.width, paletteArea.height)
    }
    
    // Add subtitle
    ctx.fillStyle = '#666666'
    ctx.font = '16px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Eye Makeup Look', canvasWidth / 2, 65)
    
    // Add watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.font = '14px Arial, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('Created with Eyeshadow Palette Maker', canvasWidth - 20, canvasHeight - 20)
    
    return canvas
  }
  
  /**
   * Helper function to draw rounded rectangles
   */
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }
  
  /**
   * Export eye drawing as JPG file
   * @param {HTMLCanvasElement} eyeCanvas - The eye canvas with the drawing
   * @param {Array} paletteColors - Array of color data used in the palette
   * @param {string} paletteTitle - Palette title
   * @param {number} quality - JPG quality (0.1 to 1.0)
   */
  const exportEyeDrawingAsJPG = async (eyeCanvas, paletteColors, paletteTitle, quality = 0.9) => {
    try {
      isExporting.value = true
      exportError.value = null
      
      const canvas = generateEyeDrawingCanvas(eyeCanvas, paletteColors, paletteTitle)
      
      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate image'))
            return
          }
          
          // Create download link
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          // Sanitize title for filename
          const sanitizedTitle = (paletteTitle || 'My_Eye_Look').replace(/[<>:"/\\|?*\s]/g, '_')
          link.download = `${sanitizedTitle}_Eye_Look.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          resolve(blob)
        }, 'image/jpeg', quality)
      })
      
    } catch (error) {
      exportError.value = error.message
      throw error
    } finally {
      isExporting.value = false
    }
  }
  
  /**
   * Copy eye drawing image to clipboard (if supported)
   * @param {HTMLCanvasElement} eyeCanvas - The eye canvas with the drawing
   * @param {Array} paletteColors - Array of color data used in the palette
   * @param {string} paletteTitle - Palette title
   */
  const copyEyeDrawingToClipboard = async (eyeCanvas, paletteColors, paletteTitle) => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.write) {
        throw new Error('Clipboard API not supported')
      }
      
      isExporting.value = true
      exportError.value = null
      
      const canvas = generateEyeDrawingCanvas(eyeCanvas, paletteColors, paletteTitle)
      
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate image'))
            return
          }
          
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ])
            resolve()
          } catch (error) {
            reject(error)
          }
        }, 'image/png')
      })
      
    } catch (error) {
      exportError.value = error.message
      throw error
    } finally {
      isExporting.value = false
    }
  }
  
  /**
   * Share eye drawing using Web Share API (if supported)
   * @param {HTMLCanvasElement} eyeCanvas - The eye canvas with the drawing
   * @param {Array} paletteColors - Array of color data used in the palette
   * @param {string} paletteTitle - Palette title
   */
  const shareEyeDrawingViaWebAPI = async (eyeCanvas, paletteColors, paletteTitle) => {
    try {
      if (!navigator.share) {
        throw new Error('Web Share API not supported')
      }
      
      isExporting.value = true
      exportError.value = null
      
      const canvas = generateEyeDrawingCanvas(eyeCanvas, paletteColors, paletteTitle)
      
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate image'))
            return
          }
          
          try {
            // Sanitize title for filename
            const sanitizedTitle = (paletteTitle || 'My_Eye_Look').replace(/[<>:"/\\|?*\s]/g, '_')
            const fileName = `${sanitizedTitle}_Eye_Look.jpg`
            
            const file = new File([blob], fileName, { 
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            
            // Check if we can share files
            if (navigator.canShare && !navigator.canShare({ files: [file] })) {
              throw new Error('Cannot share files on this device/browser')
            }
            
            // Try sharing with navigator.share
            await navigator.share({
              title: `${paletteTitle || 'My Eye Look'} - Eye Makeup`,
              text: 'Check out my custom eye makeup look!',
              files: [file]
            })
            resolve()
          } catch (error) {
            if (error.name !== 'AbortError') {
              // Fallback to download if sharing fails
              try {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                const sanitizedTitle = (paletteTitle || 'My_Eye_Look').replace(/[<>:"/\\|?*\s]/g, '_')
                link.download = `${sanitizedTitle}_Eye_Look.jpg`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
                resolve()
              } catch (fallbackError) {
                reject(error)
              }
            } else {
              resolve() // User cancelled sharing
            }
          }
        }, 'image/jpeg', 0.9)
      })
      
    } catch (error) {
      exportError.value = error.message
      throw error
    } finally {
      isExporting.value = false
    }
  }
  
  /**
   * Check which share features are supported
   */
  const getEyeDrawingShareCapabilities = () => {
    let webShareSupported = false
    
    if (navigator.share) {
      try {
        // Test if we can share files
        const testBlob = new Blob(['test'], { type: 'text/plain' })
        const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' })
        webShareSupported = navigator.canShare ? navigator.canShare({ files: [testFile] }) : true
      } catch (error) {
        webShareSupported = false
      }
    }
    
    return {
      download: true, // Always supported
      clipboard: navigator.clipboard && navigator.clipboard.write,
      webShare: webShareSupported
    }
  }
  
  return {
    isExporting,
    exportError,
    exportEyeDrawingAsJPG,
    copyEyeDrawingToClipboard,
    shareEyeDrawingViaWebAPI,
    getEyeDrawingShareCapabilities
  }
}
