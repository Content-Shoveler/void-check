<template>
  <div 
    class="cyber-accordion-item" 
    :class="{ 'cyber-accordion-item--expanded': isExpanded }"
  >
    <div 
      class="cyber-accordion-item__header" 
      @click="toggle"
      :class="{ 'cyber-accordion-item__header--expanded': isExpanded }"
    >
      <h2 class="cyber-accordion-item__title">{{ title }}</h2>
      <div class="cyber-accordion-item__icon">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          class="cyber-accordion-item__chevron"
        >
          <path d="M12 15.5l-6-6 1.5-1.5L12 12.5l4.5-4.5L18 9.5l-6 6z" />
        </svg>
      </div>
    </div>
    <div class="cyber-accordion-item__content-wrapper">
      <div class="cyber-accordion-item__content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, computed, ref, onMounted } from 'vue';

interface AccordionContext {
  toggleItem: (index: number) => void;
  isExpanded: (index: number) => boolean;
  multiple: boolean;
}

export default defineComponent({
  name: 'CyberAccordionItem',
  
  props: {
    title: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  
  setup(props) {
    const accordion = inject<AccordionContext>('accordion');
    
    if (!accordion) {
      console.error('CyberAccordionItem must be used within a CyberAccordion');
      return { 
        isExpanded: ref(false),
        toggle: () => {}
      };
    }
    
    // Determine if this item is expanded
    const isExpanded = computed(() => accordion.isExpanded(props.index));
    
    // Toggle this item's expanded state
    const toggle = () => {
      accordion.toggleItem(props.index);
    };
    
    // Item content height for animation
    const contentHeight = ref<number>(0);
    const contentEl = ref<HTMLElement | null>(null);
    
    onMounted(() => {
      // Set initial height
      if (isExpanded.value) {
        contentHeight.value = contentEl.value?.scrollHeight || 0;
      }
    });
    
    return {
      isExpanded,
      toggle,
      contentHeight,
      contentEl
    };
  }
});
</script>

<style lang="scss">
.cyber-accordion-item {
  background-color: rgba(var(--color-background-card-rgb), 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
  
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
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &--expanded {
    border-color: var(--color-primary);
    box-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.3);
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 15%;
      right: 15%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(var(--color-primary-rgb), 0.5),
        transparent
      );
    }
  }
  
  &__header {
    padding: var(--space-4);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    transition: var(--transition-base);
    position: relative;
    z-index: 1;
    
    &:hover {
      background-color: rgba(var(--color-primary-rgb), 0.05);
    }
    
    &--expanded {
      border-bottom: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.1);
    }
  }
  
  &__title {
    margin: 0;
    color: var(--color-primary);
    font-size: var(--text-xl);
    font-weight: var(--font-medium);
    transition: var(--transition-base);
    text-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.5);
  }
  
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.5);
    border-radius: 4px;
    transition: var(--transition-base);
    
    .cyber-accordion-item--expanded & {
      background-color: rgba(var(--color-primary-rgb), 0.2);
      box-shadow: 0 0 5px rgba(var(--color-primary-rgb), 0.5);
    }
  }
  
  &__chevron {
    fill: var(--color-primary);
    transition: transform 0.3s ease;
    
    .cyber-accordion-item--expanded & {
      transform: rotate(180deg);
    }
  }
  
  &__content-wrapper {
    overflow: hidden;
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 0;
    
    .cyber-accordion-item--expanded & {
      max-height: 3000px; // Large arbitrary value - will be limited by content
    }
  }
  
  &__content {
    padding: var(--space-5);
    padding-top: var(--space-4);
  }
}
</style>
