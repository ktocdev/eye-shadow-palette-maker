<script setup>
import { onMounted } from 'vue'
import SwatchesExplorer from '../components/SwatchesExplorer.vue'
import { useSound } from '../composables/useSound.js'

// Initialize sound system on user interaction
const { initializeSoundSystem } = useSound()

onMounted(() => {
  // Initialize sound system on first user interaction
  const initializeOnInteraction = async () => {
    await initializeSoundSystem()
    // Remove listeners after first initialization
    document.removeEventListener('click', initializeOnInteraction)
    document.removeEventListener('touchstart', initializeOnInteraction)
    document.removeEventListener('keydown', initializeOnInteraction)
  }

  // Listen for first user interaction
  document.addEventListener('click', initializeOnInteraction)
  document.addEventListener('touchstart', initializeOnInteraction)  
  document.addEventListener('keydown', initializeOnInteraction)
})
</script>

<template>
  <div id="app">
    <SwatchesExplorer />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

#app {
  height: 100vh;
  width: 100%;
}
</style>