<template>
  <button
    :class="[
      'v-button',
      `v-button--${variant}`,
      `v-button--${size}`,
      { 'v-button--fullWidth': fullWidth, 'v-button--disabled': disabled }
    ]"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
  >
    <span v-if="iconLeft" class="v-button__icon v-button__icon--left">
      <slot name="icon-left"></slot>
    </span>
    <slot></slot>
    <span v-if="iconRight" class="v-button__icon v-button__icon--right">
      <slot name="icon-right"></slot>
    </span>
    <span v-if="loading" class="v-button__loader">
      <span class="v-button__loader-dot"></span>
      <span class="v-button__loader-dot"></span>
      <span class="v-button__loader-dot"></span>
    </span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VButton',
  
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value: string) => ['primary', 'secondary', 'tertiary', 'ghost', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value: string) => ['small', 'medium', 'large'].includes(value)
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    iconLeft: {
      type: Boolean,
      default: false
    },
    iconRight: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'button',
      validator: (value: string) => ['button', 'submit', 'reset'].includes(value)
    }
  },
  
  emits: ['click'],
  
  setup(props, { emit }) {
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) {
        event.preventDefault();
        return;
      }
      
      emit('click', event);
    };
    
    return {
      handleClick
    };
  }
});
</script>

<style lang="scss">
.v-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: var(--font-family-sans);
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  outline: none;
  border: none;
  padding: 0.75rem 1.5rem;
  overflow: hidden;
  user-select: none;
  
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  // Variants
  &--primary {
    background-color: var(--color-primary);
    color: #ffffff;
    
    &:hover:not(.v-button--disabled) {
      background-color: var(--color-primary-dark, var(--color-primary));
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    &:active:not(.v-button--disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
  
  &--secondary {
    background-color: var(--color-secondary);
    color: #ffffff;
    
    &:hover:not(.v-button--disabled) {
      background-color: var(--color-secondary-dark, var(--color-secondary));
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    &:active:not(.v-button--disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
  
  &--tertiary {
    background-color: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
    
    &:hover:not(.v-button--disabled) {
      background-color: rgba(156, 39, 176, 0.05);
      transform: translateY(-2px);
    }
    
    &:active:not(.v-button--disabled) {
      transform: translateY(0);
    }
  }
  
  &--ghost {
    background-color: transparent;
    color: var(--color-text);
    
    &:hover:not(.v-button--disabled) {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  
  &--danger {
    background-color: var(--color-error);
    color: #ffffff;
    
    &:hover:not(.v-button--disabled) {
      background-color: var(--color-error-dark, var(--color-error));
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(244, 67, 54, 0.2);
    }
    
    &:active:not(.v-button--disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(244, 67, 54, 0.2);
    }
  }
  
  // Sizes
  &--small {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    height: 2.25rem;
  }
  
  &--medium {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    height: 2.75rem;
  }
  
  &--large {
    font-size: 1.125rem;
    padding: 1rem 2rem;
    height: 3.25rem;
  }
  
  // States
  &--fullWidth {
    width: 100%;
  }
  
  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  // Icons
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    
    &--left {
      margin-right: 0.5rem;
    }
    
    &--right {
      margin-left: 0.5rem;
    }
  }
  
  // Loading state
  &__loader {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: inherit;
    border-radius: inherit;
  }
  
  &__loader-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0.6;
    margin: 0 0.25rem;
    animation: v-button-loader 1.4s infinite ease-in-out both;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes v-button-loader {
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1);
  }
}
</style>
