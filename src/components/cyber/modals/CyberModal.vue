<template>
  <Teleport to="body">
    <Transition name="cyber-modal">
      <div
        v-if="modelValue"
        class="cyber-modal"
        :class="{ 'cyber-modal--fullscreen': fullscreen }"
        @click="handleBackdropClick"
        ref="modalRef"
      >
        <div
          class="cyber-modal__content"
          :class="[
            `cyber-modal__content--${size}`,
            { 'cyber-modal__content--no-padding': noPadding }
          ]"
          @click.stop
          ref="contentRef"
        >
          <div v-if="!hideClose" class="cyber-modal__close" @click="close">
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              class="cyber-modal__close-icon"
            >
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                fill="currentColor"
              />
            </svg>
          </div>
          
          <div v-if="title" class="cyber-modal__header">
            <h2 class="cyber-modal__title">{{ title }}</h2>
          </div>
          
          <div class="cyber-modal__body" :class="{ 'cyber-modal__body--with-title': title }">
            <slot></slot>
          </div>
          
          <div v-if="$slots.footer" class="cyber-modal__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import type { PropType } from 'vue';

type ModalSize = 'small' | 'medium' | 'large' | 'xlarge';

export default defineComponent({
  name: 'CyberModal',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String as PropType<ModalSize>,
      default: 'medium',
      validator: (value: string) => ['small', 'medium', 'large', 'xlarge'].includes(value)
    },
    hideClose: {
      type: Boolean,
      default: false
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    persistent: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue', 'close'],
  
  setup(props, { emit }) {
    const modalRef = ref<HTMLElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    
    // Close the modal
    const close = () => {
      if (props.persistent) return;
      emit('update:modelValue', false);
      emit('close');
    };
    
    // Handle backdrop click
    const handleBackdropClick = () => {
      if (props.closeOnBackdrop) {
        close();
      }
    };
    
    // Handle ESC key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && props.modelValue && !props.persistent) {
        close();
      }
    };
    
    // Lock body scroll when modal is open
    const lockScroll = () => {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    };
    
    // Unlock body scroll when modal is closed
    const unlockScroll = () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
    
    // Focus first focusable element in modal
    const focusFirstElement = () => {
      if (!contentRef.value) return;
      
      const focusableElements = contentRef.value.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    };
    
    // Watch for changes in visibility
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        nextTick(() => {
          lockScroll();
          focusFirstElement();
        });
      } else {
        unlockScroll();
      }
    }, { immediate: true });
    
    // Add event listeners
    onMounted(() => {
      document.addEventListener('keydown', handleKeyDown);
    });
    
    // Remove event listeners
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockScroll();
    });
    
    return {
      modalRef,
      contentRef,
      close,
      handleBackdropClick
    };
  }
});
</script>

<style lang="scss">
.cyber-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  padding: var(--space-4);
  
  &--fullscreen {
    padding: 0;
  }
  
  &__content {
    position: relative;
    background-color: rgba(var(--color-background-card-rgb), 0.95);
    border: var(--border-thin) solid var(--color-primary);
    border-radius: var(--radius-lg);
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(var(--color-primary-rgb), 0.5);
    max-height: 100%;
    display: flex;
    flex-direction: column;
    max-width: 100%;
    overflow: hidden;
    
    // Size variants
    &--small {
      width: 400px;
    }
    
    &--medium {
      width: 600px;
    }
    
    &--large {
      width: 800px;
    }
    
    &--xlarge {
      width: 1000px;
    }
    
    &--no-padding {
      .cyber-modal__body {
        padding: 0;
      }
    }
  }
  
  &--fullscreen &__content {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
  
  &__header {
    padding: var(--space-4) var(--space-4) var(--space-1);
    border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
  }
  
  &__title {
    font-family: var(--font-primary);
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--color-primary);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  &__body {
    flex: 1;
    padding: var(--space-4);
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(var(--color-background-elevated-rgb), 0.5);
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(var(--color-primary-rgb), 0.5);
      border-radius: var(--radius-full);
    }
    
    &--with-title {
      padding-top: var(--space-2);
    }
  }
  
  &__footer {
    padding: var(--space-2) var(--space-4) var(--space-4);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    border-top: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.2);
  }
  
  &__close {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all 0.2s ease;
    z-index: 1;
    
    &:hover {
      color: var(--color-primary);
      transform: rotate(90deg);
    }
  }
  
  &__close-icon {
    width: 20px;
    height: 20px;
  }
  
  // Visible glow effect at the top edge
  &__content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--color-primary),
      transparent
    );
    opacity: 0.8;
  }
}

// Transitions
.cyber-modal-enter-active,
.cyber-modal-leave-active {
  transition: opacity 0.3s ease;
  
  .cyber-modal__content {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
}

.cyber-modal-enter-from,
.cyber-modal-leave-to {
  opacity: 0;
  
  .cyber-modal__content {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>
