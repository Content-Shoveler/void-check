<template>
  <div :class="[
    'cyber-toggle',
    { 'cyber-toggle--checked': modelValue, 'cyber-toggle--disabled': disabled }
  ]">
    <label class="cyber-toggle__label" :for="id" v-if="label">{{ label }}</label>
    <div class="cyber-toggle__container">
      <input
        type="checkbox"
        :id="id"
        class="cyber-toggle__input"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
        v-bind="$attrs"
      >
      <div class="cyber-toggle__track">
        <div class="cyber-toggle__thumb"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
  name: 'CyberToggle',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: () => `cyber-toggle-${uuidv4()}`
    }
  },
  
  emits: ['update:modelValue', 'change'],
  
  setup(props, { emit }) {
    const onChange = (event: Event) => {
      const checked = (event.target as HTMLInputElement).checked;
      emit('update:modelValue', checked);
      emit('change', checked);
    };
    
    return {
      onChange
    };
  },
  
  inheritAttrs: false
});
</script>

<style lang="scss">
.cyber-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  
  &__label {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    cursor: pointer;
  }
  
  &__container {
    position: relative;
    display: inline-block;
  }
  
  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    
    &:focus-visible + .cyber-toggle__track {
      outline: var(--border-regular) solid var(--color-primary);
      outline-offset: 2px;
      box-shadow: 0 0 5px var(--color-primary);
    }
  }
  
  &__track {
    display: inline-block;
    width: 44px;
    height: 24px;
    border-radius: var(--radius-full);
    background-color: rgba(var(--color-background-elevated-rgb), 0.7);
    position: relative;
    cursor: pointer;
    transition: var(--transition-base);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    padding: 2px;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: var(--radius-full);
      background: linear-gradient(90deg, 
        rgba(var(--color-background-elevated-rgb), 1), 
        rgba(var(--color-primary-rgb), 0.1)
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
    }
  }
  
  &__thumb {
    position: relative;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: var(--color-text-secondary);
    transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
    z-index: 1;
  }
  
  // Checked state
  &--checked {
    .cyber-toggle__track {
      border-color: var(--color-primary);
      
      &::before {
        opacity: 1;
      }
    }
    
    .cyber-toggle__thumb {
      transform: translateX(20px);
      background-color: var(--color-primary);
      box-shadow: 0 0 8px var(--color-primary), 0 0 16px rgba(var(--color-primary-rgb), 0.5);
    }
  }
  
  // Disabled state
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    .cyber-toggle__track, 
    .cyber-toggle__label {
      cursor: not-allowed;
    }
  }
  
  // Hover effects
  &:not(.cyber-toggle--disabled):hover {
    .cyber-toggle__track {
      border-color: var(--color-primary);
    }
    
    &.cyber-toggle--checked .cyber-toggle__thumb {
      box-shadow: 0 0 10px var(--color-primary), 0 0 20px rgba(var(--color-primary-rgb), 0.6);
    }
  }
}
</style>
