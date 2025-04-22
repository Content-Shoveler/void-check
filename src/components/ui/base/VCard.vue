<template>
  <div 
    class="v-card" 
    :class="[
      `v-card--${variant}`, 
      { 'v-card--hoverable': hoverable, 'v-card--no-padding': noPadding }
    ]"
  >
    <div v-if="$slots.header" class="v-card__header">
      <slot name="header"></slot>
    </div>
    <div class="v-card__content" :class="{'v-card__content--no-padding': contentNoPadding}">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="v-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VCard',
  
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value: string) => ['default', 'outlined', 'elevated', 'flat'].includes(value)
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    contentNoPadding: {
      type: Boolean,
      default: false
    }
  }
});
</script>

<style lang="scss">
.v-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  color: var(--color-text);
  
  // Variants
  &--default {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &--outlined {
    border: 2px solid var(--color-divider);
    box-shadow: none;
  }
  
  &--elevated {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  &--flat {
    box-shadow: none;
  }
  
  // States
  &--hoverable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }
    
    &:active {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    }
  }
  
  &--no-padding {
    .v-card__header,
    .v-card__content,
    .v-card__footer {
      padding: 0;
    }
  }
  
  // Elements
  &__header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-divider);
    font-weight: 600;
  }
  
  &__content {
    padding: 1.5rem;
    
    &--no-padding {
      padding: 0;
    }
  }
  
  &__footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-divider);
  }
  
  // Dark theme adjustments
  :root.dark & {
    &--outlined {
      border-color: var(--color-divider);
    }
  }
  
  // Space theme effects
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
}
</style>
