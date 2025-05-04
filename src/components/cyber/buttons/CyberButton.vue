<template>
  <button
    :class="[
      'cyber-button',
      `cyber-button--${variant}`,
      { 'cyber-button--loading': loading, 'cyber-button--block': block }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <div v-if="loading" class="cyber-button__loader">
      <div class="cyber-button__loader-dot"></div>
      <div class="cyber-button__loader-dot"></div>
      <div class="cyber-button__loader-dot"></div>
    </div>
    <div v-else class="cyber-button__content">
      <slot name="icon-left"></slot>
      <span v-if="$slots.default" class="cyber-button__label"><slot></slot></span>
      <slot name="icon-right"></slot>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';

export default defineComponent({
  name: 'CyberButton',
  
  props: {
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary',
      validator: (value: string) => ['primary', 'secondary', 'accent', 'ghost', 'danger'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  
  inheritAttrs: false
});
</script>

<style lang="scss">
.cyber-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-primary);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: var(--radius-md);
  transition: var(--transition-base);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &--block {
    width: 100%;
  }
  
  &--primary {
    background: var(--effect-gradient-cosmic);
    color: var(--color-text-primary);
    border: var(--border-thin) solid var(--color-primary);
    
    &:hover:not(:disabled) {
      box-shadow: 0 0 10px var(--color-primary), 0 0 20px rgba(var(--color-primary-rgb), 0.5);
    }
  }
  
  &--secondary {
    background: transparent;
    color: var(--color-secondary);
    border: var(--border-thin) solid var(--color-secondary);
    
    &:hover:not(:disabled) {
      box-shadow: 0 0 10px var(--color-secondary), 0 0 20px rgba(var(--color-secondary-rgb), 0.5);
    }
  }
  
  &--accent {
    background: transparent;
    color: var(--color-accent);
    border: var(--border-thin) solid var(--color-accent);
    
    &:hover:not(:disabled) {
      box-shadow: 0 0 10px var(--color-accent), 0 0 20px rgba(var(--color-accent-rgb), 0.5);
    }
  }
  
  &--ghost {
    background: transparent;
    color: var(--color-text-primary);
    border: none;
    
    &:hover:not(:disabled) {
      background: rgba(var(--color-primary-rgb), 0.1);
    }
  }
  
  &--danger {
    background: rgba(var(--color-status-error-rgb), 0.1);
    color: var(--color-status-error);
    border: var(--border-thin) solid var(--color-status-error);
    
    &:hover:not(:disabled) {
      box-shadow: 0 0 10px var(--color-status-error), 0 0 20px rgba(var(--color-status-error-rgb), 0.5);
    }
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    outline: var(--border-regular) solid var(--color-primary);
    outline-offset: 2px;
    box-shadow: 0 0 5px var(--color-primary);
  }
  
  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
  }
  
  &__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    
    &-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: currentColor;
      animation: cyber-button-loader 1s infinite ease-in-out;
      
      &:nth-child(1) {
        animation-delay: 0s;
      }
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes cyber-button-loader {
  0%, 80%, 100% {
    transform: scale(0.5);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
