import { ref, computed } from 'vue'

/**
 * Optimized Sound System - Pre-cached buffers for instant playback
 * Handles mobile AudioContext issues and provides consistent performance
 */

// Global state for sound system
const audioContext = ref(null)
const soundBuffers = ref(new Map())
const isEnabled = ref(true)
const isInitialized = ref(false)
const isMobile = ref(false)
const contextState = ref('suspended')

// Detect mobile devices
const detectMobile = () => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform))
}

/**
 * Initialize AudioContext with mobile-specific handling
 */
const initializeAudioContext = async () => {
  if (audioContext.value) return true

  try {
    // Detect mobile
    isMobile.value = detectMobile()
    
    // Create AudioContext
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported')
      return false
    }

    audioContext.value = new AudioContextClass()
    contextState.value = audioContext.value.state

    // Handle context state changes
    audioContext.value.addEventListener('statechange', () => {
      contextState.value = audioContext.value.state
      console.log('AudioContext state changed:', contextState.value)
    })

    // Try to resume context if suspended (common on mobile)
    if (audioContext.value.state === 'suspended') {
      await audioContext.value.resume()
    }

    console.log('AudioContext initialized:', audioContext.value.state)
    return true
  } catch (error) {
    console.error('Failed to initialize AudioContext:', error)
    return false
  }
}

/**
 * Ensure AudioContext is running (resume if suspended)
 */
const ensureAudioContextRunning = async () => {
  if (!audioContext.value) return false
  
  if (audioContext.value.state === 'suspended') {
    try {
      await audioContext.value.resume()
      return true
    } catch (error) {
      console.error('Failed to resume AudioContext:', error)
      return false
    }
  }
  
  return audioContext.value.state === 'running'
}

/**
 * Create and cache a buffer-based sound
 */
const createCachedSound = (name, generator) => {
  if (!audioContext.value) return null

  try {
    const buffer = generator(audioContext.value)
    soundBuffers.value.set(name, buffer)
    return buffer
  } catch (error) {
    console.error(`Failed to create sound ${name}:`, error)
    return null
  }
}

/**
 * Generate soft click sound buffer - EXACT replica of original algorithm
 */
const generateSoftClickBuffer = (context) => {
  const sampleRate = context.sampleRate
  const bufferLength = 1024 // Same as original
  const buffer = context.createBuffer(1, bufferLength, sampleRate)
  const data = buffer.getChannelData(0)
  
  // Generate EXACT same white noise burst as original
  for (let i = 0; i < bufferLength; i++) {
    // Create a decaying noise burst (exact original algorithm)
    const decay = Math.exp(-i * 8 / bufferLength)
    data[i] = (Math.random() * 2 - 1) * decay * 0.3
  }
  
  // Now apply high-pass filtering to match original
  // Simple high-pass filter approximation (since we can't use BiquadFilter on buffer data)
  for (let i = 1; i < bufferLength; i++) {
    const alpha = 0.8 // High-pass filter coefficient for ~2000Hz cutoff
    data[i] = alpha * (data[i] + data[i] - data[i-1])
  }
  
  // Scale to match original volume (0.15)
  for (let i = 0; i < bufferLength; i++) {
    data[i] = data[i] * 0.5 // Adjust for filtering and final volume
  }
  
  return buffer
}

/**
 * Generate sharp click sound buffer - EXACT replica of original algorithm
 */
const generateSharpClickBuffer = (context) => {
  const sampleRate = context.sampleRate
  const bufferLength = 512 // Same as original
  const buffer = context.createBuffer(1, bufferLength, sampleRate)
  const data = buffer.getChannelData(0)
  
  // Generate EXACT same white noise burst as original (brighter version)
  for (let i = 0; i < bufferLength; i++) {
    const t = i / bufferLength
    
    // Create a short burst of filtered noise for the click (exact original)
    const decay = Math.exp(-i * 12 / bufferLength) // Faster decay than soft click
    data[i] = (Math.random() * 2 - 1) * decay * 0.4
  }
  
  // Apply high-pass filtering at higher frequency (3500Hz like original)
  // More aggressive filtering for sharp click
  for (let i = 1; i < bufferLength; i++) {
    const alpha = 0.9 // Higher coefficient for 3500Hz cutoff vs 2000Hz
    data[i] = alpha * (data[i] + data[i] - data[i-1])
  }
  
  // Additional pass for sharper filtering
  for (let i = 2; i < bufferLength; i++) {
    const alpha = 0.85
    data[i] = alpha * (data[i] + data[i] - data[i-1])
  }
  
  // Scale to match original volume (0.12)
  for (let i = 0; i < bufferLength; i++) {
    data[i] = data[i] * 0.4 // Adjust for filtering and final volume
  }
  
  return buffer
}

/**
 * Generate sweep sound buffer (up or down)
 */
const generateSweepBuffer = (context, startFreq, endFreq, duration = 0.15) => {
  const sampleRate = context.sampleRate
  const bufferLength = Math.floor(sampleRate * duration)
  const buffer = context.createBuffer(1, bufferLength, sampleRate)
  const data = buffer.getChannelData(0)
  
  for (let i = 0; i < bufferLength; i++) {
    const t = i / sampleRate
    const progress = t / duration
    
    // Frequency sweep
    const freq = startFreq + (endFreq - startFreq) * progress
    const phase = 2 * Math.PI * freq * t
    
    // Envelope
    const envelope = Math.exp(-t * 8) * (1 - progress * 0.3)
    
    data[i] = Math.sin(phase) * envelope * 0.08
  }
  
  return buffer
}

/**
 * Generate crumple sound buffer
 */
const generateCrumpleBuffer = (context) => {
  const sampleRate = context.sampleRate
  const bufferLength = Math.floor(sampleRate * 0.4) // 400ms
  const buffer = context.createBuffer(1, bufferLength, sampleRate)
  const data = buffer.getChannelData(0)
  
  // Generate textured crumple sound with burst patterns
  for (let i = 0; i < bufferLength; i++) {
    const t = i / sampleRate
    const envelope = Math.exp(-t * 3) * (0.3 + 0.7 * Math.random())
    
    // Multiple noise bursts for texture
    let sample = 0
    for (let burst = 0; burst < 5; burst++) {
      const burstTime = (burst / 5) * 0.4
      const burstEnv = Math.exp(-Math.abs(t - burstTime) * 20)
      sample += (Math.random() * 2 - 1) * burstEnv * 0.3
    }
    
    data[i] = sample * envelope * 0.15
  }
  
  return buffer
}

/**
 * Generate bell/arpeggio sound buffer
 */
const generateBellBuffer = (context) => {
  const sampleRate = context.sampleRate
  const bufferLength = Math.floor(sampleRate * 1.2) // 1.2s
  const buffer = context.createBuffer(1, bufferLength, sampleRate)
  const data = buffer.getChannelData(0)
  
  // Arpeggio notes (C major triad)
  const notes = [
    { freq: 523.25, start: 0.0, decay: 0.8 },    // C5
    { freq: 659.25, start: 0.1, decay: 0.6 },    // E5  
    { freq: 783.99, start: 0.2, decay: 0.4 },    // G5
    { freq: 1046.5, start: 0.3, decay: 0.3 }     // C6
  ]
  
  for (let i = 0; i < bufferLength; i++) {
    const t = i / sampleRate
    let sample = 0
    
    notes.forEach(note => {
      if (t >= note.start) {
        const noteTime = t - note.start
        const envelope = Math.exp(-noteTime / note.decay)
        
        // Fundamental + harmonics for bell-like tone
        const fundamental = Math.sin(2 * Math.PI * note.freq * noteTime)
        const harmonic2 = Math.sin(2 * Math.PI * note.freq * 2 * noteTime) * 0.3
        const harmonic3 = Math.sin(2 * Math.PI * note.freq * 3 * noteTime) * 0.1
        
        sample += (fundamental + harmonic2 + harmonic3) * envelope * 0.04
      }
    })
    
    data[i] = sample
  }
  
  return buffer
}

/**
 * Generate subtle click buffer  
 */
const generateSubtleClickBuffer = (context) => {
  const sampleRate = context.sampleRate
  const bufferLength = Math.floor(sampleRate * 0.05) // 50ms
  const buffer = context.createBuffer(1, bufferLength, sampleRate)
  const data = buffer.getChannelData(0)
  
  // Simple sine wave click
  for (let i = 0; i < bufferLength; i++) {
    const t = i / sampleRate
    const envelope = Math.exp(-t * 30)
    data[i] = Math.sin(2 * Math.PI * 800 * t) * envelope * 0.05
  }
  
  return buffer
}

/**
 * Pre-generate all sound buffers
 */
const preGenerateSounds = async () => {
  if (!audioContext.value || isInitialized.value) return
  
  console.log('Pre-generating sound buffers...')
  
  try {
    // Generate all sounds
    createCachedSound('softClick', generateSoftClickBuffer)
    createCachedSound('sharpClick', generateSharpClickBuffer) 
    createCachedSound('upSweep', (ctx) => generateSweepBuffer(ctx, 300, 500))
    createCachedSound('downSweep', (ctx) => generateSweepBuffer(ctx, 500, 300))
    createCachedSound('subtleClick', generateSubtleClickBuffer)
    
    // Generate complex sounds only if not on low-end mobile
    if (!isMobile.value || navigator.hardwareConcurrency > 2) {
      createCachedSound('crumple', generateCrumpleBuffer)
      createCachedSound('bell', generateBellBuffer)
    }
    
    isInitialized.value = true
    console.log(`Generated ${soundBuffers.value.size} sound buffers`)
  } catch (error) {
    console.error('Failed to pre-generate sounds:', error)
  }
}

/**
 * Play a cached sound buffer
 */
const playSound = async (soundName) => {
  if (!isEnabled.value) return
  
  try {
    // Ensure context is running
    if (!(await ensureAudioContextRunning())) return
    
    // Get cached buffer
    const buffer = soundBuffers.value.get(soundName)
    if (!buffer) {
      console.warn(`Sound ${soundName} not found in cache`)
      return
    }
    
    // Create and play buffer source
    const source = audioContext.value.createBufferSource()
    const gainNode = audioContext.value.createGain()
    
    source.buffer = buffer
    source.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    // Quick fade-in to avoid clicks
    const now = audioContext.value.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(1, now + 0.001)
    
    source.start()
  } catch (error) {
    console.error(`Failed to play sound ${soundName}:`, error)
  }
}

/**
 * Initialize sound system (call on first user interaction)
 */
const initializeSoundSystem = async () => {
  if (isInitialized.value) return true
  
  const success = await initializeAudioContext()
  if (success) {
    await preGenerateSounds()
  }
  return success
}

/**
 * Composable interface
 */
export function useSound() {
  // Auto-initialize on first call
  if (!audioContext.value && typeof window !== 'undefined') {
    // Use setTimeout to avoid blocking
    setTimeout(() => initializeSoundSystem(), 0)
  }
  
  // Sound functions
  const playSoftClick = () => playSound('softClick')
  const playSharpClick = () => playSound('sharpClick')  
  const playUpSweep = () => playSound('upSweep')
  const playDownSweep = () => playSound('downSweep')
  const playSubtleClick = () => playSound('subtleClick')
  const playCrumple = () => playSound('crumple')
  const playSoftBell = () => playSound('bell')
  
  const toggleSound = () => {
    isEnabled.value = !isEnabled.value
  }
  
  // Status
  const soundEnabled = computed(() => isEnabled.value)
  const soundReady = computed(() => isInitialized.value && contextState.value === 'running')
  
  return {
    // Sound functions
    playSoftClick,
    playSharpClick,
    playUpSweep, 
    playDownSweep,
    playSubtleClick,
    playCrumple,
    playSoftBell,
    
    // Control
    toggleSound,
    initializeSoundSystem,
    
    // State
    soundEnabled,
    soundReady,
    isMobile: computed(() => isMobile.value)
  }
}