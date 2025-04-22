<template>
  <div class="home-container">
    <div class="timeline-header">
      <h1 class="title">Visual Timeline</h1>
      <div class="scale-indicator">
        <span class="scale-label">Time Scale:</span>
        <span class="scale-value">{{ currentScale.name }}</span>
        <div class="scale-controls">
          <button 
            class="scale-btn" 
            @click="zoomIn" 
            title="Zoom in (shorter timeframe)"
          >
            <span class="icon">-</span>
          </button>
          <button 
            class="scale-btn" 
            @click="zoomOut" 
            title="Zoom out (longer timeframe)"
          >
            <span class="icon">+</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="task-visualization" ref="visualizationRef">
      <div class="timeline-grid" v-if="settingsStore.areGridLinesVisible">
        <!-- Grid circles representing time -->
        <div 
          v-for="(circle, index) in gridCircles" 
          :key="`grid-circle-${index}`"
          class="grid-circle"
          :style="{ 
            width: `${circle.size}px`, 
            height: `${circle.size}px`, 
            opacity: circle.opacity
          }"
        ></div>
      </div>
      
      <!-- Center point -->
      <div class="center-point">
        <span class="center-text">NOW</span>
      </div>
      
      <!-- Task circles -->
      <TaskCircle
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :position="calculatePosition(task)"
        @click="openTaskDetails(task)"
      />
      
      <!-- Empty state -->
      <div v-if="tasks.length === 0" class="empty-state">
        <div class="empty-state-icon">🚀</div>
        <h3 class="empty-state-title">No Tasks in This Time Range</h3>
        <p class="empty-state-message">
          Create your first task or adjust the time scale to see tasks from a different period.
        </p>
        <button class="create-task-btn" @click="createNewTask">
          Create Task
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/store/task';
import { useTimeScaleStore } from '@/store/timeScale';
import { useSettingsStore } from '@/store/settings';
import { calculateTimePosition } from '@/data/models/TimeScale';
import TaskCircle from '@/components/tasks/TaskCircle.vue';
import type { Task } from '@/data/models/Task';

// Store access
const taskStore = useTaskStore();
const timeScaleStore = useTimeScaleStore();
const settingsStore = useSettingsStore();
const router = useRouter();

// Refs
const visualizationRef = ref<HTMLElement | null>(null);

// Computed properties
const tasks = computed(() => taskStore.allTasks);
const currentScale = computed(() => timeScaleStore.currentScale);

// State for visualization
const gridCircles = reactive(Array.from({ length: 5 }, (_, i) => ({
  size: 500 - i * 100,
  opacity: 0.1 - i * 0.015
})));

// Function to calculate position in the visualization
const calculatePosition = (task: Task) => {
  const position = calculateTimePosition(task.dueDate, currentScale.value);
  
  // Calculate the radius from the center (ranges from 0 to 1)
  const radius = position * 0.9; // Max at 90% of container
  
  // Calculate angle in radians (random but consistent for the same task)
  // We use the task id to ensure the angle doesn't change between renders
  const angle = parseInt(task.id.substring(0, 8), 16) % 360 * (Math.PI / 180);
  
  // Center of the container
  const centerX = 50; // percent
  const centerY = 50; // percent
  
  // Convert polar coordinates to cartesian
  const x = centerX + radius * Math.cos(angle) * 100;
  const y = centerY + radius * Math.sin(angle) * 100;
  
  // Scale size based on priority (range from 30px to 60px)
  const size = 30 + (task.priority * 6);
  
  return {
    x: `${x}%`,
    y: `${y}%`,
    size: `${size}px`,
    distance: radius
  };
};

// Methods
const openTaskDetails = (task: Task) => {
  taskStore.setActiveTask(task.id);
  router.push({ name: 'task-detail', params: { id: task.id } });
};

const createNewTask = () => {
  taskStore.setActiveTask(null);
  router.push({ name: 'tasks' });
};

const zoomIn = () => {
  timeScaleStore.zoomIn();
};

const zoomOut = () => {
  timeScaleStore.zoomOut();
};

// Fetch tasks on mount
onMounted(async () => {
  await taskStore.fetchAllTasks();
});

// Watch for time scale changes to update visualization
watch(currentScale, () => {
  // This will trigger a re-render of the task circles with new positions
});
</script>

<style lang="scss" scoped>
.home-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.title {
  font-family: var(--font-family-mono);
  color: var(--color-text-primary);
  margin: 0;
}

.scale-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  
  .scale-label {
    font-family: var(--font-family-mono);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  
  .scale-value {
    font-family: var(--font-family-mono);
    color: var(--color-accent);
    font-weight: bold;
    font-size: 0.875rem;
  }
  
  .scale-controls {
    display: flex;
    gap: var(--space-xs);
    margin-left: var(--space-xs);
  }
  
  .scale-btn {
    background: none;
    border: 1px solid var(--color-text-secondary);
    color: var(--color-text-secondary);
    width: 24px;
    height: 24px;
    border-radius: var(--border-radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover, &:focus {
      background-color: var(--color-accent);
      border-color: var(--color-accent);
      color: var(--color-text-primary);
    }
  }
}

.task-visualization {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-lg);
  background-color: var(--color-bg-secondary);
  height: calc(100vh - 200px);
  min-height: 400px;
}

.timeline-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--color-text-secondary);
  background: transparent;
}

.center-point {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(57, 208, 208, 0.3);
  z-index: 2;
  
  .center-text {
    font-family: var(--font-family-mono);
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--color-accent);
  }
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  max-width: 400px;
  z-index: 1;
  
  .empty-state-icon {
    font-size: 3rem;
    margin-bottom: var(--space-md);
    animation: float 6s ease-in-out infinite;
  }
  
  .empty-state-title {
    font-family: var(--font-family-mono);
    color: var(--color-text-primary);
    margin-bottom: var(--space-sm);
  }
  
  .empty-state-message {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-lg);
  }
  
  .create-task-btn {
    font-family: var(--font-family-mono);
    font-weight: bold;
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-accent);
    color: var(--color-text-primary);
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: background-color var(--transition-fast), transform var(--transition-fast);
    
    &:hover, &:focus {
      background-color: var(--color-primary);
      transform: translateY(-2px);
    }
  }
}

@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .scale-indicator {
    width: 100%;
    justify-content: space-between;
  }
  
  .task-visualization {
    height: calc(100vh - 240px);
  }
}
</style>
