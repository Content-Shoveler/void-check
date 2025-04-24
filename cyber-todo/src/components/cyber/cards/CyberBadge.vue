<template>
  <div
    :class="[
      'cyber-badge',
      `cyber-badge--${variant}`,
      `cyber-badge--${size}`,
      `cyber-badge--${shape}`,
      { 'cyber-badge--pulsing': pulsing }
    ]"
    v-bind="$attrs"
  >
    <div v-if="$slots.icon" class="cyber-badge__icon">
      <slot name="icon"></slot>
    </div>
    <span v-if="$slots.default" class="cyber-badge__text">
      <slot></slot>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 
                    'low' | 'medium' | 'high' | 'critical';
type BadgeSize = 'small' | 'medium' | 'large';
type BadgeShape = 'pill' | 'square';

export default defineComponent({
  name: 'CyberBadge',
  
  props: {
    variant: {
      type: String as PropType<BadgeVariant>,
      default: 'primary',
      validator: (value: string) => [
        'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info',
        'low', 'medium', 'high', 'critical'
      ].includes(value)
    },
    size: {
      type: String as PropType<BadgeSize>,
      default: 'medium',
      validator: (value: string) => ['small', 'medium', 'large'].includes(value)
    },
    shape: {
      type: String as PropType<BadgeShape>,
      default: 'pill',
      validator: (value: string) => ['pill', 'square'].includes(value)
    },
    pulsing: {
      type: Boolean,
      default: false
    }
  },
  
  inheritAttrs: false
});
</script>

<style lang="scss">
.cyber-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-primary);
  font-weight: var(--font-medium);
  letter-spacing: 0.05em;
  border: var(--border-thin) solid;
  background-color: rgba(var(--color-background-elevated-rgb), 0.3);
  backdrop-filter: blur(4px);
  position: relative;
  overflow: hidden;
  
  // Size variants
  &--small {
    padding: 0 var(--space-1);
    height: 18px;
    font-size: var(--text-xs);
  }
  
  &--medium {
    padding: 0 var(--space-2);
    height: 24px;
    font-size: var(--text-xs);
  }
  
  &--large {
    padding: 0 var(--space-3);
    height: 32px;
    font-size: var(--text-sm);
  }
  
  // Shape variants
  &--pill {
    border-radius: var(--radius-full);
  }
  
  &--square {
    border-radius: var(--radius-sm);
  }
  
  // Color variants
  &--primary {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
  
  &--secondary {
    color: var(--color-secondary);
    border-color: var(--color-secondary);
  }
  
  &--accent {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
  
  &--success {
    color: var(--color-status-success);
    border-color: var(--color-status-success);
  }
  
  &--warning {
    color: var(--color-status-warning);
    border-color: var(--color-status-warning);
  }
  
  &--error {
    color: var(--color-status-error);
    border-color: var(--color-status-error);
  }
  
  &--info {
    color: var(--color-status-info);
    border-color: var(--color-status-info);
  }
  
  // Priority variants
  &--low {
    color: var(--color-priority-low);
    border-color: var(--color-priority-low);
  }
  
  &--medium {
    color: var(--color-priority-medium);
    border-color: var(--color-priority-medium);
  }
  
  &--high {
    color: var(--color-priority-high);
    border-color: var(--color-priority-high);
  }
  
  &--critical {
    color: var(--color-priority-critical);
    border-color: var(--color-priority-critical);
  }
  
  // Effects
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
      currentColor,
      transparent
    );
    opacity: 0.5;
  }
  
  &--pulsing {
    animation: cyber-badge-pulse 2s infinite;
  }
  
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--space-1);
  }
  
  &__text {
    line-height: 1;
    text-transform: uppercase;
  }
}

@keyframes cyber-badge-pulse {
  0% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0.4;
  }
  70% {
    box-shadow: 0 0 0 6px currentColor;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 currentColor;
    opacity: 0;
  }
}
</style>
