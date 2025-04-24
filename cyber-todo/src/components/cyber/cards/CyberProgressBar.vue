<template>
  <div
    :class="[
      'cyber-progress',
      `cyber-progress--${variant}`,
      `cyber-progress--${size}`,
      { 'cyber-progress--striped': striped, 'cyber-progress--animated': animated }
    ]"
    v-bind="$attrs"
  >
    <div class="cyber-progress__container">
      <div
        class="cyber-progress__bar"
        :style="{
          width: `${clampedValue}%`,
          transition: animated ? 'none' : 'width 0.3s ease'
        }"
      >
        <div v-if="striped" class="cyber-progress__stripes"></div>
      </div>
    </div>
    
    <div v-if="showLabel" class="cyber-progress__labels">
      <span v-if="label" class="cyber-progress__label">{{ label }}</span>
      <span v-if="showPercentage" class="cyber-progress__percentage">{{ clampedValue }}%</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';

type ProgressVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
type ProgressSize = 'small' | 'medium' | 'large';

export default defineComponent({
  name: 'CyberProgressBar',
  
  props: {
    value: {
      type: Number,
      default: 0
    },
    variant: {
      type: String as PropType<ProgressVariant>,
      default: 'primary',
      validator: (value: string) => 
        ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'].includes(value)
    },
    size: {
      type: String as PropType<ProgressSize>,
      default: 'medium',
      validator: (value: string) => ['small', 'medium', 'large'].includes(value)
    },
    striped: {
      type: Boolean,
      default: false
    },
    animated: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    showPercentage: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props) {
    const clampedValue = computed(() => Math.min(Math.max(0, props.value), 100));
    const showLabel = computed(() => props.label || props.showPercentage);
    
    return {
      clampedValue,
      showLabel
    };
  },
  
  inheritAttrs: false
});
</script>

<style lang="scss">
.cyber-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
  
  &__container {
    background-color: rgba(var(--color-background-elevated-rgb), 0.6);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    border-radius: var(--radius-full);
    overflow: hidden;
    position: relative;
  }
  
  &__bar {
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 0.3s ease;
  }
  
  &__stripes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
    z-index: 1;
  }
  
  &__labels {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-secondary);
    font-size: var(--text-xs);
  }
  
  &__label {
    color: var(--color-text-secondary);
  }
  
  &__percentage {
    font-family: var(--font-mono);
    color: var(--color-text-secondary);
  }
  
  // Size variants
  &--small {
    .cyber-progress__container {
      height: 6px;
    }
  }
  
  &--medium {
    .cyber-progress__container {
      height: 10px;
    }
  }
  
  &--large {
    .cyber-progress__container {
      height: 16px;
    }
  }
  
  // Color variants
  &--primary .cyber-progress__bar {
    background-color: var(--color-primary);
    box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
  }
  
  &--secondary .cyber-progress__bar {
    background-color: var(--color-secondary);
    box-shadow: 0 0 8px rgba(var(--color-secondary-rgb), 0.3);
  }
  
  &--accent .cyber-progress__bar {
    background-color: var(--color-accent);
    box-shadow: 0 0 8px rgba(var(--color-accent-rgb), 0.3);
  }
  
  &--success .cyber-progress__bar {
    background-color: var(--color-status-success);
    box-shadow: 0 0 8px rgba(var(--color-status-success-rgb), 0.3);
  }
  
  &--warning .cyber-progress__bar {
    background-color: var(--color-status-warning);
    box-shadow: 0 0 8px rgba(var(--color-status-warning-rgb), 0.3);
  }
  
  &--error .cyber-progress__bar {
    background-color: var(--color-status-error);
    box-shadow: 0 0 8px rgba(var(--color-status-error-rgb), 0.3);
  }
  
  &--info .cyber-progress__bar {
    background-color: var(--color-status-info);
    box-shadow: 0 0 8px rgba(var(--color-status-info-rgb), 0.3);
  }
  
  // Animation
  &--animated .cyber-progress__stripes {
    animation: cyber-progress-stripes 1s linear infinite;
  }
}

@keyframes cyber-progress-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}
</style>
