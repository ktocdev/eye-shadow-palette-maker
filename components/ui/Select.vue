<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true
    // Expected format: [{ value: 'key', label: 'Display Name' }, ...]
  },
  placeholder: {
    type: String,
    default: 'Select option'
  }
})

const emit = defineEmits(['change'])

const selectRef = ref(null)

const displayLabel = computed(() => {
  const selectedOption = props.options.find(option => option.value === props.value)
  return selectedOption ? selectedOption.label : props.placeholder
})

const handleChange = (event) => {
  emit('change', event.target.value)
}
</script>

<template>
  <div class="select-wrapper">
    <select
      ref="selectRef"
      :value="value"
      @change="handleChange"
      class="select-input"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <div class="select-arrow">▼</div>
  </div>
</template>

<style scoped>
.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--border-color-primary-base);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  appearance: none;
  transition: all 0.2s ease;
}

.select-input:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(139, 129, 165, 0.4);
}

.select-input:focus {
  outline: none;
  border-color: var(--color-accent-50);
  box-shadow: 0 0 0 3px var(--color-accent-10);
  background: rgba(255, 255, 255, 1);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  transition: transform 0.2s ease;
}

.select-input:focus + .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .select-input {
    padding: 10px 32px 10px 12px;
    font-size: var(--font-size-base);
  }
}
</style>