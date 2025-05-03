<template>
  <transition 
    :name="transitionName" 
    :mode="mode" 
    :appear="appear"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot></slot>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingsStore } from '../../store/modules/settings';
import type { PropType } from 'vue';

// Transition types
type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'none';
type TransitionMode = 'in-out' | 'out-in' | 'default' | undefined;

export default defineComponent({
  name: 'PageTransition',
  
  props: {
    // Default transition type
    type: {
      type: String as PropType<TransitionType>,
      default: 'fade'
    },
    // Transition mode (in-out, out-in)
    mode: {
      type: String as PropType<TransitionMode>,
      default: 'out-in'
    },
    // Whether to animate on initial appear
    appear: {
      type: Boolean,
      default: true
    },
    // Global toggle to enable/disable all transitions
    disabled: {
      type: Boolean,
      default: false
    },
    // Optional CSS class to add to the transitioning element
    customClass: {
      type: String,
      default: ''
    }
  },
  
  setup(props, { emit }) {
    const route = useRoute();
    const settingsStore = useSettingsStore();
    const transitionName = ref<string>('');
    
    // Determine if transitions should be disabled due to user preferences
    const shouldDisableTransitions = () => {
      const performanceMode = settingsStore.isPerformanceMode;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      return props.disabled || performanceMode || prefersReducedMotion;
    };
    
    // Set transition name based on props and conditions
    const updateTransitionName = () => {
      if (shouldDisableTransitions()) {
        transitionName.value = 'none';
      } else {
        transitionName.value = `page-${props.type}`;
      }
    };
    
    // Set initial transition name
    updateTransitionName();
    
    // Watch for changes in props or relevant settings
    watch(() => [props.type, props.disabled, settingsStore.settings.visualEffects.performanceMode], 
      () => {
        updateTransitionName();
      }
    );
    
    // Transition event handlers
    const beforeEnter = (el: Element) => {
      if (props.customClass) {
        el.classList.add(props.customClass);
      }
      emit('before-enter', el);
    };
    
    const enter = (el: Element, done: () => void) => {
      emit('enter', el, done);
    };
    
    const afterEnter = (el: Element) => {
      if (props.customClass) {
        el.classList.remove(props.customClass);
      }
      emit('after-enter', el);
    };
    
    const beforeLeave = (el: Element) => {
      if (props.customClass) {
        el.classList.add(props.customClass);
      }
      emit('before-leave', el);
    };
    
    const leave = (el: Element, done: () => void) => {
      emit('leave', el, done);
    };
    
    const afterLeave = (el: Element) => {
      if (props.customClass) {
        el.classList.remove(props.customClass);
      }
      emit('after-leave', el);
    };
    
    return {
      transitionName,
      beforeEnter,
      enter,
      afterEnter,
      beforeLeave,
      leave,
      afterLeave
    };
  }
});
</script>

<style lang="scss">
// Fade transition
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

// Slide Left transition
.page-slide-left-enter-active,
.page-slide-left-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.page-slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.page-slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

// Slide Right transition
.page-slide-right-enter-active,
.page-slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.page-slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.page-slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

// Slide Up transition
.page-slide-up-enter-active,
.page-slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.page-slide-up-enter-from {
  transform: translateY(30px);
  opacity: 0;
}

.page-slide-up-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

// Slide Down transition
.page-slide-down-enter-active,
.page-slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.page-slide-down-enter-from {
  transform: translateY(-30px);
  opacity: 0;
}

.page-slide-down-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

// No transition (for reduced motion or performance mode)
.page-none-enter-active,
.page-none-leave-active {
  transition: none;
}

.page-none-enter-from,
.page-none-leave-to {
  opacity: 1;
}
</style>
