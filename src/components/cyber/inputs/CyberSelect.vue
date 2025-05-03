<template>
  <div
    :class="[
      'cyber-select',
      {
        'cyber-select--focused': isFocused,
        'cyber-select--open': isOpen,
        'cyber-select--disabled': disabled,
        [`cyber-select--${status}`]: status
      }
    ]"
    ref="selectRef"
  >
    <label v-if="label" :for="id" class="cyber-select__label">
      {{ label }}
    </label>
    
    <div 
      class="cyber-select__wrapper"
      @click="toggleDropdown"
      ref="triggerRef"
    >
      <div v-if="$slots['icon-left']" class="cyber-select__icon cyber-select__icon--left">
        <slot name="icon-left"></slot>
      </div>
      
      <div class="cyber-select__value">
        <slot name="selected-value" :selected="resolveDisplayValue">
          {{ resolveDisplayValue }}
        </slot>
      </div>
      
      <div class="cyber-select__icon cyber-select__icon--right">
        <svg 
          class="cyber-select__arrow"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M7 10l5 5 5-5z" 
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
    
    <Teleport to="body">
      <Transition name="cyber-select">
        <div 
          v-if="isOpen"
          ref="dropdownRef"
          class="cyber-select__dropdown"
          :style="dropdownStyle"
        >
          <div class="cyber-select__dropdown-content">
            <!-- Search input for searchable select -->
            <div v-if="searchable" class="cyber-select__search">
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                class="cyber-select__search-input"
                :placeholder="searchPlaceholder"
                @click.stop
                @keydown.esc.stop="closeDropdown"
                @keydown.enter.stop="handleEnterKey"
                @keydown.down.stop="focusNextOption"
                @keydown.up.stop="focusPrevOption"
              />
            </div>
            
            <!-- Options list -->
            <div class="cyber-select__options" ref="optionsRef">
              <template v-if="filteredOptions.length > 0">
                <div
                  v-for="(option, index) in filteredOptions"
                  :key="option.value"
                  :class="[
                    'cyber-select__option',
                    {
                      'cyber-select__option--active': isSelected(option.value),
                      'cyber-select__option--focused': focusedIndex === index
                    }
                  ]"
                  tabindex="0"
                  @click.stop="selectOption(option.value)"
                  @keydown.enter.stop="selectOption(option.value)"
                  @keydown.space.stop="selectOption(option.value)"
                  @mouseenter="focusedIndex = index"
                >
                  <slot name="option" :option="option">
                    {{ option.label }}
                  </slot>
                </div>
              </template>
              <div v-else class="cyber-select__no-options">
                {{ noOptionsText }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <div v-if="status && statusMessage" class="cyber-select__status-message">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, onBeforeUnmount, onMounted } from 'vue';
import type { PropType } from 'vue';
import { v4 as uuidv4 } from 'uuid';

type SelectStatus = 'error' | 'success' | 'warning' | '';
type SelectOption = { label: string; value: string | number };

export default defineComponent({
  name: 'CyberSelect',
  
  props: {
    modelValue: {
      type: [String, Number, Boolean, Array, null],
      default: ''
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Select an option'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    status: {
      type: String as PropType<SelectStatus>,
      default: '',
      validator: (value: string) => ['error', 'success', 'warning', ''].includes(value)
    },
    statusMessage: {
      type: String,
      default: ''
    },
    searchable: {
      type: Boolean,
      default: false
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...'
    },
    noOptionsText: {
      type: String,
      default: 'No options available'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: () => `cyber-select-${uuidv4()}`
    }
  },
  
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  
  setup(props, { emit }) {
    const selectRef = ref<HTMLElement | null>(null);
    const triggerRef = ref<HTMLElement | null>(null);
    const dropdownRef = ref<HTMLElement | null>(null);
    const optionsRef = ref<HTMLElement | null>(null);
    const searchInputRef = ref<HTMLInputElement | null>(null);
    const isFocused = ref(false);
    const isOpen = ref(false);
    const searchQuery = ref('');
    const focusedIndex = ref(-1);
    const dropdownStyle = ref<Record<string, string>>({});
    
    // Compute display value
    const resolveDisplayValue = computed(() => {
      if (props.multiple) {
        if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
          const selectedLabels = props.modelValue.map(value => {
            const option = props.options.find(opt => opt.value === value);
            return option ? option.label : '';
          }).filter(Boolean);
          
          return selectedLabels.length > 0 
            ? selectedLabels.join(', ') 
            : props.placeholder;
        }
        return props.placeholder;
      } else {
        const selectedOption = props.options.find(opt => opt.value === props.modelValue);
        return selectedOption ? selectedOption.label : props.placeholder;
      }
    });
    
    // Filter options based on search query
    const filteredOptions = computed(() => {
      if (!searchQuery.value) return props.options;
      
      const query = searchQuery.value.toLowerCase();
      return props.options.filter(option => 
        option.label.toLowerCase().includes(query)
      );
    });
    
    // Check if an option is selected
    const isSelected = (value: string | number) => {
      if (props.multiple && Array.isArray(props.modelValue)) {
        return props.modelValue.some(val => val === value);
      }
      return props.modelValue === value;
    };
    
    // Toggle dropdown
    const toggleDropdown = () => {
      if (props.disabled) return;
      
      if (isOpen.value) {
        closeDropdown();
      } else {
        openDropdown();
      }
    };
    
    // Open dropdown
    const openDropdown = () => {
      if (isOpen.value || props.disabled) return;
      
      isOpen.value = true;
      isFocused.value = true;
      emit('focus');
      
      // Position the dropdown
      nextTick(() => {
        positionDropdown();
        
        // Focus search input if searchable
        if (props.searchable && searchInputRef.value) {
          searchInputRef.value.focus();
        } else {
          focusedIndex.value = 0; // Focus first option
        }
      });
      
      // Add event listeners
      document.addEventListener('click', handleOutsideClick);
      window.addEventListener('resize', positionDropdown);
      window.addEventListener('scroll', positionDropdown);
    };
    
    // Close dropdown
    const closeDropdown = () => {
      if (!isOpen.value) return;
      
      isOpen.value = false;
      searchQuery.value = ''; // Clear search
      focusedIndex.value = -1;
      
      // Remove event listeners
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('resize', positionDropdown);
      window.removeEventListener('scroll', positionDropdown);
    };
    
    // Handle click outside
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        selectRef.value && 
        !selectRef.value.contains(event.target as Node) &&
        dropdownRef.value && 
        !dropdownRef.value.contains(event.target as Node)
      ) {
        closeDropdown();
        isFocused.value = false;
        emit('blur');
      }
    };
    
    // Position dropdown
    const positionDropdown = () => {
      if (!triggerRef.value || !dropdownRef.value) return;
      
      const triggerRect = triggerRef.value.getBoundingClientRect();
      const dropdownHeight = dropdownRef.value.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Check if there's enough space below
      const spaceBelow = windowHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const showBelow = spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove;
      
      dropdownStyle.value = {
        position: 'fixed',
        width: `${triggerRect.width}px`,
        left: `${triggerRect.left}px`,
        zIndex: '9999'
      };
      
      if (showBelow) {
        dropdownStyle.value.top = `${triggerRect.bottom + 5}px`;
        dropdownStyle.value.maxHeight = `${spaceBelow - 10}px`;
      } else {
        dropdownStyle.value.bottom = `${windowHeight - triggerRect.top + 5}px`;
        dropdownStyle.value.maxHeight = `${spaceAbove - 10}px`;
      }
    };
    
    // Select option
    const selectOption = (value: string | number) => {
      if (props.disabled) return;
      
      if (props.multiple && Array.isArray(props.modelValue)) {
        const newValue = [...props.modelValue];
        const index = newValue.indexOf(value);
        
        if (index === -1) {
          newValue.push(value);
        } else {
          newValue.splice(index, 1);
        }
        
        emit('update:modelValue', newValue);
        emit('change', newValue);
      } else {
        emit('update:modelValue', value);
        emit('change', value);
        closeDropdown();
      }
    };
    
    // Keyboard navigation
    const focusNextOption = () => {
      if (filteredOptions.value.length === 0) return;
      
      if (focusedIndex.value < filteredOptions.value.length - 1) {
        focusedIndex.value++;
        scrollToFocusedOption();
      }
    };
    
    const focusPrevOption = () => {
      if (filteredOptions.value.length === 0) return;
      
      if (focusedIndex.value > 0) {
        focusedIndex.value--;
        scrollToFocusedOption();
      }
    };
    
    const scrollToFocusedOption = () => {
      if (!optionsRef.value) return;
      
      const options = optionsRef.value.children;
      if (focusedIndex.value >= 0 && focusedIndex.value < options.length) {
        const focusedOption = options[focusedIndex.value] as HTMLElement;
        if (focusedOption) {
          const containerRect = optionsRef.value.getBoundingClientRect();
          const optionRect = focusedOption.getBoundingClientRect();
          
          if (optionRect.bottom > containerRect.bottom) {
            optionsRef.value.scrollTop += optionRect.bottom - containerRect.bottom;
          } else if (optionRect.top < containerRect.top) {
            optionsRef.value.scrollTop -= containerRect.top - optionRect.top;
          }
        }
      }
    };
    
    const handleEnterKey = () => {
      if (focusedIndex.value >= 0 && focusedIndex.value < filteredOptions.value.length) {
        selectOption(filteredOptions.value[focusedIndex.value].value);
      }
    };
    
    // Reset focus index when filtered options change
    watch(filteredOptions, () => {
      focusedIndex.value = filteredOptions.value.length > 0 ? 0 : -1;
    });
    
    // Clean up
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('resize', positionDropdown);
      window.removeEventListener('scroll', positionDropdown);
    });
    
    return {
      selectRef,
      triggerRef,
      dropdownRef,
      optionsRef,
      searchInputRef,
      isFocused,
      isOpen,
      searchQuery,
      focusedIndex,
      resolveDisplayValue,
      filteredOptions,
      dropdownStyle,
      toggleDropdown,
      openDropdown,
      closeDropdown,
      isSelected,
      selectOption,
      focusNextOption,
      focusPrevOption,
      handleEnterKey
    };
  }
});
</script>

<style lang="scss">
.cyber-select {
  position: relative;
  width: 100%;
  
  &__label {
    display: block;
    font-family: var(--font-primary);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-1);
    transition: color var(--duration-fast) var(--ease-out);
  }
  
  &__wrapper {
    display: flex;
    align-items: center;
    background: var(--color-background-inset);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    transition: var(--transition-base);
    min-height: 40px;
  }
  
  &__value {
    flex: 1;
    font-family: var(--font-secondary);
    font-size: var(--text-base);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    &:empty::before {
      content: attr(data-placeholder);
      color: var(--color-text-disabled);
      opacity: 0.7;
    }
  }
  
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    transition: color var(--duration-fast) var(--ease-out);
    
    &--left {
      margin-right: var(--space-2);
    }
    
    &--right {
      margin-left: var(--space-2);
    }
  }
  
  &__arrow {
    width: 20px;
    height: 20px;
    transition: transform var(--duration-normal) var(--ease-out);
  }
  
  &__dropdown {
    position: fixed;
    background-color: rgba(var(--color-background-card-rgb), 0.95);
    backdrop-filter: blur(10px);
    border: var(--border-thin) solid var(--color-primary);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(var(--color-primary-rgb), 0.3);
    overflow: hidden;
    z-index: var(--z-dropdown);
  }
  
  &__dropdown-content {
    display: flex;
    flex-direction: column;
  }
  
  &__search {
    padding: var(--space-2);
    border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  }
  
  &__search-input {
    width: 100%;
    background-color: rgba(var(--color-background-inset-rgb), 0.7);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    border-radius: var(--radius-md);
    padding: var(--space-1) var(--space-2);
    color: var(--color-text-primary);
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    outline: none;
    
    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.3);
    }
  }
  
  &__options {
    max-height: 250px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(var(--color-background-elevated-rgb), 0.5);
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(var(--color-primary-rgb), 0.5);
      border-radius: var(--radius-full);
    }
  }
  
  &__option {
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-secondary);
    font-size: var(--text-base);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: var(--transition-base);
    display: flex;
    align-items: center;
    
    &--focused {
      background-color: rgba(var(--color-primary-rgb), 0.1);
    }
    
    &--active {
      background-color: rgba(var(--color-primary-rgb), 0.2);
      color: var(--color-primary);
      
      &::after {
        content: "✓";
        margin-left: auto;
        font-size: var(--text-sm);
      }
    }
    
    &:hover {
      background-color: rgba(var(--color-primary-rgb), 0.1);
    }
  }
  
  &__no-options {
    padding: var(--space-3);
    text-align: center;
    color: var(--color-text-secondary);
    font-style: italic;
  }
  
  &__status-message {
    margin-top: var(--space-1);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
  }
  
  // States
  &--focused {
    .cyber-select__wrapper {
      border-color: var(--color-primary);
      box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
    }
    
    .cyber-select__label, 
    .cyber-select__icon {
      color: var(--color-primary);
    }
  }
  
  &--open {
    .cyber-select__arrow {
      transform: rotate(180deg);
    }
  }
  
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    .cyber-select__wrapper {
      cursor: not-allowed;
      background-color: rgba(var(--color-background-inset-rgb), 0.5);
    }
  }
  
  // Status styling
  &--error {
    .cyber-select__wrapper {
      border-color: var(--color-status-error);
    }
    
    .cyber-select__status-message {
      color: var(--color-status-error);
    }
    
    &.cyber-select--focused .cyber-select__wrapper {
      box-shadow: 0 0 8px rgba(var(--color-status-error-rgb), 0.4);
    }
  }
  
  &--success {
    .cyber-select__wrapper {
      border-color: var(--color-status-success);
    }
    
    .cyber-select__status-message {
      color: var(--color-status-success);
    }
    
    &.cyber-select--focused .cyber-select__wrapper {
      box-shadow: 0 0 8px rgba(var(--color-status-success-rgb), 0.4);
    }
  }
  
  &--warning {
    .cyber-select__wrapper {
      border-color: var(--color-status-warning);
    }
    
    .cyber-select__status-message {
      color: var(--color-status-warning);
    }
    
    &.cyber-select--focused .cyber-select__wrapper {
      box-shadow: 0 0 8px rgba(var(--color-status-warning-rgb), 0.4);
    }
  }
}

// Dropdown transition
.cyber-select-enter-active,
.cyber-select-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.cyber-select-enter-from,
.cyber-select-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
