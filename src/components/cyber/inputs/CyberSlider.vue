<template>
  <div 
    :class="[
      'cyber-slider',
      `cyber-slider--${variant}`,
      { 'cyber-slider--disabled': disabled }
    ]"
  >
    <div v-if="label" class="cyber-slider__label">{{ label }}</div>
    
    <div 
      ref="trackRef"
      class="cyber-slider__track"
      @mousedown="onTrackMouseDown"
      @touchstart="onTrackTouchStart"
    >
      <div class="cyber-slider__track-inner">
        <div 
          class="cyber-slider__progress" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
        
        <div 
          v-for="mark in marks"
          :key="`mark-${mark.value}`"
          :class="[
            'cyber-slider__mark',
            { 'cyber-slider__mark--active': modelValue >= mark.value }
          ]"
          :style="{ left: `${getPositionFromValue(mark.value)}%` }"
          :title="mark.label"
        >
          <div v-if="showMarkLabels" class="cyber-slider__mark-label">{{ mark.label }}</div>
        </div>
      </div>
      
      <div 
        ref="thumbRef"
        class="cyber-slider__thumb"
        :style="{ left: `${progressPercentage}%` }"
        @mousedown="onThumbMouseDown"
        @touchstart="onThumbTouchStart"
      ></div>
    </div>
    
    <div v-if="showTooltip && isDragging" class="cyber-slider__tooltip" :style="tooltipStyle">
      {{ formatValue(modelValue) }}
    </div>
    
    <div v-if="showMinMax" class="cyber-slider__min-max">
      <div class="cyber-slider__min">{{ formatValue(min) }}</div>
      <div class="cyber-slider__max">{{ formatValue(max) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onBeforeUnmount } from 'vue';
import type { PropType } from 'vue';

type SliderVariant = 'primary' | 'secondary' | 'accent';
type SliderMark = { value: number; label: string };
type ScaleType = 'linear' | 'logarithmic';

export default defineComponent({
  name: 'CyberSlider',
  
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    },
    label: {
      type: String,
      default: ''
    },
    variant: {
      type: String as PropType<SliderVariant>,
      default: 'primary',
      validator: (value: string) => ['primary', 'secondary', 'accent'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    showMinMax: {
      type: Boolean,
      default: false
    },
    marks: {
      type: Array as PropType<SliderMark[]>,
      default: () => []
    },
    showMarkLabels: {
      type: Boolean,
      default: false
    },
    scale: {
      type: String as PropType<ScaleType>,
      default: 'linear',
      validator: (value: string) => ['linear', 'logarithmic'].includes(value)
    },
    formatFn: {
      type: Function as PropType<(value: number) => string>,
      default: (value: number) => value.toString()
    }
  },
  
  emits: ['update:modelValue', 'change'],
  
  setup(props, { emit }) {
    const trackRef = ref<HTMLElement | null>(null);
    const thumbRef = ref<HTMLElement | null>(null);
    const isDragging = ref(false);
    const tooltipStyle = ref<Record<string, string>>({});
    
    // Convert between scale types
    const fromScaleToLinear = (value: number): number => {
      if (props.scale === 'linear') return value;
      
      // Prevent log(0)
      const minValue = Math.max(props.min, 0.0001);
      
      // Logarithmic conversion
      const logMin = Math.log(minValue);
      const logMax = Math.log(props.max);
      const scale = (logMax - logMin) / (props.max - props.min);
      
      return (Math.log(value) - logMin) / scale + props.min;
    };
    
    const fromLinearToScale = (value: number): number => {
      if (props.scale === 'linear') return value;
      
      // Prevent log(0)
      const minValue = Math.max(props.min, 0.0001);
      
      // Logarithmic conversion
      const logMin = Math.log(minValue);
      const logMax = Math.log(props.max);
      const scale = (logMax - logMin) / (props.max - props.min);
      
      return Math.exp(logMin + scale * (value - props.min));
    };
    
    // Compute percentage for positioning
    const progressPercentage = computed(() => {
      const linearValue = fromScaleToLinear(props.modelValue);
      const totalRange = props.max - props.min;
      return ((linearValue - props.min) / totalRange) * 100;
    });
    
    // Get position from value
    const getPositionFromValue = (value: number): number => {
      const linearValue = fromScaleToLinear(value);
      const totalRange = props.max - props.min;
      return ((linearValue - props.min) / totalRange) * 100;
    };
    
    // Value formatting function
    const formatValue = (value: number): string => {
      return props.formatFn(value);
    };
    
    // Calculate value from position
    const getValueFromPosition = (position: number): number => {
      const trackWidth = trackRef.value?.clientWidth || 1;
      const percentage = Math.min(Math.max(position / trackWidth, 0), 1);
      
      // Convert to the scale range
      const linearValue = props.min + (props.max - props.min) * percentage;
      
      // Apply step
      const steppedLinearValue = Math.round(linearValue / props.step) * props.step;
      
      // Convert back to the original scale if needed
      return fromLinearToScale(steppedLinearValue);
    };
    
    // Update tooltip position
    const updateTooltipPosition = () => {
      if (!thumbRef.value) return;
      
      const thumbRect = thumbRef.value.getBoundingClientRect();
      tooltipStyle.value = {
        left: `${thumbRect.left + thumbRect.width / 2}px`,
        top: `${thumbRect.top - 30}px`
      };
    };
    
    // Handle value update
    const updateValue = (position: number) => {
      if (props.disabled) return;
      
      const newValue = getValueFromPosition(position);
      emit('update:modelValue', newValue);
    };
    
    // Mouse/touch event handlers
    const onTrackMouseDown = (event: MouseEvent) => {
      if (props.disabled) return;
      const rect = trackRef.value?.getBoundingClientRect();
      if (!rect) return;
      
      const position = event.clientX - rect.left;
      updateValue(position);
      isDragging.value = true;
      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('mouseup', onDocumentMouseUp);
    };
    
    const onTrackTouchStart = (event: TouchEvent) => {
      if (props.disabled) return;
      const rect = trackRef.value?.getBoundingClientRect();
      if (!rect || !event.touches[0]) return;
      
      const position = event.touches[0].clientX - rect.left;
      updateValue(position);
      isDragging.value = true;
      document.addEventListener('touchmove', onDocumentTouchMove);
      document.addEventListener('touchend', onDocumentTouchEnd);
    };
    
    const onThumbMouseDown = (event: MouseEvent) => {
      if (props.disabled) return;
      isDragging.value = true;
      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('mouseup', onDocumentMouseUp);
      event.preventDefault(); // Prevent text selection
    };
    
    const onThumbTouchStart = (event: TouchEvent) => {
      if (props.disabled) return;
      isDragging.value = true;
      document.addEventListener('touchmove', onDocumentTouchMove);
      document.addEventListener('touchend', onDocumentTouchEnd);
      event.preventDefault(); // Prevent scrolling
    };
    
    const onDocumentMouseMove = (event: MouseEvent) => {
      if (!isDragging.value) return;
      
      const rect = trackRef.value?.getBoundingClientRect();
      if (!rect) return;
      
      const position = event.clientX - rect.left;
      updateValue(position);
      updateTooltipPosition();
    };
    
    const onDocumentTouchMove = (event: TouchEvent) => {
      if (!isDragging.value || !event.touches[0]) return;
      
      const rect = trackRef.value?.getBoundingClientRect();
      if (!rect) return;
      
      const position = event.touches[0].clientX - rect.left;
      updateValue(position);
      updateTooltipPosition();
    };
    
    const onDocumentMouseUp = () => {
      if (isDragging.value) {
        emit('change', props.modelValue);
        isDragging.value = false;
      }
      
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('mouseup', onDocumentMouseUp);
    };
    
    const onDocumentTouchEnd = () => {
      if (isDragging.value) {
        emit('change', props.modelValue);
        isDragging.value = false;
      }
      
      document.removeEventListener('touchmove', onDocumentTouchMove);
      document.removeEventListener('touchend', onDocumentTouchEnd);
    };
    
    // Watch for drag state changes to update tooltip
    watch(isDragging, (newValue) => {
      if (newValue && props.showTooltip) {
        updateTooltipPosition();
      }
    });
    
    // Clean up event listeners
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('mouseup', onDocumentMouseUp);
      document.removeEventListener('touchmove', onDocumentTouchMove);
      document.removeEventListener('touchend', onDocumentTouchEnd);
    });
    
    return {
      trackRef,
      thumbRef,
      isDragging,
      tooltipStyle,
      progressPercentage,
      getPositionFromValue,
      formatValue,
      onTrackMouseDown,
      onTrackTouchStart,
      onThumbMouseDown,
      onThumbTouchStart
    };
  }
});
</script>

<style lang="scss">
.cyber-slider {
  position: relative;
  width: 100%;
  padding: var(--space-2) 0;
  
  &__label {
    font-family: var(--font-primary);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-1);
  }
  
  &__track {
    position: relative;
    height: 8px;
    background-color: rgba(var(--color-background-inset-rgb), 0.7);
    border-radius: var(--radius-full);
    border: var(--border-thin) solid rgba(var(--color-primary-rgb), 0.3);
    cursor: pointer;
    overflow: hidden;
  }
  
  &__track-inner {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  &__progress {
    position: absolute;
    height: 100%;
    background: linear-gradient(
      to right,
      var(--color-primary) 0%,
      rgba(var(--color-primary-rgb), 0.8) 100%
    );
    border-radius: var(--radius-full);
    box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
    z-index: 1;
  }
  
  &__thumb {
    position: absolute;
    width: 16px;
    height: 16px;
    background-color: var(--color-primary);
    border-radius: 50%;
    border: var(--border-thin) solid var(--color-text-primary);
    box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.5);
    transform: translate(-50%, -50%);
    top: 50%;
    z-index: 2;
    cursor: grab;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover, &:active {
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow: 0 0 12px rgba(var(--color-primary-rgb), 0.7);
    }
    
    &:active {
      cursor: grabbing;
    }
  }
  
  &__tooltip {
    position: fixed;
    background-color: rgba(var(--color-background-card-rgb), 0.9);
    border: var(--border-thin) solid var(--color-primary);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    transform: translate(-50%, -100%);
    pointer-events: none;
    z-index: var(--z-tooltip);
    box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 8px;
      height: 8px;
      background-color: rgba(var(--color-background-card-rgb), 0.9);
      border-right: var(--border-thin) solid var(--color-primary);
      border-bottom: var(--border-thin) solid var(--color-primary);
    }
  }
  
  &__min-max {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
  }
  
  &__mark {
    position: absolute;
    width: 4px;
    height: 4px;
    background-color: rgba(var(--color-text-secondary-rgb), 0.5);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    top: 50%;
    z-index: 0;
    
    &--active {
      background-color: var(--color-text-primary);
    }
    
    &-label {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
  }
  
  // Variants
  &--secondary {
    .cyber-slider__progress {
      background: linear-gradient(
        to right,
        var(--color-secondary) 0%,
        rgba(var(--color-secondary-rgb), 0.8) 100%
      );
      box-shadow: 0 0 8px rgba(var(--color-secondary-rgb), 0.3);
    }
    
    .cyber-slider__thumb {
      background-color: var(--color-secondary);
      box-shadow: 0 0 8px rgba(var(--color-secondary-rgb), 0.5);
      
      &:hover, &:active {
        box-shadow: 0 0 12px rgba(var(--color-secondary-rgb), 0.7);
      }
    }
    
    .cyber-slider__tooltip {
      border-color: var(--color-secondary);
      box-shadow: 0 0 8px rgba(var(--color-secondary-rgb), 0.3);
      
      &::after {
        border-right-color: var(--color-secondary);
        border-bottom-color: var(--color-secondary);
      }
    }
  }
  
  &--accent {
    .cyber-slider__progress {
      background: linear-gradient(
        to right,
        var(--color-accent) 0%,
        rgba(var(--color-accent-rgb), 0.8) 100%
      );
      box-shadow: 0 0 8px rgba(var(--color-accent-rgb), 0.3);
    }
    
    .cyber-slider__thumb {
      background-color: var(--color-accent);
      box-shadow: 0 0 8px rgba(var(--color-accent-rgb), 0.5);
      
      &:hover, &:active {
        box-shadow: 0 0 12px rgba(var(--color-accent-rgb), 0.7);
      }
    }
    
    .cyber-slider__tooltip {
      border-color: var(--color-accent);
      box-shadow: 0 0 8px rgba(var(--color-accent-rgb), 0.3);
      
      &::after {
        border-right-color: var(--color-accent);
        border-bottom-color: var(--color-accent);
      }
    }
  }
  
  // Disabled state
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    .cyber-slider__track,
    .cyber-slider__thumb {
      cursor: not-allowed;
    }
    
    .cyber-slider__thumb {
      &:hover, &:active {
        transform: translate(-50%, -50%);
        box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
      }
    }
  }
}
</style>
