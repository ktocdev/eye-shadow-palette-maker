<script setup>
import { ref, watch, onMounted } from 'vue'
import { useSound } from '../../composables/useSound.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: 'saved successfully!'
  },
  duration: {
    type: Number,
    default: 5000 // 5 seconds
  },
  showAction: {
    type: Boolean,
    default: true
  },
  actionText: {
    type: String,
    default: 'View Saved Palettes'
  }
})

const emit = defineEmits(['update:modelValue', 'view-saved-palettes'])

// Use sound composable
const { playSoftClick, playSoftBell } = useSound()

const timeoutId = ref(null)

const handleClose = () => {
  playSoftClick()
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
    timeoutId.value = null
  }
  emit('update:modelValue', false)
}

const handleAction = () => {
  emit('view-saved-palettes')
  handleClose()
}

// Auto-dismiss timer
watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    // Play bell sound when toast appears
    playSoftBell()
    
    // Clear any existing timeout
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
    }
    
    // Set new timeout for auto-dismiss
    timeoutId.value = setTimeout(() => {
      handleClose()
    }, props.duration)
  } else {
    // Clear timeout if manually closed
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
  }
}, { immediate: true })

// Cleanup on unmount
onMounted(() => {
  return () => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
    }
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div 
        v-if="modelValue"
        class="toast-notification"
        role="alert"
        aria-live="assertive"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.67 6L8.33 14.33L3.33 9.33" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="toast-text">
            <p class="toast-message">
              <strong>{{ title }}</strong> {{ message }}
            </p>
            <button 
              v-if="showAction"
              @click="handleAction"
              class="toast-action"
            >
              {{ actionText }}
            </button>
          </div>
          <button 
            @click="handleClose"
            class="toast-close"
            aria-label="Dismiss notification"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Progress bar for auto-dismiss -->
        <div class="toast-progress">
          <div 
            class="toast-progress-bar"
            :style="{ animationDuration: duration + 'ms' }"
          ></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9998;
  max-width: 400px;
  min-width: 320px;
  background: var(--color-background-primary);
  border: 1px solid var(--color-success-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-button);
  overflow: hidden;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--color-success-primary);
  margin-top: 2px;
}

.toast-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast-message {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  margin: 0;
}

.toast-message strong {
  font-weight: var(--font-weight-semibold);
  color: var(--color-success-primary);
}

.toast-action {
  background: none;
  border: none;
  color: var(--color-success-primary);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  align-self: flex-start;
  transition: color 0.2s ease;
}

.toast-action:hover {
  color: var(--color-success-border-hover);
}

.toast-action:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-xs);
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: var(--color-hover);
  color: var(--color-text-primary);
}

.toast-close:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.toast-progress {
  height: 3px;
  background: rgba(34, 139, 34, 0.1);
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  background: var(--color-success-primary);
  width: 100%;
  transform-origin: left;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .toast-notification {
    left: 16px;
    right: 16px;
    top: 16px;
    max-width: none;
    min-width: auto;
  }
  
  .toast-content {
    padding: 14px;
  }
  
  .toast-message {
    font-size: var(--font-size-sm);
  }
}</style>