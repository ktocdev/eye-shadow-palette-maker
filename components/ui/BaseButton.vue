<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'gray',
    validator: (value) => ['red', 'purple', 'gray', 'green', 'blue', 'orange', 'ghost-green', 'ghost-red'].includes(value)
  },
  size: {
    type: String,
    default: 'standard',
    validator: (value) => ['standard', 'compact'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button 
    :type="type"
    :disabled="disabled"
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--disabled': disabled }
    ]"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style>
/* Base button styles */
.base-button {
  font-family: var(--font-family-button);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: var(--shadow-button);
}

/* Size variants */
.base-button--standard {
  padding: 12px 16px;
  border-radius: var(--radius-button);
  font-size: var(--font-size-base);
}

.base-button--compact {
  padding: 8px 12px;
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
}

/* Color variants */
.base-button--red {
  background: var(--gradient-button-red);
}

.base-button--red:hover:not(.base-button--disabled) {
  background: var(--gradient-button-red-hover);
  box-shadow: var(--shadow-button-hover);
}

.base-button--purple {
  background: var(--gradient-button-purple);
}

.base-button--purple:hover:not(.base-button--disabled) {
  background: var(--gradient-button-purple-hover);
  box-shadow: var(--shadow-button-hover);
}

.base-button--gray {
  background: var(--gradient-button-gray);
  border: none;
}

.base-button--gray:hover:not(.base-button--disabled) {
  background: var(--gradient-button-gray-hover);
}

.base-button--green {
  background: var(--gradient-button-green);
}

.base-button--green:hover:not(.base-button--disabled) {
  background: var(--gradient-button-green-hover);
  box-shadow: var(--shadow-button-hover);
}

.base-button--blue {
  background: var(--gradient-button-blue);
}

.base-button--blue:hover:not(.base-button--disabled) {
  background: var(--gradient-button-blue-hover);
  box-shadow: var(--shadow-button-hover);
}

.base-button--orange {
  background: var(--gradient-button-orange);
}

.base-button--orange:hover:not(.base-button--disabled) {
  background: var(--gradient-button-orange-hover);
  box-shadow: var(--shadow-button-hover);
}

/* Ghost variants */
.base-button--ghost-green {
  background: none;
  color: var(--color-success-primary);
  border: 1px solid var(--color-success-border);
  box-shadow: none;
}

.base-button--ghost-green:hover:not(.base-button--disabled) {
  background: var(--color-success-background);
  border-color: var(--color-success-border-hover);
  box-shadow: none;
}

.base-button--ghost-red {
  background: none;
  color: var(--color-danger-primary);
  border: 1px solid var(--color-danger-border);
  box-shadow: none;
}

.base-button--ghost-red:hover:not(.base-button--disabled) {
  background: var(--color-danger-background);
  border-color: var(--color-danger-border-hover);
  box-shadow: none;
}

/* Disabled state */
.base-button--disabled {
  background: var(--gradient-button-gray);
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.6;
  box-shadow: var(--shadow-button);
}

/* Ghost button disabled state */
.base-button--ghost-green.base-button--disabled,
.base-button--ghost-red.base-button--disabled {
  background: none;
  color: var(--color-text-muted);
  border-color: rgba(153, 153, 153, 0.3);
  box-shadow: none;
}
</style>
