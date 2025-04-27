<template>
  <div class="space-visualization">
    <space-renderer 
      ref="rendererRef"
      @scene-ready="handleSceneReady"
    />
    
    <div class="controls">
      <cyber-slider
        v-model="timeScale"
        :min="0"
        :max="10"
        :step="0.1"
        label="Time Scale"
      />
    </div>
    
    <div v-if="selectedTask" class="task-details">
      <!-- <cyber-card>
        <h3>{{ selectedTask.title }}</h3>
        <p v-if="selectedTask.description">{{ selectedTask.description }}</p>
        <div class="task-meta">
          <cyber-badge :type="selectedTask.priority">{{ selectedTask.priority }}</cyber-badge>
          <span class="due-date">Due: {{ formatDate(selectedTask.dueDate) }}</span>
        </div>
        <div class="task-actions">
          <cyber-button size="small" @click="openTaskDetails(selectedTask.id)">
            View Details
          </cyber-button>
          <cyber-button size="small" type="secondary" @click="toggleTaskCompletion(selectedTask)" :disabled="selectedTask.completed">
            {{ selectedTask.completed ? 'Completed' : 'Mark Complete' }}
          </cyber-button>
        </div>
      </cyber-card> -->
    </div>
    
    <!-- Create task entities for each task (only when scene and camera are ready) -->
    <template v-if="scene && camera">
      <task-entity
        v-for="task in positionedTasks"
        :key="task.id"
        :task="task" 
        :scene="scene"
        :camera="camera"
        :position="getTaskPosition(task.id)"
        :selected="selectedTaskId === task.id"
        @click="handleTaskClick"
        @hover="handleTaskHover"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import * as THREE from 'three';
import { useRouter } from 'vue-router';
import { useTasksStore } from '../../store/modules/tasks';
import { useSettingsStore } from '../../store/modules/settings';
import { calculateTaskPosition, avoidClusters } from '../../utils/timeScaleUtils';
import type { TaskPosition } from '../../utils/timeScaleUtils';
import type { Task } from '../../types';
import SpaceRenderer from './SpaceRenderer.vue';
import TaskEntity from './TaskEntity.vue';
import CyberSlider from '../cyber/inputs/CyberSlider.vue';
import CyberButton from '../cyber/buttons/CyberButton.vue';
import CyberCard from '../cyber/cards/CyberCard.vue';
import CyberBadge from '../cyber/cards/CyberBadge.vue';

export default defineComponent({
  name: 'SpaceVisualization',
  
  components: {
    SpaceRenderer,
    TaskEntity,
    CyberSlider,
    CyberButton,
    CyberCard,
    CyberBadge
  },
  
  setup() {
    const router = useRouter();
    const tasksStore = useTasksStore();
    const settingsStore = useSettingsStore();
    
    // References to Three.js objects
    const rendererRef = ref<InstanceType<typeof SpaceRenderer> | null>(null);
    const scene = ref<THREE.Scene | null>(null);
    const camera = ref<THREE.Camera | null>(null);
    
    // Time scale control (0-10)
    const timeScale = ref(settingsStore.settings.defaultTimeScale || 5);
    
    // Selected task
    const selectedTaskId = ref<string | null>(null);
    const selectedTask = computed(() => {
      if (!selectedTaskId.value) return null;
      return tasksStore.tasks.find(task => task.id === selectedTaskId.value) || null;
    });
    
    // Active tasks (not completed)
    const activeTasks = computed(() => {
      return tasksStore.tasks.filter(task => !task.completed);
    });
    
    // Recently completed tasks (completed in the last day)
    const recentlyCompletedTasks = computed(() => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      return tasksStore.tasks.filter(task => {
        return task.completed && 
               task.completedAt && 
               new Date(task.completedAt) >= oneDayAgo;
      });
    });
    
    // Combine active and recently completed tasks for display
    const tasksToShow = computed(() => {
      return [...activeTasks.value, ...recentlyCompletedTasks.value];
    });
    
    // Task positions map
    const taskPositions = ref<Map<string, TaskPosition>>(new Map());
    
    // Tasks with their computed positions
    const positionedTasks = computed(() => {
      return tasksToShow.value.filter(task => taskPositions.value.has(task.id));
    });
    
    // Calculate task positions based on due dates and time scale
    const calculateTaskPositions = () => {
      if (tasksToShow.value.length === 0) return;
      
      const positions = new Map<string, TaskPosition>();
      
      // Calculate raw positions for all tasks
      tasksToShow.value.forEach(task => {
        positions.set(
          task.id,
          calculateTaskPosition(task, timeScale.value)
        );
      });
      
      // Apply clustering algorithm to avoid overlaps
      const adjustedPositions = avoidClusters(positions);
      
      // Update positions map
      taskPositions.value = adjustedPositions;
    };
    
    // Get position for a task with safe default
    const getTaskPosition = (taskId: string) => {
      const position = taskPositions.value.get(taskId);
      return position ? position : { x: 0, y: 0, z: 0 };
    };
    
    // Handle scene ready event
    const handleSceneReady = (data: { scene: THREE.Scene; camera: THREE.Camera }) => {
      // Cast to correct type since we know these are non-null from SpaceRenderer
      scene.value = data.scene as THREE.Scene;
      camera.value = data.camera as THREE.Camera;
      
      // Calculate initial positions
      calculateTaskPositions();
    };

    // Handle task hover event
    const handleTaskHover = (taskId: string) => {
      selectedTaskId.value = taskId;
    };
    
    // Handle task click
    const handleTaskClick = (taskId: string) => {
      selectedTaskId.value = taskId;
    };
    
    // Open task details
    const openTaskDetails = (taskId: string) => {
      // Navigate to task details or open a modal
      router.push({ name: 'TaskDetail', params: { id: taskId } });
    };
    
    // Toggle task completion
    const toggleTaskCompletion = (task: Task) => {
      if (!task.completed) {
        tasksStore.toggleTaskCompletion(task.id);
      }
    };
    
    // Format date for display
    const formatDate = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // Watch for changes in time scale
    watch(timeScale, () => {
      calculateTaskPositions();
      
      // Save to settings
      settingsStore.updateSettings({
        defaultTimeScale: timeScale.value
      });
    });
    
    // Watch for changes in tasks
    watch(
      () => tasksStore.tasks,
      () => {
        calculateTaskPositions();
      },
      { deep: true }
    );
    
    // Initialize positions on mount
    onMounted(() => {
      calculateTaskPositions();
    });
    
    return {
      rendererRef,
      scene,
      camera,
      timeScale,
      selectedTaskId,
      selectedTask,
      taskPositions,
      positionedTasks,
      getTaskPosition,
      handleSceneReady,
      handleTaskClick,
      handleTaskHover,
      openTaskDetails,
      toggleTaskCompletion,
      formatDate
    };
  }
});
</script>

<style lang="scss" scoped>
.space-visualization {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex: 1;
}

.controls {
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 10;
  
  :deep(.cyber-slider) {
    width: 80%;
    max-width: 400px;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 8px;
  }
}

.task-details {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 300px;
  z-index: 10;
  
  h3 {
    margin-top: 0;
    margin-bottom: 8px;
  }
  
  p {
    margin-bottom: 12px;
    opacity: 0.8;
  }
  
  .task-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    
    .due-date {
      font-size: 0.9em;
      opacity: 0.7;
    }
  }
  
  .task-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
