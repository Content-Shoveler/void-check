<template>
  <div 
    :class="[
      'cyber-radio',
      { 'cyber-radio--checked': modelValue === value, 'cyber-radio--disabled': disabled }
    ]"
    @click="!disabled && onChange()"
  >
    <div class="cyber-radio__container">
      <input
        type="radio"
        :id="id"
        :name="name"
        class="cyber-radio__input"
        :checked="modelValue === value"
        :value="value"
        :disabled="disabled"
        @change="onChange"
        v-bind="$attrs"
      >
      <div class="cyber-radio__circle">
        <div class="cyber-radio__inner-circle"></div>
        <div class="cyber-radio__pulse"></div>
      </div>
    </div>
    <label 
      v-if="label" 
      :for="id" 
      class="cyber-radio__label"
    >
      {{ label }}
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
  name: 'CyberRadio',
  
  props: {
    modelValue: {
      type: [String, Number, Boolean, Object],
      required: true
    },
    value: {
      type: [String, Number, Boolean, Object],
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
    },
    id: {
      type: String,
      default: () => `cyber-radio-${uuidv4()}`
    }
  },
  
  emits: ['update:modelValue', 'change'],
  
  setup(props, { emit }) {
    const onChange = () => {
      if (props.disabled) return;
      emit('update:modelValue', props.value);
      emit('change', props.value);
    };
    
    return {
      onChange
    };
  },
  
  inheritAttrs: false
});
</script>

<style lang="scss">
.cyber-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  position: relative;
  
  &__container {
    position: relative;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    
    &:focus-visible + .cyber-radio__circle {
      outline: var(--border-regular) solid var(--color-primary);
      outline-offset: 2px;
      box-shadow: 0 0 8px var(--color-primary);
    }
  }
  
  &__circle {
    position: relative;
    width: 18px;
    height: 18px;
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.6);
    background-color: rgba(var(--color-background-inset-rgb), 0.7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-base);
    
    &::before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      border-radius: 50%;
      background: conic-gradient(
        from 0deg, 
        rgba(var(--color-primary-rgb), 0), 
        rgba(var(--color-primary-rgb), 0.8), 
        rgba(var(--color-primary-rgb), 0)
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
      animation: cyber-radio-spin 3s linear infinite;
    }
  }
  
  &__inner-circle {
    width: 8px;
    height: 8px;
    background-color: var(--color-primary);
    border-radius: 50%;
    opacity: 0;
    transform: scale(0);
    transition: transform 0.2s ease, opacity 0.2s ease;
    box-shadow: 0 0 6px var(--color-primary);
  }
  
  &__pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(var(--color-primary-rgb), 0.3);
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
  }
  
  &__label {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    transition: all 0.2s ease;
    cursor: pointer;
    user-select: none;
    position: relative;
    z-index: 1;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -2px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--color-primary),
        transparent
      );
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }
  
  // Checked state
  &--checked {
    .cyber-radio__circle {
      border-color: var(--color-primary);
      background-color: rgba(var(--color-primary-rgb), 0.1);
      box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.4);
      
      &::before {
        opacity: 0.6;
      }
    }
    
    .cyber-radio__inner-circle {
      opacity: 1;
      transform: scale(1);
    }
    
    .cyber-radio__label {
      color: var(--color-primary);
      text-shadow: 0 0 3px rgba(var(--color-primary-rgb), 0.4);
      
      &::after {
        opacity: 0.5;
      }
    }
  }
  
  // Pulse animation on change
  &--checked .cyber-radio__pulse {
    animation: cyber-radio-pulse 0.6s ease-out;
  }
  
  // Disabled state
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    .cyber-radio__circle,
    .cyber-radio__label {
      cursor: not-allowed;
    }
    
    .cyber-radio__circle::before {
      display: none;
    }
  }
  
  // Hover effects
  &:not(.cyber-radio--disabled):hover {
    .cyber-radio__circle {
      border-color: var(--color-primary);
      box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.4);
    }
    
    .cyber-radio__label {
      color: var(--color-primary);
      
      &::after {
        opacity: 0.3;
      }
    }
  }
  
  // Active effects
  &:not(.cyber-radio--disabled):active {
    .cyber-radio__circle {
      transform: scale(0.95);
    }
  }
}

@keyframes cyber-radio-pulse {
  0% {
    opacity: 0.8;
    transform: scale(0.5);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

@keyframes cyber-radio-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
