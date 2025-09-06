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
   * Play upward frequency sweep - a gentle rising tone
   */
  const playUpSweep = () => {
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
   * Play downward frequency sweep - a gentle falling tone
   */
  const playDownSweep = () => {
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
   * Play soft click sound - a crisp, filtered click tone
   */
  const playSoftClick = () => {
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
   * Play crumple sound - textured paper crinkle effect
   */
  const playCrumple = () => {
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
   * Play sharp click sound - a bright, high-pitched click tone
   */
  const playSharpClick = () => {
    if (!isEnabled.value) return
    
    initAudioContext()
    if (!audioContext.value) return
    
    // Create a quick, higher-pitched navigation click
    const audioBuffer = audioContext.value.createBuffer(1, 512, audioContext.value.sampleRate)
    const bufferData = audioBuffer.getChannelData(0)
    
    // Generate a bright, crisp navigation sound
    for (let i = 0; i < bufferData.length; i++) {
      const t = i / bufferData.length
      
      // Create a short burst of filtered noise for the click
      const decay = Math.exp(-i * 12 / bufferData.length)
      bufferData[i] = (Math.random() * 2 - 1) * decay * 0.4
    }
    
    const source = audioContext.value.createBufferSource()
    const filter = audioContext.value.createBiquadFilter()
    const gainNode = audioContext.value.createGain()
    
    source.buffer = audioBuffer
    
    // High-pass filter for bright, crisp navigation sound
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(3500, audioContext.value.currentTime) // Higher than drop success
    filter.Q.setValueAtTime(2, audioContext.value.currentTime)
    
    // Quick, snappy envelope for navigation feedback
    gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.12, audioContext.value.currentTime + 0.001)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.value.currentTime + 0.05)
    
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    source.start(audioContext.value.currentTime)
    source.stop(audioContext.value.currentTime + 0.05)
  }

  /**
   * Play soft bell sound - a joyful, harp-like arpeggio
   */
  const playSoftBell = () => {
    if (!isEnabled.value) return
    
    initAudioContext()
    if (!audioContext.value) return
    
    // Create a pleasant harp-like arpeggio using warm frequencies
    const baseFreq = 523.25 // C5 - warm, pleasant frequency
    const duration = 1.2 // Longer for graceful arpeggio
    
    // Harp-like arpeggio notes (C major triad with octave)
    const notes = [
      { freq: baseFreq, delay: 0 },          // C5
      { freq: baseFreq * 1.25, delay: 0.1 }, // E5 (major third)
      { freq: baseFreq * 1.5, delay: 0.2 },  // G5 (perfect fifth)
      { freq: baseFreq * 2, delay: 0.3 }     // C6 (octave)
    ]
    
    notes.forEach((note, index) => {
      // Create oscillator for fundamental frequency
      const oscillator = audioContext.value.createOscillator()
      const gainNode = audioContext.value.createGain()
      
      // Add subtle harmonics for warmth
      const harmonic2 = audioContext.value.createOscillator()
      const harmonic2Gain = audioContext.value.createGain()
      
      const harmonic3 = audioContext.value.createOscillator()
      const harmonic3Gain = audioContext.value.createGain()
      
      // Connect nodes
      oscillator.connect(gainNode)
      harmonic2.connect(harmonic2Gain)
      harmonic3.connect(harmonic3Gain)
      
      gainNode.connect(audioContext.value.destination)
      harmonic2Gain.connect(audioContext.value.destination)
      harmonic3Gain.connect(audioContext.value.destination)
      
      // Set frequencies
      oscillator.frequency.setValueAtTime(note.freq, audioContext.value.currentTime + note.delay)
      harmonic2.frequency.setValueAtTime(note.freq * 2, audioContext.value.currentTime + note.delay)
      harmonic3.frequency.setValueAtTime(note.freq * 3, audioContext.value.currentTime + note.delay)
      
      // Use sine waves for pure, harp-like tones
      oscillator.type = 'sine'
      harmonic2.type = 'sine'
      harmonic3.type = 'sine'
      
      // Harp pluck envelope - instant attack, gentle decay
      const startTime = audioContext.value.currentTime + note.delay
      const noteDecay = 0.8 - (index * 0.1) // Earlier notes ring longer
      
      // Fundamental tone
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.04, startTime + 0.005) // Quick pluck attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDecay)
      
      // Second harmonic (softer)
      harmonic2Gain.gain.setValueAtTime(0, startTime)
      harmonic2Gain.gain.linearRampToValueAtTime(0.01, startTime + 0.005)
      harmonic2Gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDecay * 0.7)
      
      // Third harmonic (even softer, adds sparkle)
      harmonic3Gain.gain.setValueAtTime(0, startTime)
      harmonic3Gain.gain.linearRampToValueAtTime(0.004, startTime + 0.005)
      harmonic3Gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDecay * 0.5)
      
      // Start and stop oscillators
      oscillator.start(startTime)
      harmonic2.start(startTime)
      harmonic3.start(startTime)
      
      oscillator.stop(startTime + noteDecay)
      harmonic2.stop(startTime + noteDecay * 0.7)
      harmonic3.stop(startTime + noteDecay * 0.5)
    })
  }

  /**
   * Play subtle click sound - a quiet, simple beep tone
   */
  const playSubtleClick = () => {
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
    playUpSweep,
    playDownSweep,
    playSoftClick,
    playCrumple,
    playSharpClick,
    playSubtleClick,
    playSoftBell,
    createBeep,
    toggleSound,
    enableSound,
    disableSound
  }
}