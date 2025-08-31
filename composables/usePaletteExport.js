import { ref } from 'vue'

export function usePaletteExport() {
  const isExporting = ref(false)
  const exportError = ref(null)

  /**
   * Generate a canvas element with the palette rendered on it
   * @param {Array} gridData - Array of color data for each cell
   * @param {number} gridSize - Size of the grid (2, 3, or 4)
   * @param {string} title - Palette title
   * @param {number} canvasSize - Size of the canvas in pixels
   * @returns {HTMLCanvasElement} Canvas element with the palette
   */
  const generatePaletteCanvas = (gridData, gridSize, title, canvasSize = 800) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = canvasSize
    canvas.height = canvasSize + 100 // Extra space for title
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Calculate grid dimensions
    const gridMargin = 60
    const gridAreaSize = canvasSize - (gridMargin * 2)
    const cellSize = gridAreaSize / gridSize
    const cellPadding = cellSize * 0.05 // 5% padding between cells
    const actualCellSize = cellSize - cellPadding
    
    // Draw title
    if (title) {
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 32px Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(title, canvasSize / 2, 40)
    }
    
    // Draw palette grid
    const startY = 80 // Start below title
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const index = row * gridSize + col
        const colorData = gridData[index]
        
        const x = gridMargin + (col * cellSize) + (cellPadding / 2)
        const y = startY + gridMargin + (row * cellSize) + (cellPadding / 2)
        
        // Draw cell background
        if (colorData && colorData.bgColor) {
          ctx.fillStyle = colorData.bgColor
        } else {
          ctx.fillStyle = '#f0f0f0' // Empty cell color
        }
        
        // Draw rounded rectangle for each cell
        drawRoundedRect(ctx, x, y, actualCellSize, actualCellSize, 8)
        ctx.fill()
        
        // Draw border
        ctx.strokeStyle = '#cccccc'
        ctx.lineWidth = 1
        ctx.stroke()
        
        // Add color name if available
        if (colorData && colorData.colorName) {
          ctx.fillStyle = colorData.isDark ? '#ffffff' : '#000000'
          ctx.font = `${Math.max(10, actualCellSize / 15)}px Arial, sans-serif`
          ctx.textAlign = 'center'
          
          // Word wrap for long color names
          const maxWidth = actualCellSize - 10
          const words = colorData.colorName.split(' ')
          let line = ''
          let lineHeight = actualCellSize / 12
          let yPos = y + actualCellSize / 2 - (lineHeight / 2)
          
          for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' '
            let metrics = ctx.measureText(testLine)
            let testWidth = metrics.width
            
            if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line.trim(), x + actualCellSize / 2, yPos)
              line = words[n] + ' '
              yPos += lineHeight + 2
            } else {
              line = testLine
            }
          }
          ctx.fillText(line.trim(), x + actualCellSize / 2, yPos)
        }
      }
    }
    
    // Add watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.font = '14px Arial, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('Created with Eyeshadow Palette Maker', canvasSize - 20, canvasSize + 90)
    
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
   * Export palette as JPG file
   * @param {Array} gridData - Array of color data for each cell
   * @param {number} gridSize - Size of the grid (2, 3, or 4)
   * @param {string} title - Palette title
   * @param {number} quality - JPG quality (0.1 to 1.0)
   */
  const exportAsJPG = async (gridData, gridSize, title, quality = 0.9) => {
    try {
      isExporting.value = true
      exportError.value = null
      
      const canvas = generatePaletteCanvas(gridData, gridSize, title)
      
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
          const sanitizedTitle = (title || 'My_Palette').replace(/[<>:"/\\|?*\s]/g, '_')
          link.download = `${sanitizedTitle}.jpg`
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
   * Copy palette image to clipboard (if supported)
   * @param {Array} gridData - Array of color data for each cell
   * @param {number} gridSize - Size of the grid (2, 3, or 4)
   * @param {string} title - Palette title
   */
  const copyToClipboard = async (gridData, gridSize, title) => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.write) {
        throw new Error('Clipboard API not supported')
      }
      
      isExporting.value = true
      exportError.value = null
      
      const canvas = generatePaletteCanvas(gridData, gridSize, title)
      
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
   * Share palette using Web Share API (if supported)
   * @param {Array} gridData - Array of color data for each cell
   * @param {number} gridSize - Size of the grid (2, 3, or 4)
   * @param {string} title - Palette title
   */
  const shareViaWebAPI = async (gridData, gridSize, title) => {
    try {
      if (!navigator.share) {
        throw new Error('Web Share API not supported')
      }
      
      isExporting.value = true
      exportError.value = null
      
      const canvas = generatePaletteCanvas(gridData, gridSize, title)
      
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate image'))
            return
          }
          
          try {
            // Sanitize title for filename
            const sanitizedTitle = (title || 'My_Palette').replace(/[<>:"/\\|?*\s]/g, '_')
            const fileName = `${sanitizedTitle}.jpg`
            
            console.log('Creating file with name:', fileName, 'blob size:', blob.size)
            
            const file = new File([blob], fileName, { 
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            
            console.log('File created:', file.name, file.size, file.type)
            
            // Check if we can share files
            if (navigator.canShare && !navigator.canShare({ files: [file] })) {
              throw new Error('Cannot share files on this device/browser')
            }
            
            // Try sharing with navigator.share first
            await navigator.share({
              title: title || 'My Eyeshadow Palette',
              text: 'Check out my custom eyeshadow palette!',
              files: [file]
            })
            resolve()
          } catch (error) {
            console.error('Web share error:', error)
            if (error.name !== 'AbortError') {
              // Fallback to download if sharing fails
              try {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                const sanitizedTitle = (title || 'My_Palette').replace(/[<>:"/\\|?*\s]/g, '_')
                link.download = `${sanitizedTitle}.jpg`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
                resolve()
              } catch (fallbackError) {
                reject(error) // Reject with original error
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
   * Copy image as data URL to clipboard (alternative for email sharing)
   * @param {Array} gridData - Array of color data for each cell
   * @param {number} gridSize - Size of the grid (2, 3, or 4)
   * @param {string} title - Palette title
   */
  const copyImageAsDataURL = async (gridData, gridSize, title) => {
    try {
      isExporting.value = true
      exportError.value = null
      
      const canvas = generatePaletteCanvas(gridData, gridSize, title)
      const dataURL = canvas.toDataURL('image/jpeg', 0.9)
      
      // Create HTML img tag that can be pasted into emails
      const htmlContent = `<img src="${dataURL}" alt="${title || 'My Palette'}" style="max-width: 100%; height: auto;" />`
      
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([dataURL], { type: 'text/plain' })
          })
        ])
      } else {
        throw new Error('Clipboard API not supported')
      }
      
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
  const getShareCapabilities = () => {
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
      webShare: webShareSupported,
      copyDataURL: navigator.clipboard && navigator.clipboard.write
    }
  }
  
  return {
    isExporting,
    exportError,
    exportAsJPG,
    copyToClipboard,
    shareViaWebAPI,
    copyImageAsDataURL,
    getShareCapabilities
  }
}