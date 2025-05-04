<template>
  <div :class="[
    'cyber-input',
    { 
      'cyber-input--focused': isFocused,
      'cyber-input--disabled': disabled,
      [`cyber-input--${status}`]: status 
    }
  ]">
    <label 
      v-if="label" 
      :for="id" 
      class="cyber-input__label"
    >
      {{ label }}
    </label>
    
    <div class="cyber-input__wrapper">
      <div v-if="$slots['icon-left']" class="cyber-input__icon cyber-input__icon--left">
        <slot name="icon-left"></slot>
      </div>
      
      <input
        :id="id"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength"
        :required="required"
        class="cyber-input__field"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        v-bind="$attrs"
      />
      
      <div v-if="$slots['icon-right']" class="cyber-input__icon cyber-input__icon--right">
        <slot name="icon-right"></slot>
      </div>
      
      <div v-if="status && statusMessage" class="cyber-input__status-icon">
        <span class="cyber-input__status-dot"></span>
      </div>
    </div>
    
    <div class="cyber-input__bottom">
      <div v-if="status && statusMessage" class="cyber-input__status-message">
        {{ statusMessage }}
      </div>
      
      <div v-if="showCharacterCount" class="cyber-input__character-count">
        {{ modelValue.length }} / {{ maxLength }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { PropType } from 'vue';

type InputStatus = 'error' | 'success' | 'warning' | '';

export default defineComponent({
  name: 'CyberInput',
  
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    status: {
      type: String as PropType<InputStatus>,
      default: '',
      validator: (value: string) => ['error', 'success', 'warning', ''].includes(value)
    },
    statusMessage: {
      type: String,
      default: ''
    },
    maxLength: {
      type: Number,
      default: undefined
    },
    showCharacterCount: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: () => `cyber-input-${uuidv4()}`
    }
  },
  
  emits: ['update:modelValue', 'input', 'change', 'focus', 'blur'],
  
  setup(props, { emit }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const isFocused = ref(false);
    
    const onInput = (event: Event) => {
      const value = (event.target as HTMLInputElement).value;
      emit('update:modelValue', value);
      emit('input', event);
    };
    
    return {
      inputRef,
      isFocused,
      onInput
    };
  },
  
  inheritAttrs: false
});
</script>

<style lang="scss">
.cyber-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
  
  &__label {
    font-family: var(--font-primary);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-1);
    transition: color var(--duration-fast) var(--ease-out);
  }
  
  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--color-background-inset);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    border-radius: var(--radius-md);
    transition: var(--transition-base);
    overflow: hidden;
  }
  
  &__field {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-secondary);
    font-size: var(--text-base);
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    outline: none;
    
    &::placeholder {
      color: var(--color-text-disabled);
      opacity: 0.7;
    }
  }
  
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--space-2);
    color: var(--color-text-secondary);
    transition: color var(--duration-fast) var(--ease-out);
    
    &--left {
      padding-right: 0;
    }
    
    &--right {
      padding-left: 0;
    }
  }
  
  &__bottom {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-xs);
    min-height: 1.2em;
  }
  
  &__status-message {
    color: var(--color-text-secondary);
    transition: color var(--duration-fast) var(--ease-out);
  }
  
  &__character-count {
    margin-left: auto;
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
  
  &__status-icon {
    display: flex;
    align-items: center;
    padding: 0 var(--space-3);
  }
  
  &__status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
  }
  
  // States
  &--focused {
    .cyber-input__wrapper {
      border-color: var(--color-primary);
      box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
    }
    
    .cyber-input__label {
      color: var(--color-primary);
    }
    
    .cyber-input__icon {
      color: var(--color-primary);
    }
  }
  
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    .cyber-input__field {
      cursor: not-allowed;
    }
  }
  
  // Status styling
  &--error {
    .cyber-input__wrapper {
      border-color: var(--color-status-error);
    }
    
    .cyber-input__status-message {
      color: var(--color-status-error);
    }
    
    .cyber-input__status-dot {
      background-color: var(--color-status-error);
    }
    
    &.cyber-input--focused .cyber-input__wrapper {
      box-shadow: 0 0 8px rgba(var(--color-status-error-rgb), 0.4);
    }
  }
  
  &--success {
    .cyber-input__wrapper {
      border-color: var(--color-status-success);
    }
    
    .cyber-input__status-message {
      color: var(--color-status-success);
    }
    
    .cyber-input__status-dot {
      background-color: var(--color-status-success);
    }
    
    &.cyber-input--focused .cyber-input__wrapper {
      box-shadow: 0 0 8px rgba(var(--color-status-success-rgb), 0.4);
    }
  }
  
  &--warning {
    .cyber-input__wrapper {
      border-color: var(--color-status-warning);
    }
    
    .cyber-input__status-message {
      color: var(--color-status-warning);
    }
    
    .cyber-input__status-dot {
      background-color: var(--color-status-warning);
    }
    
    &.cyber-input--focused .cyber-input__wrapper {
      box-shadow: 0 0 8px rgba(var(--color-status-warning-rgb), 0.4);
    }
  }
}
</style>
