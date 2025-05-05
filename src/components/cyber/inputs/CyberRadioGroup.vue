<template>
  <div class="cyber-radio-group">
    <div class="cyber-radio-group__label" v-if="label">{{ label }}</div>
    <div class="cyber-radio-group__options">
      <CyberRadio
        v-for="option in options"
        :key="option.value"
        :modelValue="modelValue"
        :value="option.value"
        :label="option.label"
        :name="name"
        :disabled="disabled"
        @update:modelValue="updateValue"
        @change="onChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import CyberRadio from './CyberRadio.vue';

type RadioOption = { label: string; value: string | number };

export default defineComponent({
  name: 'CyberRadioGroup',
  
  components: {
    CyberRadio
  },
  
  props: {
    modelValue: {
      type: [String, Number, Boolean, Object],
      required: true
    },
    options: {
      type: Array as PropType<RadioOption[]>,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue', 'change'],
  
  setup(props, { emit }) {
    const updateValue = (value: any) => {
      emit('update:modelValue', value);
    };
    
    const onChange = (value: any) => {
      emit('change', value);
    };
    
    return {
      updateValue,
      onChange
    };
  }
});
</script>

<style lang="scss">
.cyber-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  
  &__label {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    margin-bottom: var(--space-1);
  }
  
  &__options {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    
    // Horizontal layout option
    &.horizontal {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--space-4);
    }
  }
  
  // Cyberpunk-style glowing highlight for the group
  &:hover {
    .cyber-radio-group__label {
      color: var(--color-primary);
      text-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.5);
    }
  }
  
  // Scan line animation effect
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--color-primary),
      transparent
    );
    opacity: 0;
    z-index: 1;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 0.5;
    animation: cyber-scan 2s infinite;
  }
}

@keyframes cyber-scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(1000%);
  }
}
</style>
