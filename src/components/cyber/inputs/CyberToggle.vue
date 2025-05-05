<template>
  <div 
    :class="[
      'cyber-toggle',
      { 'cyber-toggle--checked': modelValue, 'cyber-toggle--disabled': disabled }
    ]"
    @click="!disabled && toggleSwitch()"
  >
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
        <div class="cyber-toggle__circuit-lines"></div>
        <div class="cyber-toggle__thumb"></div>
        <div class="cyber-toggle__glow"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
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
    const isAnimating = ref(false);
    
    const toggleSwitch = () => {
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
      toggleSwitch,
      isAnimating
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
  position: relative;
  
  &__label {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    position: relative;
    
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
      box-shadow: 0 0 8px var(--color-primary);
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
    overflow: hidden;
    
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
        rgba(var(--color-primary-rgb), 0.2)
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
    }
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-full);
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
  
  &__circuit-lines {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    &::before, &::after {
      content: '';
      position: absolute;
      height: 2px;
      background-color: rgba(var(--color-primary-rgb), 0.6);
      top: 50%;
      transform: translateY(-50%);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    &::before {
      left: 6px;
      right: 6px;
      transform: translateY(-50%) scaleX(0);
      transform-origin: left;
    }
    
    &::after {
      width: 4px;
      height: 8px;
      left: 8px;
      background-color: rgba(var(--color-primary-rgb), 0.4);
      border-radius: var(--radius-sm);
      box-shadow: 
        16px 0 0 rgba(var(--color-primary-rgb), 0.4),
        32px 0 0 rgba(var(--color-primary-rgb), 0.4);
    }
  }
  
  &__thumb {
    position: relative;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: var(--color-text-secondary);
    transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
    z-index: 2;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
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
      animation: cyber-toggle-spin 3s linear infinite;
    }
  }
  
  &__glow {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 3;
    opacity: 0;
  }
  
  // Checked state
  &--checked {
    .cyber-toggle__track {
      border-color: var(--color-primary);
      
      &::before {
        opacity: 1;
      }
      
      &::after {
        opacity: 0.5;
        animation: cyber-toggle-gradient 3s infinite alternate;
      }
    }
    
    .cyber-toggle__circuit-lines {
      opacity: 1;
      
      &::before {
        transform: translateY(-50%) scaleX(1);
        transition-delay: 0.1s;
      }
    }
    
    .cyber-toggle__thumb {
      transform: translateX(20px);
      background-color: var(--color-primary);
      box-shadow: 0 0 8px var(--color-primary), 0 0 16px rgba(var(--color-primary-rgb), 0.5);
      
      &::before {
        opacity: 0.6;
      }
    }
    
    .cyber-toggle__glow {
      animation: cyber-toggle-pulse 2s infinite;
    }
    
    .cyber-toggle__label {
      color: var(--color-primary);
      text-shadow: 0 0 3px rgba(var(--color-primary-rgb), 0.4);
      
      &::after {
        opacity: 0.5;
      }
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
    
    .cyber-toggle__circuit-lines,
    .cyber-toggle__glow,
    .cyber-toggle__thumb::before {
      display: none;
    }
    
    .cyber-toggle__track::after {
      display: none;
    }
  }
  
  // Hover effects
  &:not(.cyber-toggle--disabled):hover {
    .cyber-toggle__track {
      border-color: var(--color-primary);
      box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.3);
      
      &::after {
        opacity: 0.3;
      }
    }
    
    .cyber-toggle__label {
      color: var(--color-primary);
      
      &::after {
        opacity: 0.3;
      }
    }
    
    &.cyber-toggle--checked .cyber-toggle__thumb {
      box-shadow: 0 0 10px var(--color-primary), 0 0 20px rgba(var(--color-primary-rgb), 0.6);
    }
  }
  
  // Active effects
  &:not(.cyber-toggle--disabled):active {
    .cyber-toggle__thumb {
      transform: scale(0.95) translateX(20px);
    }
    
    &:not(.cyber-toggle--checked) .cyber-toggle__thumb {
      transform: scale(0.95);
    }
  }
}

@keyframes cyber-toggle-gradient {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

@keyframes cyber-toggle-pulse {
  0% {
    box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(var(--color-primary-rgb), 0.6), 0 0 30px rgba(var(--color-primary-rgb), 0.4);
  }
  100% {
    box-shadow: 0 0 5px rgba(var(--color-primary-rgb),.3);
  }
}

@keyframes cyber-toggle-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
