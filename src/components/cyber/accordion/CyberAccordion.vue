<template>
  <div class="cyber-accordion">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, ref } from 'vue';

export default defineComponent({
  name: 'CyberAccordion',
  
  props: {
    // Allow multiple open sections at once
    multiple: {
      type: Boolean,
      default: false
    },
    // Default expanded item index (-1 means all collapsed)
    defaultExpanded: {
      type: Number,
      default: -1
    }
  },
  
  setup(props) {
    // Track which item is currently expanded (for single mode)
    const activeItem = ref(props.defaultExpanded);
    
    // Track all expanded items (for multiple mode)
    const expandedItems = ref<number[]>(
      props.defaultExpanded >= 0 ? [props.defaultExpanded] : []
    );
    
    // Handle item toggle
    const toggleItem = (itemIndex: number) => {
      if (props.multiple) {
        const index = expandedItems.value.indexOf(itemIndex);
        if (index === -1) {
          expandedItems.value.push(itemIndex);
        } else {
          expandedItems.value.splice(index, 1);
        }
      } else {
        activeItem.value = activeItem.value === itemIndex ? -1 : itemIndex;
      }
    };
    
    // Check if an item is expanded
    const isExpanded = (itemIndex: number) => {
      if (props.multiple) {
        return expandedItems.value.includes(itemIndex);
      } else {
        return activeItem.value === itemIndex;
      }
    };
    
    // Provide values to child components
    provide('accordion', {
      toggleItem,
      isExpanded,
      multiple: props.multiple
    });
    
    return {
      activeItem,
      expandedItems
    };
  }
});
</script>

<style lang="scss">
.cyber-accordion {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}
</style>
