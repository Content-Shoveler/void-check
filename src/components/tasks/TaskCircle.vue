<template>
  <div 
    class="task-circle" 
    :class="[`priority-${task.priority}`, { completed: task.completed }]"
    :style="circleStyle"
    @click="$emit('click', task)"
  >
    <div class="task-icon" v-if="showIcon">{{ icon }}</div>
    <div class="task-title" v-if="showTitle">{{ task.title }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '@/data/models/Task';
import { useSettingsStore } from '@/store/settings';

// Props
interface Props {
  task: Task;
  position: {
    x: string;
    y: string;
    size: string;
    distance: number;
  };
}

const props = defineProps<Props>();

// Emits
defineEmits<{
  (e: 'click', task: Task): void;
}>();

const settingsStore = useSettingsStore();

// Computed
const circleStyle = computed(() => {
  return {
    left: props.position.x,
    top: props.position.y,
    width: props.position.size,
    height: props.position.size,
    // Apply animation only if animations are enabled in settings
    animation: settingsStore.areAnimationsEnabled ? 
      `pulse ${2 + props.task.priority * 0.5}s infinite` : 'none',
    // Closer items appear more vivid
    opacity: 0.6 + (1 - props.position.distance) * 0.4,
    // Higher priority tasks have a brighter glow
    boxShadow: props.task.priority > 3 ? 
      `0 0 ${props.task.priority * 3}px var(--color-accent)` : 'none'
  };
});

// Show task icon only for smaller circles (due to space constraints)
const showIcon = computed(() => {
  const sizeInPx = parseInt(props.position.size.replace('px', ''));
  return sizeInPx >= 40;
});

// Show title only for larger circles
const showTitle = computed(() => {
  const sizeInPx = parseInt(props.position.size.replace('px', ''));
  return sizeInPx >= 50;
});

// Icon to display based on task status and priority
const icon = computed(() => {
  if (props.task.completed) return '✓';
  
  if (props.task.priority >= 4) return '!';
  
  // Default icon is the first character of the title
  return props.task.title.charAt(0).toUpperCase();
});
</script>

<style lang="scss" scoped>
.task-circle {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  user-select: none;
  z-index: 1;
  
  // Default styling
  background-color: var(--color-primary);
  color: var(--color-text-primary);
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 10;
  }
  
  // Priority-based styling
  &.priority-1 {
    background-color: var(--color-bg-tertiary);
    opacity: 0.7;
  }
  
  &.priority-2 {
    background-color: var(--color-primary);
    opacity: 0.8;
  }
  
  &.priority-3 {
    background-color: var(--color-primary);
  }
  
  &.priority-4 {
    background-color: var(--color-accent);
  }
  
  &.priority-5 {
    background-color: var(--color-warning);
  }
  
  // Completed task styling
  &.completed {
    background-color: var(--color-success);
    opacity: 0.7;
  }
}

.task-icon {
  font-family: var(--font-family-mono);
  font-weight: bold;
  font-size: 1.25rem;
}

.task-title {
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 4px;
}

// Animation keyframes are global in the main stylesheet
</style>
