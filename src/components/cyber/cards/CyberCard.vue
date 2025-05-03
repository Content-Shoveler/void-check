<template>
  <div
    :class="[
      'cyber-card',
      `cyber-card--${variant}`,
      { 'cyber-card--loading': loading, 'cyber-card--hoverable': hoverable }
    ]"
    v-bind="$attrs"
  >
    <div v-if="loading" class="cyber-card__skeleton">
      <div class="cyber-card__skeleton-line cyber-card__skeleton-line--header"></div>
      <div class="cyber-card__skeleton-line"></div>
      <div class="cyber-card__skeleton-line"></div>
      <div class="cyber-card__skeleton-line cyber-card__skeleton-line--short"></div>
    </div>
    <div v-else class="cyber-card__content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

type CardVariant = 'flat' | 'elevated' | 'outlined';

export default defineComponent({
  name: 'CyberCard',
  
  props: {
    variant: {
      type: String as PropType<CardVariant>,
      default: 'flat',
      validator: (value: string) => ['flat', 'elevated', 'outlined'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    },
    hoverable: {
      type: Boolean,
      default: true
    }
  },
  
  inheritAttrs: false
});
</script>

<style lang="scss">
.cyber-card {
  background-color: rgba(var(--color-background-card-rgb), 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  transition: var(--transition-base);
  overflow: hidden;
  position: relative;
  
  &--flat {
    box-shadow: none;
  }
  
  &--elevated {
    box-shadow: var(--effect-shadow-normal);
  }
  
  &--outlined {
    background-color: transparent;
    border: var(--border-thin) solid var(--color-primary);
  }
  
  &--hoverable {
    cursor: pointer;
    
    &:hover {
      border-color: var(--color-primary);
      box-shadow: 0 0 10px var(--color-primary), 0 0 20px rgba(var(--color-primary-rgb), 0.3);
      transform: translateY(-2px);
    }
  }
  
  &__content {
    position: relative;
    z-index: 1;
  }
  
  &__skeleton {
    width: 100%;
    height: 100%;
    
    &-line {
      height: 12px;
      margin-bottom: var(--space-3);
      background: linear-gradient(
        90deg,
        rgba(var(--color-primary-rgb), 0.1),
        rgba(var(--color-primary-rgb), 0.2),
        rgba(var(--color-primary-rgb), 0.1)
      );
      border-radius: var(--radius-sm);
      animation: cyber-card-skeleton 1.5s infinite;
      
      &--header {
        height: 20px;
        width: 60%;
        margin-bottom: var(--space-4);
      }
      
      &--short {
        width: 70%;
      }
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(var(--color-primary-rgb), 0.3),
      transparent
    );
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &--hoverable:hover::before {
    opacity: 1;
  }
}

@keyframes cyber-card-skeleton {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}
</style>
