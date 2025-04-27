<template>
  <div :class="[
    'cyber-checkbox',
    { 'cyber-checkbox--checked': modelValue, 'cyber-checkbox--disabled': disabled }
  ]">
    <div class="cyber-checkbox__container">
      <input
        type="checkbox"
        :id="id"
        class="cyber-checkbox__input"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
        v-bind="$attrs"
      >
      <div class="cyber-checkbox__box">
        <svg 
          class="cyber-checkbox__check" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" 
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
    <label 
      v-if="label" 
      :for="id" 
      class="cyber-checkbox__label"
    >
      {{ label }}
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
  name: 'CyberCheckbox',
  
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
      default: () => `cyber-checkbox-${uuidv4()}`
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
.cyber-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  
  &__container {
    position: relative;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    
    &:focus-visible + .cyber-checkbox__box {
      outline: var(--border-regular) solid var(--color-primary);
      outline-offset: 2px;
      box-shadow: 0 0 5px var(--color-primary);
    }
  }
  
  &__box {
    position: relative;
    width: 18px;
    height: 18px;
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.6);
    background-color: rgba(var(--color-background-inset-rgb), 0.7);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-base);
  }
  
  &__check {
    width: 16px;
    height: 16px;
    color: var(--color-primary);
    opacity: 0;
    transform: scale(0.5);
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  
  &__label {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    transition: color 0.2s ease;
    cursor: pointer;
  }
  
  // Checked state
  &--checked {
    .cyber-checkbox__box {
      border-color: var(--color-primary);
      background-color: rgba(var(--color-primary-rgb), 0.1);
      box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.3);
    }
    
    .cyber-checkbox__check {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  // Disabled state
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    .cyber-checkbox__box,
    .cyber-checkbox__label {
      cursor: not-allowed;
    }
  }
  
  // Hover effects
  &:not(.cyber-checkbox--disabled):hover {
    .cyber-checkbox__box {
      border-color: var(--color-primary);
      box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.3);
    }
    
    .cyber-checkbox__label {
      color: var(--color-primary);
    }
  }
}
</style>
