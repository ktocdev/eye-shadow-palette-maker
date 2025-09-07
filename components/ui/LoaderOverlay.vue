<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Saving palette...'
  }
})

const emit = defineEmits(['update:modelValue'])

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="loader-overlay">
      <div 
        v-if="modelValue"
        class="loader-overlay"
        role="status"
        aria-live="polite"
        :aria-label="message"
      >
        <div class="loader-backdrop" @click="handleClose"></div>
        <div class="loader-container">
          <div class="loader-palette">
            <div class="loader-grid">
              <div class="loader-cell" v-for="i in 4" :key="i"></div>
            </div>
          </div>
          <p class="loader-text">{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}

.loader-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  background: var(--gradient-container-primary);
  border: var(--border-container);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-palette-container);
  padding: 48px;
  min-width: 280px;
  text-align: center;
}

.loader-palette {
  position: relative;
}

.loader-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  width: 80px;
  height: 80px;
  padding: 8px;
  background: var(--gradient-container-secondary);
  border: var(--border-container-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-grid-inner);
}

.loader-cell {
  border-radius: var(--radius-sm);
  background: var(--gradient-shimmer-effect);
  background-size: 200% 200%;
  animation: shimmer 1.5s ease-in-out infinite;
  box-shadow: var(--shadow-swatch);
}

.loader-cell:nth-child(1) {
  background-color: #E8B4CB;
  animation-delay: 0s;
}

.loader-cell:nth-child(2) {
  background-color: #D4A5A5;
  animation-delay: 0.2s;
}

.loader-cell:nth-child(3) {
  background-color: #A8B5C8;
  animation-delay: 0.4s;
}

.loader-cell:nth-child(4) {
  background-color: #C8B5A8;
  animation-delay: 0.6s;
}

.loader-text {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-normal);
}

/* Animations */
@keyframes shimmer {
  0% {
    opacity: 0.6;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}

/* Transition animations */
.loader-overlay-enter-active,
.loader-overlay-leave-active {
  transition: all 0.3s ease;
}

.loader-overlay-enter-active .loader-backdrop,
.loader-overlay-leave-active .loader-backdrop {
  transition: all 0.3s ease;
}

.loader-overlay-enter-active .loader-container,
.loader-overlay-leave-active .loader-container {
  transition: all 0.3s ease;
}

.loader-overlay-enter-from {
  opacity: 0;
}

.loader-overlay-enter-from .loader-backdrop {
  opacity: 0;
}

.loader-overlay-enter-from .loader-container {
  opacity: 0;
  transform: scale(0.9);
}

.loader-overlay-leave-to {
  opacity: 0;
}

.loader-overlay-leave-to .loader-backdrop {
  opacity: 0;
}

.loader-overlay-leave-to .loader-container {
  opacity: 0;
  transform: scale(0.9);
}
</style>