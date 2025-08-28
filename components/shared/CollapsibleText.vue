<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  initiallyOpen: {
    type: Boolean,
    default: true
  }
})

const isOpen = ref(props.initiallyOpen)

const toggleCollapse = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="collapsible-text">
    <div class="title-with-toggle">
      <h1 class="collapsible-title" @click="toggleCollapse">{{ title }}</h1>
      <button 
        @click="toggleCollapse"
        class="collapsible-toggle"
        :aria-expanded="isOpen"
        aria-label="Toggle text visibility"
      >
        <span class="caret-icon">{{ isOpen ? '▼' : '▶' }}</span>
      </button>
    </div>
    
    <Transition name="collapse">
      <p v-if="isOpen" class="collapsible-content">
        {{ text }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.collapsible-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.title-with-toggle {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.collapsible-title {
  font-size: var(--font-size-xl);
  line-height: 1;
  margin: 0;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.collapsible-title:hover {
  color: var(--color-purple-dark);
  transform: scale(1.02);
}

.collapsible-toggle {
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.caret-icon {
  display: inline-block;
  transition: transform 0.3s ease;
  font-size: 0.8em;
}

.collapsible-content {
  margin: 0;
  text-align: center;
  max-width: 600px;
}

/* Transition styles */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 100px;
  transform: translateY(0);
}
</style>
