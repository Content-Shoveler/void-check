<template>
  <div class="home-view">
    <header class="home-view__header">
      <h1 class="cyber-text-glow">Time Visualization</h1>
      <div class="home-view__actions">
        <CyberButton @click="navigateToTasks">
          Manage Tasks
        </CyberButton>
      </div>
    </header>
    
    <div class="space-container">
      <SpaceVisualization ref="visualizationRef" />
      
      <div class="timeline-legend">
        <CyberCard class="legend-card">
          <h3 class="legend-title">Timeline</h3>
          <div class="legend-item">
            <div class="legend-color" style="background-color: var(--color-priority-critical)"></div>
            <span>Critical</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: var(--color-priority-high)"></div>
            <span>High Priority</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: var(--color-priority-medium)"></div>
            <span>Medium Priority</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: var(--color-priority-low)"></div>
            <span>Low Priority</span>
          </div>
          <div class="legend-item">
            <div class="legend-color legend-center"></div>
            <span>Current Time (Center)</span>
          </div>
          <div class="legend-info">
            <CyberBadge type="info">Tasks move closer as due date approaches</CyberBadge>
          </div>
        </CyberCard>
      </div>
      
      <div class="stats-panel">
        <CyberCard class="stats-card">
          <h3 class="stats-title">Task Stats</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ activeTasks }}</div>
              <div class="stat-label">Active</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ overdueTasks }}</div>
              <div class="stat-label">Overdue</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ todayTasks }}</div>
              <div class="stat-label">Today</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ completionRate }}%</div>
              <div class="stat-label">Completion</div>
            </div>
          </div>
        </CyberCard>
      </div>
    </div>
    
    <div class="time-controls">
      <div class="scale-control">
        <CyberSlider
          v-model="timeScale"
          :min="0.1"
          :max="10"
          :step="0.1"
          label="Time Scale"
        />
        <div class="scale-labels">
          <span>Hours</span>
          <span>Days</span>
          <span>Weeks</span>
          <span>Months</span>
          <span>Year</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTasksStore } from '../store/modules/tasks';
import { useSettingsStore } from '../store/modules/settings';
import SpaceVisualization from '../components/visualization/SpaceVisualization.vue';
import CyberButton from '../components/cyber/buttons/CyberButton.vue';
import CyberCard from '../components/cyber/cards/CyberCard.vue';
import CyberBadge from '../components/cyber/cards/CyberBadge.vue';
import CyberSlider from '../components/cyber/inputs/CyberSlider.vue';

export default defineComponent({
  name: 'HomeView',
  
  components: {
    SpaceVisualization,
    CyberButton,
    CyberCard,
    CyberBadge,
    CyberSlider
  },
  
  setup() {
    const router = useRouter();
    const tasksStore = useTasksStore();
    const settingsStore = useSettingsStore();
    
    const visualizationRef = ref<InstanceType<typeof SpaceVisualization> | null>(null);
    
    // Time scale control (0.1-10)
    const timeScale = ref(settingsStore.settings.defaultTimeScale || 5);
    
    // Navigate to tasks view
    const navigateToTasks = () => {
      router.push({ name: 'Tasks' });
    };
    
    // Task statistics
    const activeTasks = computed(() => {
      return tasksStore.tasks.filter(task => !task.completed).length;
    });
    
    const overdueTasks = computed(() => {
      const now = new Date();
      return tasksStore.tasks.filter(task => 
        !task.completed && new Date(task.dueDate) < now
      ).length;
    });
    
    const todayTasks = computed(() => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      
      return tasksStore.tasks.filter(task => 
        !task.completed && 
        new Date(task.dueDate) >= today &&
        new Date(task.dueDate) < tomorrow
      ).length;
    });
    
    const completionRate = computed(() => {
      const total = tasksStore.tasks.length;
      if (total === 0) return 0;
      
      const completed = tasksStore.tasks.filter(task => task.completed).length;
      return Math.round((completed / total) * 100);
    });
    
    // Watch for changes in time scale
    watch(timeScale, (newValue) => {
      // Update the settings store
      settingsStore.updateSettings({
        defaultTimeScale: newValue
      });
      
      // We don't need to update the visualization directly as it watches the settings store
    });
    
    // Initialize tasks
    onMounted(async () => {
      if (!tasksStore.isInitialized) {
        await tasksStore.initializeTasks();
      }
    });
    
    return {
      visualizationRef,
      timeScale,
      navigateToTasks,
      activeTasks,
      overdueTasks,
      todayTasks,
      completionRate
    };
  }
});
</script>

<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  --header-height: 60px;
  --footer-height: 60px;
  height: calc(100vh - var(--header-height) - var(--footer-height));
  overflow: hidden;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4) var(--space-6);
    
    h1 {
      margin: 0;
      font-size: var(--text-2xl);
    }
  }
}

.space-container {
  flex: 1;
  position: relative;
  min-height: 500px;
  height: 100%;
  display: flex;
  z-index: 1;
}

.timeline-legend {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 5;
  max-width: 250px;
  
  .legend-card {
    padding: var(--space-3);
  }
  
  .legend-title {
    margin-top: 0;
    margin-bottom: var(--space-3);
    font-size: var(--text-lg);
    text-align: center;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-2);
    
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-right: var(--space-2);
      box-shadow: var(--effect-glow);
      
      &.legend-center {
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      }
    }
  }
  
  .legend-info {
    margin-top: var(--space-3);
  }
}

.stats-panel {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  z-index: 5;
  width: 250px;
  
  .stats-card {
    padding: var(--space-3);
  }
  
  .stats-title {
    margin-top: 0;
    margin-bottom: var(--space-3);
    font-size: var(--text-lg);
    text-align: center;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .stat-value {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--color-primary);
      text-shadow: var(--effect-glow-primary);
    }
    
    .stat-label {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }
  }
}

.time-controls {
  padding: var(--space-4) var(--space-6);
  background-color: var(--color-background-elevated);
  
  .scale-control {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .scale-labels {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-2);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .timeline-legend,
  .stats-panel {
    position: static;
    max-width: none;
    width: auto;
    margin: var(--space-3);
  }
  
  .space-container {
    order: -1;
  }
  
  .home-view__header {
    flex-direction: column;
    gap: var(--space-3);
    text-align: center;
  }
}
</style>
