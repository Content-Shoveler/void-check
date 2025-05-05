<template>
  <div 
    :class="[
      'cyber-checkbox',
      { 'cyber-checkbox--checked': modelValue, 'cyber-checkbox--disabled': disabled }
    ]"
    @click="!disabled && toggleCheckbox()"
  >
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
        <div class="cyber-checkbox__glitch-effect"></div>
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
import { defineComponent, ref } from 'vue';
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
    const isAnimating = ref(false);
    
    const toggleCheckbox = () => {
      if (props.disabled) return;
      
      const newValue = !props.modelValue;
      emit('update:modelValue', newValue);
      emit('change', newValue);
      
      // Trigger animation
      isAnimating.value = true;
      setTimeout(() => {
        isAnimating.value = false;
      }, 600);
    };
    
    const onChange = (event: Event) => {
      const checked = (event.target as HTMLInputElement).checked;
      emit('update:modelValue', checked);
      emit('change', checked);
    };
    
    return {
      onChange,
      toggleCheckbox,
      isAnimating
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
    
    &:focus-visible + .cyber-checkbox__box {
      outline: var(--border-regular) solid var(--color-primary);
      outline-offset: 2px;
      box-shadow: 0 0 8px var(--color-primary);
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
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      height: 2px;
      background-color: rgba(var(--color-primary-rgb), 0.7);
      left: -100%;
      right: -100%;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0;
      transition: opacity 0.3s ease;
      filter: blur(1px);
    }
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border: var(--border-thin) solid transparent;
      border-radius: var(--radius-sm);
      background-image: linear-gradient(
        -45deg,
        transparent 30%,
        rgba(var(--color-primary-rgb), 0.4) 50%,
        transparent 70%
      );
      background-size: 400% 400%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }
  
  &__check {
    width: 16px;
    height: 16px;
    color: var(--color-primary);
    opacity: 0;
    transform: scale(0.5);
    transition: transform 0.2s ease, opacity 0.2s ease;
    filter: drop-shadow(0 0 2px var(--color-primary));
  }
  
  &__glitch-effect {
    position: absolute;
    inset: -1px;
    background: linear-gradient(120deg, transparent 10%, rgba(var(--color-primary-rgb), 0.3) 50%, transparent 90%);
    opacity: 0;
    z-index: 2;
    pointer-events: none;
  }
  
  &__label {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    user-select: none;
    
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
    .cyber-checkbox__box {
      border-color: var(--color-primary);
      background-color: rgba(var(--color-primary-rgb), 0.1);
      box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.4);
      
      &::before {
        opacity: 0.7;
        animation: cyber-checkbox-scan 2s infinite linear;
      }
      
      &::after {
        opacity: 0.5;
        animation: cyber-checkbox-gradient 3s infinite alternate;
      }
    }
    
    .cyber-checkbox__check {
      opacity: 1;
      transform: scale(1);
    }
    
    .cyber-checkbox__label {
      color: var(--color-primary);
      text-shadow: 0 0 3px rgba(var(--color-primary-rgb), 0.4);
      
      &::after {
        opacity: 0.5;
      }
    }
    
    .cyber-checkbox__glitch-effect {
      animation: cyber-checkbox-glitch 0.4s ease-out forwards;
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
    
    .cyber-checkbox__box::before,
    .cyber-checkbox__box::after {
      display: none;
    }
  }
  
  // Hover effects
  &:not(.cyber-checkbox--disabled):hover {
    .cyber-checkbox__box {
      border-color: var(--color-primary);
      box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.4);
      
      &::after {
        opacity: 0.3;
      }
    }
    
    .cyber-checkbox__label {
      color: var(--color-primary);
      
      &::after {
        opacity: 0.3;
      }
    }
  }
  
  // Active effects
  &:not(.cyber-checkbox--disabled):active {
    .cyber-checkbox__box {
      transform: scale(0.95);
    }
  }
}

@keyframes cyber-checkbox-scan {
  0% {
    top: -20%;
    opacity: 0.5;
  }
  20% {
    opacity: 0.8;
  }
  100% {
    top: 120%;
    opacity: 0.5;
  }
}

@keyframes cyber-checkbox-gradient {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

@keyframes cyber-checkbox-glitch {
  0% {
    opacity: 0.8;
    transform: translate(0, 0);
  }
  20% {
    transform: translate(-2px, 1px);
    opacity: 0.9;
  }
  40% {
    transform: translate(2px, -1px);
    opacity: 0.8;
  }
  60% {
    transform: translate(-1px, -1px);
    opacity: 0.6;
  }
  80% {
    transform: translate(1px, 1px);
    opacity: 0.4;
  }
  100% {
    transform: translate(0, 0);
    opacity: 0;
  }
}
</style>
