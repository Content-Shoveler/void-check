<template>
  <div class="cyber-tooltip">
    <div 
      ref="triggerRef" 
      class="cyber-tooltip__trigger"
      @mouseenter="isVisible = true"
      @mouseleave="isVisible = false"
      @focus="isVisible = true"
      @blur="isVisible = false"
    >
      <slot></slot>
    </div>
    
    <Teleport to="body">
      <Transition name="cyber-tooltip">
        <div
          v-if="isVisible"
          ref="contentRef"
          :class="[
            'cyber-tooltip__content',
            `cyber-tooltip__content--${position}`,
            { 'cyber-tooltip__content--with-arrow': withArrow }
          ]"
          :style="tooltipStyle"
        >
          <div v-if="withArrow" :class="`cyber-tooltip__arrow cyber-tooltip__arrow--${position}`"></div>
          <slot name="content">{{ content }}</slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { PropType } from 'vue';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export default defineComponent({
  name: 'CyberTooltip',
  
  props: {
    content: {
      type: String,
      default: ''
    },
    position: {
      type: String as PropType<TooltipPosition>,
      default: 'top',
      validator: (value: string) => ['top', 'right', 'bottom', 'left'].includes(value)
    },
    withArrow: {
      type: Boolean,
      default: true
    },
    offset: {
      type: Number,
      default: 8
    }
  },
  
  setup(props) {
    const isVisible = ref(false);
    const triggerRef = ref<HTMLElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    const tooltipStyle = ref<Record<string, string>>({});
    
    const calculatePosition = () => {
      if (!triggerRef.value || !contentRef.value) return;
      
      const triggerRect = triggerRef.value.getBoundingClientRect();
      const tooltipRect = contentRef.value.getBoundingClientRect();
      const { position, offset } = props;
      
      const positions = {
        top: {
          top: `${triggerRect.top - tooltipRect.height - offset}px`,
          left: `${triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`
        },
        right: {
          top: `${triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)}px`,
          left: `${triggerRect.right + offset}px`
        },
        bottom: {
          top: `${triggerRect.bottom + offset}px`,
          left: `${triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`
        },
        left: {
          top: `${triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)}px`,
          left: `${triggerRect.left - tooltipRect.width - offset}px`
        }
      };
      
      tooltipStyle.value = {
        ...positions[position],
        position: 'fixed',
        zIndex: '9999'
      };
    };
    
    watch(isVisible, (value) => {
      if (value) {
        nextTick(calculatePosition);
      }
    });
    
    // Handle window resize
    const onResize = () => {
      if (isVisible.value) {
        calculatePosition();
      }
    };
    
    onMounted(() => {
      window.addEventListener('resize', onResize);
      window.addEventListener('scroll', onResize, true);
    });
    
    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    });
    
    return {
      isVisible,
      triggerRef,
      contentRef,
      tooltipStyle
    };
  }
});
</script>

<style lang="scss">
.cyber-tooltip {
  display: inline-block;
  position: relative;
  
  &__trigger {
    display: inline-block;
  }
  
  &__content {
    position: absolute;
    z-index: var(--z-tooltip);
    max-width: 280px;
    padding: var(--space-2) var(--space-3);
    background-color: rgba(var(--color-background-card-rgb), 0.85);
    backdrop-filter: blur(8px);
    border: var(--border-thin) solid var(--color-primary);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    font-family: var(--font-secondary);
    font-size: var(--text-sm);
    box-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.3);
    text-align: center;
    pointer-events: none;
    
    &--with-arrow {
      margin: 6px;
    }
  }
  
  &__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: rgba(var(--color-background-card-rgb), 0.85);
    border-style: solid;
    border-color: var(--color-primary);
    transform: rotate(45deg);
    
    &--top {
      border-width: 0 1px 1px 0;
      bottom: -4px;
      left: calc(50% - 4px);
    }
    
    &--right {
      border-width: 0 0 1px 1px;
      left: -4px;
      top: calc(50% - 4px);
    }
    
    &--bottom {
      border-width: 1px 0 0 1px;
      top: -4px;
      left: calc(50% - 4px);
    }
    
    &--left {
      border-width: 1px 1px 0 0;
      right: -4px;
      top: calc(50% - 4px);
    }
  }
}

// Transition
.cyber-tooltip-enter-active,
.cyber-tooltip-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.cyber-tooltip-enter-from,
.cyber-tooltip-leave-to {
  opacity: 0;
}

.cyber-tooltip__content--top.cyber-tooltip-enter-from,
.cyber-tooltip__content--top.cyber-tooltip-leave-to {
  transform: translateY(5px);
}

.cyber-tooltip__content--right.cyber-tooltip-enter-from,
.cyber-tooltip__content--right.cyber-tooltip-leave-to {
  transform: translateX(-5px);
}

.cyber-tooltip__content--bottom.cyber-tooltip-enter-from,
.cyber-tooltip__content--bottom.cyber-tooltip-leave-to {
  transform: translateY(-5px);
}

.cyber-tooltip__content--left.cyber-tooltip-enter-from,
.cyber-tooltip__content--left.cyber-tooltip-leave-to {
  transform: translateX(5px);
}
</style>
