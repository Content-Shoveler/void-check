<template>
  <div class="space-visualization">
    <space-renderer 
      ref="rendererRef"
      @scene-ready="handleSceneReady"
    />
    
    <div class="controls">
      <div class="time-controls">
        <div class="now-time-control">
          <div class="toggle-wrapper" @click="toggleLiveMode">
            <cyber-toggle
              :modelValue="isLiveMode"
              label="Live Mode"
              @change="handleLiveModeChange"
            />
          </div>
          <input 
            v-if="!isLiveMode"
            type="datetime-local"
            class="time-picker"
            v-model="customNowTimeInput"
            @change="updateCustomTime"
          />
        </div>
      </div>
      <cyber-slider
        v-model="timeScale"
        :min="1"
        :max="10"
        :step="0.1"
        label="Focus"
      />
    </div>
    
    <div v-if="selectedTask" class="task-details">
      <cyber-card>
        <h5>{{ selectedTask.title }}</h5>
        <h5 class="due-date">{{ formatDate(selectedTask.dueDate) }}</h5>
        <p v-if="selectedTask.description">{{ selectedTask.description }}</p>
        <!-- <div class="task-meta">
          <cyber-badge :type="selectedTask.priority">{{ selectedTask.priority }}</cyber-badge>
        </div> -->
        <div class="task-actions">
          <cyber-button size="small" @click="openTaskDetails(selectedTask.id)">
            View Details
          </cyber-button>
          <!-- <cyber-button size="small" type="secondary" @click="toggleTaskCompletion(selectedTask)" :disabled="selectedTask.completed">
            {{ selectedTask.completed ? 'Completed' : 'Mark Complete' }}
          </cyber-button> -->
        </div>
      </cyber-card>
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
        @dblclick="handleTaskDoubleClick"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, onUnmounted } from 'vue';
import * as THREE from 'three';
import { useRouter } from 'vue-router';
import { useTasksStore } from '../../store/modules/tasks';
import { useSettingsStore } from '../../store/modules/settings';
import { calculateTaskPosition, avoidClusters, calculateRingPosition, timeConfig } from '../../utils/timeScaleUtils';
import type { TaskPosition, TimeNotch } from '../../utils/timeScaleUtils';
import type { Task } from '../../types';
import SpaceRenderer from './SpaceRenderer.vue';
import TaskEntity from './TaskEntity.vue';
import CyberSlider from '../cyber/inputs/CyberSlider.vue';
import CyberButton from '../cyber/buttons/CyberButton.vue';
import CyberCard from '../cyber/cards/CyberCard.vue';
import CyberBadge from '../cyber/cards/CyberBadge.vue';
import CyberToggle from '../cyber/inputs/CyberToggle.vue';

export default defineComponent({
  name: 'SpaceVisualization',
  
  components: {
    SpaceRenderer,
    TaskEntity,
    CyberSlider,
    CyberButton,
    CyberCard,
    CyberBadge,
    CyberToggle
  },
  
  setup() {
    const router = useRouter();
    const tasksStore = useTasksStore();
    const settingsStore = useSettingsStore();
    
    // References to Three.js objects
    const rendererRef = ref<InstanceType<typeof SpaceRenderer> | null>(null);
    const scene = ref<THREE.Scene | null>(null);
    const camera = ref<THREE.Camera | null>(null);
    
    // Time scale control (1-7)
    const timeScale = ref(settingsStore.settings.defaultTimeScale || 4);
    
    // Now time control - initialize from settings
    const isLiveMode = ref(settingsStore.settings.visualizationTimeMode === 'live');
    const customNowTime = ref(
      settingsStore.settings.customNowTime 
        ? new Date(settingsStore.settings.customNowTime) 
        : new Date()
    );
    const customNowTimeInput = ref(formatDateForInput(customNowTime.value));
    
    // Format date for datetime-local input
    function formatDateForInput(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Update custom time when input changes
    const updateCustomTime = () => {
      customNowTime.value = new Date(customNowTimeInput.value);
      // Save to settings
      settingsStore.updateSettings({
        customNowTime: customNowTime.value.toISOString()
      });
      calculateTaskPositions();
    };
    
    // Timer for live mode updates
    let liveUpdateTimer: number | null = null;
    
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
      const futureTasks = activeTasks.value.filter(task => {
        const referenceTime = isLiveMode.value ? new Date() : customNowTime.value;
        const dueDate = new Date(task.dueDate);
        return dueDate > referenceTime;
      });
      return [...futureTasks, ...recentlyCompletedTasks.value];
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
      
      // Use either live time or custom time
      const referenceTime = isLiveMode.value ? new Date() : customNowTime.value;
      
      // Calculate raw positions for all tasks
      tasksToShow.value.forEach(task => {
        positions.set(
          task.id,
          calculateTaskPosition(task, timeScale.value, referenceTime)
        );
      });
      
      // Apply clustering algorithm to avoid overlaps
      const adjustedPositions = avoidClusters(positions);
      
      // Update positions map
      // taskPositions.value = adjustedPositions;
      taskPositions.value = positions;
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
      handleTaskDoubleClick(taskId); // For single click, we can just open task details
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
    
    // Toggle live mode state directly
    const toggleLiveMode = () => {
      isLiveMode.value = !isLiveMode.value;
      handleLiveModeChange(isLiveMode.value);
    };
    
    // Handle live mode changes
    const handleLiveModeChange = (newValue: boolean) => {
      // Save to settings
      settingsStore.updateSettings({
        visualizationTimeMode: newValue ? 'live' : 'custom'
      });
      
      if (newValue) {
        // When switching to live mode, start updates
        if (liveUpdateTimer === null) {
          liveUpdateTimer = window.setInterval(() => {
            calculateTaskPositions();
          }, 60000); // Update every minute
        }
        calculateTaskPositions();
      } else {
        // When switching to custom mode, stop updates
        if (liveUpdateTimer !== null) {
          window.clearInterval(liveUpdateTimer);
          liveUpdateTimer = null;
        }
      }
    };

    // Setup rings
    const rings = ref<THREE.Mesh[]>([]);
    const calculateRingPositions = () => {
      if (!scene.value) return; // Ensure scene exists

      // Clear existing rings if any
      rings.value.forEach(ring => {
        scene.value?.remove(ring);
      });
      rings.value = [];
      
      // Create rings material only once
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x0066cc,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      
      // Create rings based on time periods from the unified configuration
      // We'll create a ring for each time period: hour, day, week, month, quarter, year
      const timeKeys = Object.keys(timeConfig);
      timeKeys.forEach((key, index) => {
        // Use key index as the size parameter for ring positioning
        const ringPosition = calculateRingPosition(index + 1, timeScale.value);
        const ringGeometry = new THREE.RingGeometry(...ringPosition);
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        
        // Essential: Rotate to be visible from camera perspective
        ring.rotation.x = Math.PI / 2;
        
        // Position slightly below the task plane
        ring.position.y = -0.2;
        
        // Add to our rings array
        rings.value.push(ring);
        
        // Add to scene
        scene.value?.add(ring);
      });
      
      // Optionally add subtle rotation animation to rings
      rendererRef.value?.addAnimationCallback((time) => {
        const speed = 0.0002;
        rings.value.forEach((ring, index) => {
          // Decrease rotation speed for outer rings
          const factor = 1 - (index * 0.1);
          ring.rotation.z = time * speed * (factor > 0 ? factor : 0.05);
        });
      });
    };
    
    // Wait for scene to be ready before creating rings
    watch(() => scene.value, (newScene) => {
      if (newScene) {
        calculateRingPositions();
      }
    });
    
    // Watch for changes in time scale
    watch(timeScale, () => {
      calculateTaskPositions();
      calculateRingPositions();
      
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
      
      // Start timer for live updates if in live mode
      if (isLiveMode.value) {
        liveUpdateTimer = window.setInterval(() => {
          calculateTaskPositions();
        }, 60000); // Update every minute
      }
    });
    
    // Clean up timers
    onUnmounted(() => {
      if (liveUpdateTimer !== null) {
        window.clearInterval(liveUpdateTimer);
      }
    });
    
    // Handle task double-click event
    const handleTaskDoubleClick = (taskId: string) => {
      if (!rendererRef.value) return;
      
      const position = getTaskPosition(taskId);
      rendererRef.value.focusOnPosition(new THREE.Vector3(position.x, position.y, position.z));
    };
    
    // Add keydown handler for spacebar to reset camera
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && rendererRef.value) {
        rendererRef.value.resetCameraPosition();
        // Prevent page scroll
        event.preventDefault();
      }
    };
    
    // Add keyboard event listener
    onMounted(() => {
      calculateTaskPositions();
      
      // Start timer for live updates if in live mode
      if (isLiveMode.value) {
        liveUpdateTimer = window.setInterval(() => {
          calculateTaskPositions();
        }, 60000); // Update every minute
      }
      
      // Add keyboard listener for spacebar
      window.addEventListener('keydown', handleKeyDown);
    });
    
    // Clean up timers and event listeners
    onUnmounted(() => {
      if (liveUpdateTimer !== null) {
        window.clearInterval(liveUpdateTimer);
      }
      
      window.removeEventListener('keydown', handleKeyDown);
    });
    
    return {
      rendererRef,
      scene,
      camera,
      timeScale,
      isLiveMode,
      customNowTimeInput,
      updateCustomTime,
      handleLiveModeChange,
      toggleLiveMode,
      selectedTaskId,
      selectedTask,
      taskPositions,
      positionedTasks,
      getTaskPosition,
      handleSceneReady,
      handleTaskClick,
      handleTaskHover,
      handleTaskDoubleClick,
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 10px;
  
  .time-controls {
    width: 80%;
    max-width: 400px;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 10px 20px;
    border-radius: 8px;
    margin-bottom: 5px;
    
      .now-time-control {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .toggle-wrapper {
          cursor: pointer;
        }
      
      .time-picker {
        padding: 5px 10px;
        background-color: rgba(0, 0, 0, 0.3);
        border: 1px solid var(--color-primary);
        border-radius: 4px;
        color: var(--color-text-primary);
        font-family: var(--font-primary);
        font-size: 0.9rem;
      }
    }
  }
  
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
