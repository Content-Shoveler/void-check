<template>
  <div class="settings-view">
    <header class="settings-view__header">
      <h1 class="cyber-text-glow">Settings</h1>
    </header>
    
    <div class="settings-content">
      <CyberAccordion :multiple="false" :default-expanded="0">
        <!-- Theme Settings Section -->
        <CyberAccordionItem class="settings-section" title="Theme Settings" :index="0">        
        <div class="setting-group">
          <div class="setting-label">Theme</div>
          <div class="setting-control">
            <CyberToggleGroup
              v-model="themeMode"
              :options="[
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
                { label: 'System', value: 'system' }
              ]"
              @update:modelValue="updateTheme"
            />
            <div class="setting-help">
              Choose between dark space, light station, or follow system preference
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Accent Color</div>
          <div class="setting-control">
            <div class="color-picker">
              <div 
                v-for="color in accentColors" 
                :key="color.value"
                class="color-option"
                :class="{ active: selectedAccentColor === color.value }"
                :style="{ backgroundColor: color.hex }"
                @click="selectAccentColor(color.value)"
              ></div>
            </div>
            <div class="setting-help">
              Select the primary accent color for interface elements
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Interface Density</div>
          <div class="setting-control">
            <CyberToggleGroup
              v-model="interfaceDensity"
              :options="[
                { label: 'Compact', value: 'compact' },
                { label: 'Normal', value: 'normal' },
                { label: 'Comfortable', value: 'comfortable' }
              ]"
              @update:modelValue="updateInterfaceDensity"
            />
            <div class="setting-help">
              Adjust spacing between elements in the interface
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Font Size</div>
          <div class="setting-control">
            <CyberSlider
              v-model="fontSize"
              :min="0.8"
              :max="1.4"
              :step="0.05"
              @update:modelValue="updateFontSize"
            />
            <div class="font-size-preview">
              <span :style="{ fontSize: `${fontSize}rem` }">Sample Text</span>
            </div>
            <div class="setting-help">
              Adjust the base font size for better readability
            </div>
          </div>
        </div>
        </CyberAccordionItem>
        
        <!-- Performance Settings Section -->
        <CyberAccordionItem class="settings-section" title="Performance Settings" :index="1">
        
        <div class="setting-group">
          <div class="setting-label">Performance Mode</div>
          <div class="setting-control">
            <CyberToggleGroup
              v-model="performanceMode"
              :options="[
                { label: 'Standard', value: 'standard' },
                { label: 'Performance', value: 'performance' }
              ]"
              @update:modelValue="updatePerformanceMode"
            />
            <div class="setting-help">
              Enable performance mode for better performance on low-end devices
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">WebGL Quality</div>
          <div class="setting-control">
            <CyberRadioGroup
              v-model="webglQuality"
              :options="[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' }
              ]"
              @update:modelValue="updateWebglQuality"
            />
            <div class="setting-help">
              Set the rendering quality for space visualization
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Particle Density</div>
          <div class="setting-control">
            <CyberSlider
              v-model="particleDensity"
              :min="0"
              :max="100"
              :step="5"
              @update:modelValue="updateParticleDensity"
            />
            <div class="setting-help">
              Control the amount of particles in the space environment
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Animation Intensity</div>
          <div class="setting-control">
            <CyberSlider
              v-model="animationIntensity"
              :min="0"
              :max="100"
              :step="5"
              @update:modelValue="updateAnimationIntensity"
            />
            <div class="setting-help">
              Adjust the intensity of animations and effects
            </div>
          </div>
        </div>
        
        <div class="setting-group align-center">
          <CyberButton
            variant="secondary"
            size="small"
            @click="resetPerformanceSettings"
          >
            Reset to Default
          </CyberButton>
        </div>
        </CyberAccordionItem>
        
        <!-- Data Management Section -->
        <CyberAccordionItem class="settings-section" title="Data Management" :index="2">
        
        <div class="setting-group">
          <div class="setting-label">Export Data</div>
          <div class="setting-control">
            <CyberButton
              variant="primary"
              @click="exportData"
            >
              <template #icon-left>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </template>
              Export to JSON
            </CyberButton>
            <div class="setting-help">
              Download all your tasks and settings as a JSON file
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Import Data</div>
          <div class="setting-control">
            <CyberButton
              variant="secondary"
              @click="triggerImport"
            >
              <template #icon-left>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </template>
              Import from JSON
            </CyberButton>
            <input
              ref="fileInputRef"
              type="file"
              accept=".json"
              class="hidden-input"
              @change="importData"
            >
            <div class="setting-help">
              Import tasks and settings from a previously exported file
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Clear All Data</div>
          <div class="setting-control">
            <CyberButton
              variant="danger"
              @click="confirmClearData"
              :loading="clearingData"
            >
              <template #icon-left>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </template>
              Clear All Data
            </CyberButton>
            <div class="setting-help">
              Delete all tasks and reset settings (cannot be undone)
            </div>
          </div>
        </div>
        </CyberAccordionItem>
        
        <!-- Sample Data Section -->
        <CyberAccordionItem class="settings-section" title="Sample Data" :index="3">
        
        <div class="setting-group">
          <div class="setting-label">Number of Tasks</div>
          <div class="setting-control">
            <CyberSlider
              v-model="sampleDataCount"
              :min="10"
              :max="2000"
              :step="10"
            />
            <div class="task-count-display">{{ sampleDataCount }} tasks</div>
            <div class="setting-help">
              Adjust the number of sample tasks to generate
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Generate Data</div>
          <div class="setting-control">
            <CyberButton
              variant="accent"
              @click="generateSampleData"
              :loading="generatingSampleData"
            >
              <template #icon-left>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </template>
              Generate Sample Data
            </CyberButton>
            <div class="setting-help">
              Create random sample tasks for testing and demonstration
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Remove Data</div>
          <div class="setting-control">
            <CyberButton
              variant="danger"
              @click="removeSampleData"
              :loading="removingSampleData"
            >
              <template #icon-left>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </template>
              Remove All Sample Data
            </CyberButton>
            <div class="setting-help">
              Clear all tasks without confirmation for quick cleanup
            </div>
          </div>
        </div>
        </CyberAccordionItem>
        
        <!-- Task Defaults Section -->
        <CyberAccordionItem class="settings-section" title="Task Defaults" :index="4">
        
        <div class="setting-group">
          <div class="setting-label">Default Priority</div>
          <div class="setting-control">
            <CyberRadioGroup
              v-model="defaultPriority"
              :options="[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' }
              ]"
              @update:modelValue="updateDefaultPriority"
            />
            <div class="setting-help">
              Set the default priority for new tasks
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Default Effect Type</div>
          <div class="setting-control">
            <CyberSelect
              v-model="defaultEffectType"
              :options="effectTypeOptions"
              @update:modelValue="updateDefaultEffectType"
            />
            <div class="setting-help">
              Select the default visual effect for new tasks
            </div>
          </div>
        </div>
        </CyberAccordionItem>
      </CyberAccordion>
    </div>
    
    <!-- Confirmation Modal -->
    <CyberModal
      :model-value="isConfirmModalOpen"
      @update:model-value="isConfirmModalOpen = $event"
      title="Confirm Action"
    >
      <p>Are you sure you want to clear all data? This action cannot be undone.</p>
      <p>All tasks and custom settings will be permanently deleted.</p>
      
      <template #footer>
        <CyberButton
          variant="ghost"
          @click="isConfirmModalOpen = false"
        >
          Cancel
        </CyberButton>
        <CyberButton
          variant="danger"
          @click="clearAllData"
          class="confirm-delete-button"
        >
          Confirm Delete
        </CyberButton>
      </template>
    </CyberModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useTasksStore } from '../store/modules/tasks';
import { useSettingsStore } from '../store/modules/settings';
import { loadSampleTasks } from '../utils/sampleTasks';
import taskRepository from '../services/taskRepository';
import type { ThemeMode, InterfaceDensity, WebGLQuality, TaskPriority } from '../types/components';
import CyberButton from '../components/cyber/buttons/CyberButton.vue';
import CyberToggle from '../components/cyber/inputs/CyberToggle.vue';
import CyberToggleGroup from '../components/cyber/inputs/CyberToggleGroup.vue';
import CyberSlider from '../components/cyber/inputs/CyberSlider.vue';
import CyberRadio from '../components/cyber/inputs/CyberRadio.vue';
import CyberRadioGroup from '../components/cyber/inputs/CyberRadioGroup.vue';
import CyberSelect from '../components/cyber/inputs/CyberSelect.vue';
import CyberModal from '../components/cyber/modals/CyberModal.vue';
import CyberAccordion from '../components/cyber/accordion/CyberAccordion.vue';
import CyberAccordionItem from '../components/cyber/accordion/CyberAccordionItem.vue';

export default defineComponent({
  name: 'SettingsView',
  
  components: {
    CyberButton,
    CyberToggle,
    CyberToggleGroup,
    CyberSlider,
    CyberRadio,
    CyberRadioGroup,
    CyberSelect,
    CyberModal,
    CyberAccordion,
    CyberAccordionItem
  },
  
  setup() {
    const tasksStore = useTasksStore();
    const settingsStore = useSettingsStore();
    
    // References
    const fileInputRef = ref<HTMLInputElement | null>(null);
    
    // Theme Settings
    const themeMode = ref(settingsStore.settings.theme || 'dark');
    const accentColors = [
      { label: 'Cyan', value: 'cyan', hex: '#00F5FF' },
      { label: 'Magenta', value: 'magenta', hex: '#FF3E80' },
      { label: 'Gold', value: 'gold', hex: '#FFCC00' },
      { label: 'Blue', value: 'blue', hex: '#0088FF' },
      { label: 'Green', value: 'green', hex: '#00C781' },
      { label: 'Purple', value: 'purple', hex: '#9B51E0' }
    ];
    const selectedAccentColor = ref(settingsStore.settings.accentColor || 'cyan');
    const interfaceDensity = ref(settingsStore.settings.interfaceDensity || 'normal');
    const fontSize = ref(settingsStore.settings.fontSize || 1);
    
    // Performance Settings
    const performanceMode = ref(settingsStore.settings.performanceMode ? 'performance' : 'standard');
    const webglQuality = ref(settingsStore.settings.webglQuality || 'medium');
    const particleDensity = ref(settingsStore.settings.particleDensity || 50);
    const animationIntensity = ref(settingsStore.settings.animationIntensity || 50);
    
    // Task Defaults
    const defaultPriority = ref(settingsStore.settings.taskDefaults?.priority || 'medium');
    const defaultEffectType = ref(settingsStore.settings.taskDefaults?.effectType || 'glow');
    const effectTypeOptions = [
      { value: 'glow', label: 'Neon Glow' },
      { value: 'pulse', label: 'Pulse' },
      { value: 'wave', label: 'Wave' },
      { value: 'glitch', label: 'Glitch' },
      { value: 'holo', label: 'Hologram' }
    ];
    
    // Modal state
    const isConfirmModalOpen = ref(false);
    
    // Theme Settings Methods
    const updateTheme = (theme: string) => {
      settingsStore.updateSettings({ theme: theme as ThemeMode });
      document.documentElement.setAttribute('data-theme', theme);
    };
    
    const selectAccentColor = (color: string) => {
      selectedAccentColor.value = color;
      settingsStore.updateSettings({ accentColor: color });
    };
    
  const updateInterfaceDensity = (density: string) => {
    interfaceDensity.value = density as InterfaceDensity;
    settingsStore.updateSettings({ interfaceDensity: density as InterfaceDensity });
      
      // Apply density class to root element
      document.documentElement.setAttribute('data-density', density);
    };
    
    const updateFontSize = (size: number) => {
      fontSize.value = size;
      settingsStore.updateSettings({ fontSize: size });
      
      // Apply font size to root element
      document.documentElement.style.setProperty('--base-font-size', `${size}rem`);
    };
    
    // Performance Settings Methods
    const updatePerformanceMode = (mode: string) => {
      performanceMode.value = mode;
      settingsStore.updateSettings({ 
        performanceMode: mode === 'performance' 
      });
    };
    
    const updateWebglQuality = (quality: string) => {
      webglQuality.value = quality as WebGLQuality;
      settingsStore.updateSettings({ webglQuality: quality as WebGLQuality });
    };
    
    const updateParticleDensity = (density: number) => {
      particleDensity.value = density;
      settingsStore.updateSettings({ particleDensity: density });
    };
    
    const updateAnimationIntensity = (intensity: number) => {
      animationIntensity.value = intensity;
      settingsStore.updateSettings({ animationIntensity: intensity });
    };
    
    const resetPerformanceSettings = () => {
      performanceMode.value = 'standard';
      webglQuality.value = 'medium';
      particleDensity.value = 50;
      animationIntensity.value = 50;
      
      settingsStore.updateSettings({
        performanceMode: false,
        webglQuality: 'medium',
        particleDensity: 50,
        animationIntensity: 50
      });
    };
    
    // Data Management Methods
    const exportData = () => {
      // Combine tasks and settings
      const exportData = {
        tasks: tasksStore.tasks,
        settings: settingsStore.settings,
        version: '1.0.0',
        exportDate: new Date().toISOString()
      };
      
      // Create download link
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `voidcheck_backup_${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
      linkElement.remove();
    };
    
    const triggerImport = () => {
      if (fileInputRef.value) {
        fileInputRef.value.click();
      }
    };
    
    const importData = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files?.length) return;
      
      const file = target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (data.tasks && Array.isArray(data.tasks)) {
            tasksStore.importTasks(data.tasks);
          }
          
          if (data.settings) {
            settingsStore.importSettings(data.settings);
            
            // Update local refs
            themeMode.value = data.settings.theme || 'dark';
            selectedAccentColor.value = data.settings.accentColor || 'cyan';
            interfaceDensity.value = data.settings.interfaceDensity || 'normal';
            fontSize.value = data.settings.fontSize || 1;
            performanceMode.value = data.settings.performanceMode ? 'performance' : 'standard';
            webglQuality.value = data.settings.webglQuality || 'medium';
            particleDensity.value = data.settings.particleDensity || 50;
            animationIntensity.value = data.settings.animationIntensity || 50;
            defaultPriority.value = data.settings.taskDefaults?.priority || 'medium';
            defaultEffectType.value = data.settings.taskDefaults?.effectType || 'glow';
          }
          
          // Reset file input
          if (fileInputRef.value) {
            fileInputRef.value.value = '';
          }
          
          // Apply settings
          applySettings();
          
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      };
      
      reader.readAsText(file);
    };
    
    const confirmClearData = () => {
      isConfirmModalOpen.value = true;
    };
    
    const clearAllData = async () => {
      if (clearingData.value) return;
      
      clearingData.value = true;
      
      try {
        // 1. Clear all tasks from IndexedDB first
        await tasksStore.clearAllTasks();
        
        // 2. Reload tasks from database to update store state (critical step)
        await tasksStore.fetchAllTasks();
        
        // 3. Reset settings to defaults
        settingsStore.resetSettings();
        
        // 4. Remove settings from localStorage to ensure clean state
        localStorage.removeItem('voidcheck_settings');
        
        // 5. Update local refs to match default values
        themeMode.value = 'dark';
        selectedAccentColor.value = 'cyan';
        interfaceDensity.value = 'normal';
        fontSize.value = 1;
        performanceMode.value = 'standard';
        webglQuality.value = 'medium';
        particleDensity.value = 50;
        animationIntensity.value = 50;
        defaultPriority.value = 'medium';
        defaultEffectType.value = 'glow';
        
        // 6. Apply settings to UI
        applySettings();
        
        // 7. Force a save of the default settings to localStorage
        localStorage.setItem('voidcheck_settings', JSON.stringify(settingsStore.settings));
        
        console.log('All data cleared successfully');
      } catch (error) {
        console.error('Failed to clear data:', error);
      } finally {
        clearingData.value = false;
        isConfirmModalOpen.value = false;
      }
    };
    
    // Task Defaults Methods
    const updateDefaultPriority = (priority: string) => {
      defaultPriority.value = priority as TaskPriority;
      
      const taskDefaults = {
        ...settingsStore.settings.taskDefaults,
        priority: priority as TaskPriority
      };
      
      settingsStore.updateSettings({ taskDefaults });
    };
    
    const updateDefaultEffectType = (effectType: string) => {
      defaultEffectType.value = effectType;
      
      const taskDefaults = {
        ...settingsStore.settings.taskDefaults,
        effectType
      };
      
      settingsStore.updateSettings({ taskDefaults });
    };
    
    // Apply all settings to DOM
    const applySettings = () => {
      // Apply theme
      document.documentElement.setAttribute('data-theme', themeMode.value);
      
      // Apply density
      document.documentElement.setAttribute('data-density', interfaceDensity.value);
      
      // Apply font size
      document.documentElement.style.setProperty('--base-font-size', `${fontSize.value}rem`);
    };
    
    // Data Management Controls
    const clearingData = ref(false);
    
    // Sample Data Controls
    const sampleDataCount = ref(100); // Default to 100 tasks
    const generatingSampleData = ref(false);
    const removingSampleData = ref(false);
    
    const generateSampleData = async () => {
      if (generatingSampleData.value) return;
      
      generatingSampleData.value = true;
      
      try {
        // Clear existing tasks first
        await tasksStore.clearAllTasks();
        
        // Generate sample tasks
        await loadSampleTasks(taskRepository, sampleDataCount.value);
        
        // Refresh the tasks in the store
        await tasksStore.fetchAllTasks();
        
        console.log(`Generated ${sampleDataCount.value} sample tasks`);
      } catch (error) {
        console.error('Failed to generate sample data:', error);
      } finally {
        generatingSampleData.value = false;
      }
    };
    
    const removeSampleData = async () => {
      if (removingSampleData.value) return;
      
      removingSampleData.value = true;
      
      try {
        // Clear all tasks directly without confirmation
        await tasksStore.clearAllTasks();
        
        // Refresh the tasks in the store
        await tasksStore.fetchAllTasks();
        
        console.log('All sample data removed successfully');
      } catch (error) {
        console.error('Failed to remove sample data:', error);
      } finally {
        removingSampleData.value = false;
      }
    };
    
    // Initialize settings
    onMounted(() => {
      applySettings();
    });
    
    return {
      // Refs
      fileInputRef,
      
      // Theme Settings
      themeMode,
      accentColors,
      selectedAccentColor,
      interfaceDensity,
      fontSize,
      
      // Performance Settings
      performanceMode,
      webglQuality,
      particleDensity,
      animationIntensity,
      
      // Task Defaults
      defaultPriority,
      defaultEffectType,
      effectTypeOptions,
      
      // Data Management
      clearingData,
      
      // Sample Data
      sampleDataCount,
      generatingSampleData,
      generateSampleData,
      removingSampleData,
      removeSampleData,
      
      // Modal State
      isConfirmModalOpen,
      
      // Methods
      updateTheme,
      selectAccentColor,
      updateInterfaceDensity,
      updateFontSize,
      updatePerformanceMode,
      updateWebglQuality,
      updateParticleDensity,
      updateAnimationIntensity,
      resetPerformanceSettings,
      exportData,
      triggerImport,
      importData,
      confirmClearData,
      clearAllData,
      updateDefaultPriority,
      updateDefaultEffectType
    };
  }
});
</script>

<style lang="scss" scoped>
.settings-view {
  padding: var(--space-6);
  max-width: 800px;
  margin: 0 auto;
  
  &__header {
    margin-bottom: var(--space-6);
    
    h1 {
      margin: 0;
    }
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.settings-section {
  width: 100%;
}

.setting-group {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.align-center {
    justify-content: center;
  }
}

.setting-label {
  flex: 0 0 200px;
  font-weight: var(--font-medium);
  padding-top: var(--space-1);
}

.setting-control {
  flex: 1;
  min-width: 300px;
  
  .setting-help {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-top: var(--space-2);
  }
}

.color-picker {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  
  .color-option {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    transition: var(--transition-base);
    border: 2px solid transparent;
    
    &:hover {
      transform: scale(1.1);
    }
    
    &.active {
      border-color: var(--color-text-primary);
      box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-primary);
    }
  }
}

.font-size-preview {
  background-color: var(--color-background-elevated);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  margin-top: var(--space-2);
  margin-bottom: var(--space-2);
  display: inline-block;
}

.task-count-display {
  background-color: var(--color-background-elevated);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  margin-top: var(--space-2);
  margin-bottom: var(--space-2);
  display: inline-block;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  font-family: var(--font-mono);
  box-shadow: 0 0 8px rgba(var(--color-accent-rgb), 0.5);
  text-shadow: 0 0 5px rgba(var(--color-accent-rgb), 0.8);
}

.hidden-input {
  display: none;
}

// Responsive styles
@media (max-width: 768px) {
  .settings-view {
    padding: var(--space-4);
  }
  
  .setting-group {
    flex-direction: column;
  }
  
  .setting-label {
    flex: 0 0 auto;
    margin-bottom: var(--space-2);
  }
  
  .setting-control {
    min-width: 0;
  }
}
</style>
