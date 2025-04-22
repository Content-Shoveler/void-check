<template>
  <div class="home-view">
    <div class="home-header">
      <h1>Task Visualization</h1>
      <div class="time-scale-controls">
        <v-button size="small" variant="ghost" @click="timeScaleStore.zoomIn" :disabled="isMinScale">
          <span class="icon">-</span> Zoom In
        </v-button>
        <span class="scale-indicator">{{ currentScale.label }}</span>
        <v-button size="small" variant="ghost" @click="timeScaleStore.zoomOut" :disabled="isMaxScale">
          Zoom Out <span class="icon">+</span>
        </v-button>
      </div>
    </div>
    
    <div class="task-visualization">
      <div class="visualization-container">
        <div class="visualization-center">
          <div class="center-point"></div>
          <div class="center-label">NOW</div>
        </div>
        
        <div 
          v-if="timeScaleStore.showGridLines" 
          class="time-grid"
        >
          <div 
            v-for="(marker, index) in timeMarkers" 
            :key="index" 
            class="time-marker" 
            :style="{ '--position': marker.position + '%' }"
          >
            <div class="marker-line"></div>
            <div v-if="timeScaleStore.showLabels" class="marker-label">{{ marker.label }}</div>
          </div>
        </div>
        
        <transition-group 
          tag="div" 
          name="task-movement" 
          class="tasks-container"
        >
          <div 
            v-for="task in visibleTasks" 
            :key="task.id" 
            class="task-circle" 
            :class="{ 'task-circle--completed': task.completed }"
            :style="taskStyle(task)"
            @click="navigateToTask(task.id)"
          >
            <div class="task-circle__content">
              <div class="task-circle__title">{{ task.title }}</div>
              <div v-if="showTaskDetails" class="task-circle__due-date">
                {{ formatDate(task.dueDate) }}
              </div>
            </div>
          </div>
        </transition-group>
      </div>
      
      <div class="task-controls">
        <v-button 
          variant="primary" 
          @click="showAddTaskForm = true"
        >
          Add Task
        </v-button>
      </div>
    </div>
    
    <!-- Add Task Dialog (placeholder) -->
    <div v-if="showAddTaskForm" class="task-form-overlay">
      <div class="task-form-container">
        <h2>Add New Task</h2>
        <p>Task form will be implemented here</p>
        <div class="form-actions">
          <v-button 
            variant="ghost" 
            @click="showAddTaskForm = false"
          >
            Cancel
          </v-button>
          <v-button 
            variant="primary" 
            @click="addTask"
          >
            Add Task
          </v-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '@/store/task';
import { useTimeScaleStore } from '@/store/timeScale';
import { getTaskSize, isTaskOverdue, getRemainingTime } from '@/data/models/Task';
import { getTimeMarkers, calculateTimePosition } from '@/data/models/TimeScale';
import VButton from '@/components/ui/base/VButton.vue';

export default defineComponent({
  name: 'HomeView',
  
  components: {
    VButton
  },
  
  setup() {
    const router = useRouter();
    const taskStore = useTaskStore();
    const timeScaleStore = useTimeScaleStore();
    
    const showAddTaskForm = ref(false);
    const showTaskDetails = ref(true);
    let refreshInterval: number | null = null;
    
    // Load tasks when component mounts
    onMounted(async () => {
      await taskStore.loadTasks();
      
      // Set up interval to recalculate task positions every second
      refreshInterval = window.setInterval(() => {
        // This will trigger reactivity and update positions
        taskStore.$state.lastUpdated = new Date();
      }, 1000);
    });
    
    // Clean up interval when component unmounts
    onUnmounted(() => {
      if (refreshInterval !== null) {
        clearInterval(refreshInterval);
      }
    });
    
    // Time scale markers
    const timeMarkers = computed(() => {
      return getTimeMarkers(timeScaleStore.currentScale);
    });
    
    // Current scale
    const currentScale = computed(() => {
      return timeScaleStore.currentScale;
    });
    
    // Scale limits
    const isMinScale = computed(() => {
      return timeScaleStore.availableScales[0].id === currentScale.value.id;
    });
    
    const isMaxScale = computed(() => {
      return timeScaleStore.availableScales[timeScaleStore.availableScales.length - 1].id === currentScale.value.id;
    });
    
    // Filter tasks that are visible in the current time scale
    const visibleTasks = computed(() => {
      const now = new Date();
      const maxTime = timeScaleStore.currentScaleMs;
      
      return taskStore.tasks.filter(task => {
        if (task.completed) return false;
        
        const timeLeft = task.dueDate.getTime() - now.getTime();
        return timeLeft >= 0 && timeLeft <= maxTime;
      });
    });
    
    // Calculate task styles (position, size, etc.)
    const taskStyle = (task: any) => {
      const now = new Date();
      const timeLeft = task.dueDate.getTime() - now.getTime();
      const maxTime = timeScaleStore.currentScaleMs;
      
      // Calculate distance from center (0% = center, 100% = edge)
      const distance = calculateTimePosition(timeLeft, maxTime);
      
      // Calculate angle (0-360 degrees)
      const angle = (task.id.charCodeAt(0) % 36) * 10; // Use part of ID to determine angle
      
      // Calculate position
      const x = Math.cos(angle * Math.PI / 180) * distance;
      const y = Math.sin(angle * Math.PI / 180) * distance;
      
      // Scale based on priority
      const size = getTaskSize(task.priority);
      
      // Calculate color based on time left (red = urgent, green = plenty of time)
      const colorRatio = Math.min(timeLeft / maxTime, 1);
      const hue = colorRatio * 120; // 0 = red, 120 = green
      
      return {
        '--x-position': `${x}%`,
        '--y-position': `${y}%`,
        '--task-size': size,
        '--distance': `${distance}%`,
        '--task-color': `hsl(${hue}, 80%, 50%)`,
        '--task-border-color': `hsl(${hue}, 80%, 40%)`,
      };
    };
    
    // Format date for display
    const formatDate = (date: Date) => {
      if (isToday(date)) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    };
    
    // Check if date is today
    const isToday = (date: Date) => {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };
    
    // Navigation to task detail
    const navigateToTask = (taskId: string) => {
      router.push(`/task/${taskId}`);
    };
    
    // Add task (placeholder)
    const addTask = async () => {
      const newTask = {
        title: 'New Task',
        description: 'Description here',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        priority: 2, // Medium
        tags: ['work']
      };
      
      await taskStore.addTask(newTask);
      showAddTaskForm.value = false;
    };
    
    return {
      taskStore,
      timeScaleStore,
      showAddTaskForm,
      showTaskDetails,
      visibleTasks,
      timeMarkers,
      currentScale,
      isMinScale,
      isMaxScale,
      taskStyle,
      formatDate,
      navigateToTask,
      addTask
    };
  }
});
</script>

<style lang="scss">
.home-view {
  position: relative;
  height: 100%;
  
  .home-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    
    h1 {
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(156, 39, 176, 0.3);
    }
    
    .time-scale-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .scale-indicator {
        font-family: 'JetBrains Mono', monospace;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        min-width: 100px;
        text-align: center;
      }
      
      .icon {
        font-size: 1.25rem;
        font-weight: bold;
      }
    }
  }
  
  .task-visualization {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    
    .visualization-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      max-height: 70vh;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border: 1px solid var(--color-divider);
      overflow: hidden;
      
      .visualization-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .center-point {
          width: 12px;
          height: 12px;
          background-color: var(--color-primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--color-primary);
        }
        
        .center-label {
          margin-top: 0.25rem;
          font-size: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          color: var(--color-text-secondary);
        }
      }
      
      .time-grid {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        
        .time-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%);
          
          .marker-line {
            position: absolute;
            top: 50%;
            left: 0;
            width: calc(var(--position) / 2);
            height: 1px;
            background-color: rgba(255, 255, 255, 0.1);
            transform-origin: right center;
            transform: rotate(calc(var(--index, 0) * 30deg));
          }
          
          .marker-label {
            position: absolute;
            top: 50%;
            left: calc(50% - var(--position) / 2);
            transform: translate(-50%, -50%);
            font-size: 0.75rem;
            font-family: 'JetBrains Mono', monospace;
            color: var(--color-text-secondary);
            background-color: rgba(0, 0, 0, 0.2);
            padding: 0.125rem 0.25rem;
            border-radius: 4px;
          }
        }
      }
      
      .tasks-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        
        .task-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(
            calc(-50% + var(--x-position)), 
            calc(-50% + var(--y-position))
          );
          width: calc(60px * var(--task-size, 1));
          height: calc(60px * var(--task-size, 1));
          border-radius: 50%;
          background: var(--task-color);
          border: 2px solid var(--task-border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          z-index: 1;
          overflow: hidden;
          
          &:hover {
            transform: translate(
              calc(-50% + var(--x-position)), 
              calc(-50% + var(--y-position))
            ) scale(1.1);
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
            z-index: 10;
          }
          
          &--completed {
            opacity: 0.5;
            background-color: var(--color-success);
            border-color: var(--color-success);
          }
          
          &__content {
            padding: 0.5rem;
            text-align: center;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          
          &__title {
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
            color: #fff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
          
          &__due-date {
            font-size: 0.75rem;
            opacity: 0.8;
            color: #fff;
          }
        }
      }
    }
    
    .task-controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
  }
  
  .task-form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    
    .task-form-container {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 2rem;
      width: 90%;
      max-width: 500px;
      
      h2 {
        margin-bottom: 1.5rem;
      }
      
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
      }
    }
  }
}

// Transitions
.task-movement-enter-active,
.task-movement-leave-active {
  transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
}

.task-movement-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}

.task-movement-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}
</style>
