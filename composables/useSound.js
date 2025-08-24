import { ref } from 'vue'

/**
 * Composable for handling sound effects
 * @returns {Object} Sound utilities and methods
 */
export function useSound() {
  const isEnabled = ref(true) // Could be controlled by user settings
  const audioContext = ref(null)
  
  /**
   * Initialize audio context (required for modern browsers)
   */
  const initAudioContext = () => {
    if (!audioContext.value && window.AudioContext) {
      audioContext.value = new AudioContext()
    }
  }
  
  /**
   * Create a simple beep sound using Web Audio API
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in milliseconds
   * @param {number} volume - Volume (0-1)
   */
  const createBeep = (frequency = 440, duration = 100, volume = 0.1) => {
    if (!isEnabled.value) return
    
    initAudioContext()
    if (!audioContext.value) return
    
    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.value.currentTime)
    oscillator.type = 'sine'
    
    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.value.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + duration / 1000)
    
    oscillator.start(audioContext.value.currentTime)
    oscillator.stop(audioContext.value.currentTime + duration / 1000)
  }
  
  /**
   * Play drag start sound - a gentle upward sweep (for carousel swatches)
   */
  const playDragStart = () => {
    if (!isEnabled.value) return
    
    initAudioContext()
    if (!audioContext.value) return
    
    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    // Upward frequency sweep from 300Hz to 500Hz
    oscillator.frequency.setValueAtTime(300, audioContext.value.currentTime)
    oscillator.frequency.linearRampToValueAtTime(500, audioContext.value.currentTime + 0.15)
    oscillator.type = 'sine'
    
    // Gentle envelope
    gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.08, audioContext.value.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.15)
    
    oscillator.start(audioContext.value.currentTime)
    oscillator.stop(audioContext.value.currentTime + 0.15)
  }
  
  /**
   * Play drag out sound - a gentle downward sweep (for palette grid swatches)
   */
  const playDragOut = () => {
    if (!isEnabled.value) return
    
    initAudioContext()
    if (!audioContext.value) return
    
    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    // Downward frequency sweep from 500Hz to 300Hz
    oscillator.frequency.setValueAtTime(500, audioContext.value.currentTime)
    oscillator.frequency.linearRampToValueAtTime(300, audioContext.value.currentTime + 0.15)
    oscillator.type = 'sine'
    
    // Gentle envelope
    gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.08, audioContext.value.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.15)
    
    oscillator.start(audioContext.value.currentTime)
    oscillator.stop(audioContext.value.currentTime + 0.15)
  }
  
  /**
   * Play drop success sound - a light click like something clicking into place
   */
  const playDropSuccess = () => {
    if (!isEnabled.value) return
    
    initAudioContext()
    if (!audioContext.value) return
    
    // Create a quick, sharp click sound using white noise and filtering
    const audioBuffer = audioContext.value.createBuffer(1, 1024, audioContext.value.sampleRate)
    const bufferData = audioBuffer.getChannelData(0)
    
    // Generate a short burst of filtered white noise for the click
    for (let i = 0; i < bufferData.length; i++) {
      // Create a decaying noise burst
      const decay = Math.exp(-i * 8 / bufferData.length)
      bufferData[i] = (Math.random() * 2 - 1) * decay * 0.3
    }
    
    const source = audioContext.value.createBufferSource()
    const filter = audioContext.value.createBiquadFilter()
    const gainNode = audioContext.value.createGain()
    
    source.buffer = audioBuffer
    
    // High-pass filter to make it sound crisp and clicky
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(2000, audioContext.value.currentTime)
    filter.Q.setValueAtTime(1.5, audioContext.value.currentTime)
    
    // Quick attack and decay for click effect
    gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.value.currentTime + 0.001)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.08)
    
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    source.start(audioContext.value.currentTime)
    source.stop(audioContext.value.currentTime + 0.08)
  }
  
  /**
   * Play removal sound - a paper crumple effect like Mac recycle bin
   */
  const playRemoval = () => {
    if (!isEnabled.value) return
    
    initAudioContext()
    if (!audioContext.value) return
    
    // Create a buffer for the crumple sound
    const bufferSize = Math.floor(audioContext.value.sampleRate * 0.4) // 400ms
    const audioBuffer = audioContext.value.createBuffer(1, bufferSize, audioContext.value.sampleRate)
    const bufferData = audioBuffer.getChannelData(0)
    
    // Generate paper crumple sound using filtered noise bursts
    for (let i = 0; i < bufferData.length; i++) {
      const t = i / bufferData.length
      
      // Create multiple crinkle layers with different characteristics
      let sample = 0
      
      // Primary crumple (high-frequency crackles)
      const crackle1 = Math.random() * 2 - 1
      const envelope1 = Math.exp(-t * 6) * Math.sin(t * Math.PI * 40) // Decay with high-freq modulation
      sample += crackle1 * envelope1 * 0.4
      
      // Secondary crumple (mid-frequency texture)
      if (Math.random() < 0.3) { // Sparse additional crackles
        const crackle2 = Math.random() * 2 - 1
        const envelope2 = Math.exp(-t * 4) * (1 - t) // Slower decay
        sample += crackle2 * envelope2 * 0.3
      }
      
      // Light paper rustle (low-frequency base)
      const rustle = (Math.random() * 2 - 1) * 0.1
      const rustleEnv = Math.exp(-t * 2) * Math.sin(t * Math.PI * 8)
      sample += rustle * rustleEnv * 0.2
      
      // Overall envelope - quick start, gradual decay
      const masterEnv = Math.exp(-t * 5) * (1 - t * 0.7)
      bufferData[i] = sample * masterEnv * 0.25
    }
    
    const source = audioContext.value.createBufferSource()
    const filter = audioContext.value.createBiquadFilter()
    const gainNode = audioContext.value.createGain()
    
    source.buffer = audioBuffer
    
    // Band-pass filter to emphasize the crinkly frequencies
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(3000, audioContext.value.currentTime)
    filter.Q.setValueAtTime(2, audioContext.value.currentTime)
    
    // Gentle fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.value.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.35)
    
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    source.start(audioContext.value.currentTime)
    source.stop(audioContext.value.currentTime + 0.4)
  }

  /**
   * Play a subtle click sound
   */
  const playClick = () => {
    createBeep(800, 50, 0.05)
  }
  
  /**
   * Toggle sound on/off
   */
  const toggleSound = () => {
    isEnabled.value = !isEnabled.value
  }
  
  /**
   * Enable sound
   */
  const enableSound = () => {
    isEnabled.value = true
  }
  
  /**
   * Disable sound
   */
  const disableSound = () => {
    isEnabled.value = false
  }
  
  return {
    isEnabled,
    playDragStart,
    playDragOut,
    playDropSuccess,
    playRemoval,
    playClick,
    createBeep,
    toggleSound,
    enableSound,
    disableSound
  }
}