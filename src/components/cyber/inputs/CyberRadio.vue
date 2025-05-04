<template>
  <div :class="[
    'cyber-radio',
    { 'cyber-radio--checked': modelValue === value, 'cyber-radio--disabled': disabled }
  ]">
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
  
  &__container {
    position: relative;
    width: 20px;
    height: 20px;
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
      box-shadow: 0 0 5px var(--color-primary);
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
  }
  
  &__inner-circle {
    width: 8px;
    height: 8px;
    background-color: var(--color-primary);
    border-radius: 50%;
    opacity: 0;
    transform: scale(0);
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  
  &__label {
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    transition: color 0.2s ease;
    cursor: pointer;
  }
  
  // Checked state
  &--checked {
    .cyber-radio__circle {
      border-color: var(--color-primary);
      background-color: rgba(var(--color-primary-rgb), 0.1);
      box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.3);
    }
    
    .cyber-radio__inner-circle {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  // Disabled state
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    .cyber-radio__circle,
    .cyber-radio__label {
      cursor: not-allowed;
    }
  }
  
  // Hover effects
  &:not(.cyber-radio--disabled):hover {
    .cyber-radio__circle {
      border-color: var(--color-primary);
      box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.3);
    }
    
    .cyber-radio__label {
      color: var(--color-primary);
    }
  }
}
</style>
