<template>
  <div class="cyber-toggle-group">
    <div class="cyber-toggle-group__label" v-if="label">{{ label }}</div>
    <div class="cyber-toggle-group__options">
      <div
        v-for="option in options"
        :key="option.value"
        :class="[
          'cyber-toggle-group__option',
          { 'cyber-toggle-group__option--active': modelValue === option.value }
        ]"
        @click="!disabled && onSelect(option.value)"
      >
        <div class="cyber-toggle-group__button">
          <div class="cyber-toggle-group__indicator"></div>
        </div>
        <span class="cyber-toggle-group__text">{{ option.label }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { ToggleOption } from '../../../types/components';

export default defineComponent({
  name: 'CyberToggleGroup',
  
  props: {
    modelValue: {
      type: String,
      required: true
    },
    options: {
      type: Array as PropType<ToggleOption[]>,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue'],
  
  setup(props, { emit }) {
    const onSelect = (value: string) => {
      emit('update:modelValue', value);
    };
    
    return {
      onSelect
    };
  }
});
</script>

<style lang="scss" scoped>
.cyber-toggle-group {
  width: 100%;
  
  &__label {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  
  &__options {
    display: flex;
    gap: var(--space-2);
    background-color: var(--color-background-elevated);
    border-radius: var(--radius-lg);
    padding: var(--space-1);
    width: fit-content;
  }
  
  &__option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition-base);
    
    &:hover:not(&--active) {
      background-color: rgba(var(--color-primary-rgb), 0.1);
    }
    
    &--active {
      background-color: rgba(var(--color-primary-rgb), 0.2);
      
      .cyber-toggle-group__indicator {
        background-color: var(--color-primary);
        box-shadow: 0 0 8px var(--color-primary);
      }
      
      .cyber-toggle-group__text {
        color: var(--color-primary);
      }
    }
  }
  
  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--color-text-secondary);
  }
  
  &__indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: transparent;
    transition: var(--transition-base);
  }
  
  &__text {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    transition: var(--transition-color);
  }
}
</style>
