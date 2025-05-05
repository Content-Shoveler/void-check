<template>
  <div class="integrations-view">
    <header class="integrations-view__header">
      <h1 class="cyber-text-glow">Calendar Integrations</h1>
    </header>
    
    <div class="integrations-content">
      <!-- Providers Section -->
      <CyberCard class="integrations-section">
        <h2 class="section-title">Available Services</h2>
        
        <div class="providers-list">
          <div v-for="adapter in adapters" :key="adapter.id" class="provider-card">
            <div class="provider-info">
              <div class="provider-icon" :class="adapter.icon">
                <!-- Icon would go here -->
                <div class="icon-placeholder">{{ adapter.name.charAt(0) }}</div>
              </div>
              <div class="provider-details">
                <h3>{{ adapter.name }}</h3>
                <p>{{ adapter.description }}</p>
              </div>
            </div>
            
            <div class="provider-actions">
              <CyberButton 
                v-if="!isAuthenticated(adapter.id)"
                @click="authenticateProvider(adapter.id)"
                variant="primary"
              >
                Connect
              </CyberButton>
              
              <CyberButton 
                v-else-if="isProviderEnabled(adapter.id)" 
                @click="disconnectProvider(adapter.id)"
                variant="danger"
              >
                Disconnect
              </CyberButton>
              
              <CyberButton 
                v-else
                @click="enableProvider(adapter.id)"
                variant="secondary"
              >
                Enable
              </CyberButton>
            </div>
          </div>
          
          <div v-if="adapters.length === 0" class="no-providers">
            <p>No calendar services available to connect.</p>
          </div>
        </div>
      </CyberCard>
      
      <!-- Connected Calendars Section -->
      <CyberCard v-if="hasConnectedProviders" class="integrations-section">
        <h2 class="section-title">Connected Calendars</h2>
        
        <div class="calendars-list">
          <div v-if="isLoadingCalendars" class="loading-calendars">
            <p>Loading your calendars...</p>
          </div>
          
          <div v-else-if="calendars.length === 0" class="no-calendars">
            <p>No calendars found from your connected services.</p>
          </div>
          
          <div v-else v-for="calendar in calendars" :key="calendar.id + calendar.providerId" class="calendar-item">
            <div class="calendar-color" :style="{ backgroundColor: calendar.color }"></div>
            <div class="calendar-details">
              <h4>{{ calendar.name }}</h4>
              <p class="calendar-provider">{{ getProviderName(calendar.providerId) }}</p>
              <p v-if="calendar.description" class="calendar-description">{{ calendar.description }}</p>
            </div>
            <div class="calendar-actions">
              <CyberCheckbox 
                :model-value="isDefaultCalendar(calendar.id, calendar.providerId)"
                @update:model-value="setDefaultCalendar(calendar.id, calendar.providerId)"
                :disabled="calendar.isReadOnly"
              >
                Default for new tasks
              </CyberCheckbox>
            </div>
          </div>
        </div>
      </CyberCard>
      
      <!-- Sync Settings Section -->
      <CyberCard v-if="hasConnectedProviders" class="integrations-section">
        <h2 class="section-title">Sync Settings</h2>
        
        <div class="setting-group">
          <div class="setting-label">Sync Direction</div>
          <div class="setting-control">
            <CyberRadio
              v-model="syncDirection"
              :value="syncDirection"
              name="sync-direction"
              :options="[
                { label: 'Push tasks to calendar', value: 'push' },
                { label: 'Pull events from calendar', value: 'pull' },
                { label: 'Two-way synchronization', value: 'bidirectional' }
              ]"
              @update:model-value="updateSyncDirection"
            />
            <div class="setting-help">
              Choose how tasks and calendar events are synchronized
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Auto-sync</div>
          <div class="setting-control">
            <CyberToggle
              v-model="autoSync"
              @update:model-value="updateAutoSync"
            />
            <div class="setting-help">
              Automatically synchronize tasks with calendar events
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <div class="setting-label">Sync Frequency</div>
          <div class="setting-control">
            <CyberSelect
              v-model="syncFrequency"
              :value="syncFrequency"
              name="sync-frequency"
              :options="[
                { label: 'Every 15 minutes', value: 15 },
                { label: 'Every 30 minutes', value: 30 },
                { label: 'Every hour', value: 60 },
                { label: 'Every 4 hours', value: 240 },
                { label: 'Daily', value: 1440 }
              ]"
              @update:model-value="updateSyncFrequency"
              :disabled="!autoSync"
            />
            <div class="setting-help">
              How often to synchronize with calendar services
            </div>
          </div>
        </div>
      </CyberCard>
      
      <!-- Manual Sync Section -->
      <CyberCard v-if="hasConnectedProviders" class="integrations-section">
        <h2 class="section-title">Manual Sync</h2>
        
        <div class="manual-sync-actions">
          <CyberButton
            variant="primary"
            @click="syncAllTasks"
            :disabled="isSyncing"
          >
            Sync All Tasks Now
          </CyberButton>
          
          <div v-if="lastSyncTime" class="last-sync-time">
            Last sync: {{ formatLastSyncTime(lastSyncTime) }}
          </div>
        </div>
      </CyberCard>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { integrationService } from '../services/integration-service';
import type { NormalizedCalendar } from '../types/integration';
import type { CalendarAdapter } from '../services/integration/calendarService';
import CyberCard from '../components/cyber/cards/CyberCard.vue';
import CyberButton from '../components/cyber/buttons/CyberButton.vue';
import CyberToggle from '../components/cyber/inputs/CyberToggle.vue';
import CyberRadio from '../components/cyber/inputs/CyberRadio.vue';
import CyberSelect from '../components/cyber/inputs/CyberSelect.vue';
import CyberCheckbox from '../components/cyber/inputs/CyberCheckbox.vue';

export default defineComponent({
  name: 'IntegrationsView',
  
  components: {
    CyberCard,
    CyberButton,
    CyberToggle,
    CyberRadio,
    CyberSelect,
    CyberCheckbox
  },
  
  setup() {
    // State
    const adapters = ref<CalendarAdapter[]>([]);
    const calendars = ref<NormalizedCalendar[]>([]);
    const isLoadingCalendars = ref(false);
    const isSyncing = ref(false);
    const lastSyncTime = ref<Date | null>(null);
    
    // Settings
    const syncDirection = ref<'push' | 'pull' | 'bidirectional'>('push');
    const autoSync = ref(false);
    const syncFrequency = ref(60); // Default: 1 hour
    const defaultCalendars = ref<Record<string, string>>({});
    
    // Computed
    const hasConnectedProviders = computed(() => {
      return adapters.value.some(adapter => 
        integrationService.isAuthenticated(adapter.id) && 
        integrationService.isProviderEnabled(adapter.id)
      );
    });
    
    // Methods
    const loadAdapters = () => {
      adapters.value = integrationService.getAdapters();
    };
    
    const loadCalendars = async () => {
      isLoadingCalendars.value = true;
      
      try {
        calendars.value = await integrationService.fetchAllCalendars();
      } catch (error) {
        console.error('Failed to load calendars:', error);
      } finally {
        isLoadingCalendars.value = false;
      }
    };
    
    const isAuthenticated = (providerId: string): boolean => {
      return integrationService.isAuthenticated(providerId);
    };
    
    const isProviderEnabled = (providerId: string): boolean => {
      return integrationService.isProviderEnabled(providerId);
    };
    
    const authenticateProvider = async (providerId: string) => {
      const success = await integrationService.authenticateProvider(providerId);
      
      if (success) {
        // After authentication, reload calendars
        await loadCalendars();
      }
    };
    
    const disconnectProvider = async (providerId: string) => {
      await integrationService.disconnectProvider(providerId);
      
      // After disconnection, reload calendars
      await loadCalendars();
    };
    
    const enableProvider = (providerId: string) => {
      integrationService.enableProvider(providerId);
      
      // After enabling, reload calendars
      loadCalendars();
    };
    
    const getProviderName = (providerId: string): string => {
      const adapter = adapters.value.find(a => a.id === providerId);
      return adapter?.name || 'Unknown Provider';
    };
    
    const isDefaultCalendar = (calendarId: string, providerId: string): boolean => {
      return defaultCalendars.value[providerId] === calendarId;
    };
    
    const setDefaultCalendar = (calendarId: string, providerId: string) => {
      defaultCalendars.value = {
        ...defaultCalendars.value,
        [providerId]: calendarId
      };
      
      // Save default calendar setting
      localStorage.setItem('default_calendars', JSON.stringify(defaultCalendars.value));
    };
    
    const updateSyncDirection = (direction: 'push' | 'pull' | 'bidirectional') => {
      syncDirection.value = direction;
      localStorage.setItem('sync_direction', direction);
    };
    
    const updateAutoSync = (enabled: boolean) => {
      autoSync.value = enabled;
      localStorage.setItem('auto_sync', String(enabled));
    };
    
    const updateSyncFrequency = (frequency: number) => {
      syncFrequency.value = frequency;
      localStorage.setItem('sync_frequency', String(frequency));
    };
    
    const syncAllTasks = async () => {
      if (isSyncing.value) return;
      
      isSyncing.value = true;
      
      try {
        // This would call a method in the integration service to sync all tasks
        // For now, we'll just simulate a successful sync
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        lastSyncTime.value = new Date();
        localStorage.setItem('last_sync_time', lastSyncTime.value.toISOString());
      } catch (error) {
        console.error('Failed to sync tasks:', error);
      } finally {
        isSyncing.value = false;
      }
    };
    
    const formatLastSyncTime = (date: Date): string => {
      // Format date to a human-readable string
      return date.toLocaleString();
    };
    
    const loadSettings = () => {
      // Load sync direction
      const savedDirection = localStorage.getItem('sync_direction');
      if (savedDirection) {
        syncDirection.value = savedDirection as 'push' | 'pull' | 'bidirectional';
      }
      
      // Load auto sync setting
      const savedAutoSync = localStorage.getItem('auto_sync');
      if (savedAutoSync) {
        autoSync.value = savedAutoSync === 'true';
      }
      
      // Load sync frequency
      const savedFrequency = localStorage.getItem('sync_frequency');
      if (savedFrequency) {
        syncFrequency.value = Number(savedFrequency);
      }
      
      // Load default calendars
      const savedCalendars = localStorage.getItem('default_calendars');
      if (savedCalendars) {
        try {
          defaultCalendars.value = JSON.parse(savedCalendars);
        } catch (error) {
          console.error('Failed to parse saved default calendars:', error);
        }
      }
      
      // Load last sync time
      const savedLastSync = localStorage.getItem('last_sync_time');
      if (savedLastSync) {
        try {
          lastSyncTime.value = new Date(savedLastSync);
        } catch (error) {
          console.error('Failed to parse last sync time:', error);
        }
      }
    };
    
    // Lifecycle hooks
    onMounted(async () => {
      // Initialize the integration service
      await integrationService.initialize();
      
      // Load adapters and calendars
      loadAdapters();
      await loadCalendars();
      
      // Load settings
      loadSettings();
    });
    
    return {
      adapters,
      calendars,
      isLoadingCalendars,
      isSyncing,
      lastSyncTime,
      syncDirection,
      autoSync,
      syncFrequency,
      hasConnectedProviders,
      isAuthenticated,
      isProviderEnabled,
      authenticateProvider,
      disconnectProvider,
      enableProvider,
      getProviderName,
      isDefaultCalendar,
      setDefaultCalendar,
      updateSyncDirection,
      updateAutoSync,
      updateSyncFrequency,
      syncAllTasks,
      formatLastSyncTime
    };
  }
});
</script>

<style lang="scss" scoped>
.integrations-view {
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

.integrations-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.integrations-section {
  padding: var(--space-4);
  
  .section-title {
    color: var(--color-primary);
    font-size: var(--text-xl);
    margin-top: 0;
    margin-bottom: var(--space-4);
    border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.3);
    padding-bottom: var(--space-2);
  }
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.provider-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background-color: var(--color-background-elevated);
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  
  &:hover {
    border-color: rgba(var(--color-primary-rgb), 0.5);
  }
}

.provider-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.provider-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .icon-placeholder {
    color: var(--color-background);
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
  }
  
  &.google {
    background-color: #4285F4;
  }
  
  &.microsoft {
    background-color: #0078D4;
  }
}

.provider-details {
  h3 {
    margin: 0 0 var(--space-1);
    font-size: var(--text-md);
  }
  
  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
  }
}

.calendars-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.calendar-item {
  display: flex;
  align-items: center;
  padding: var(--space-2);
  background-color: var(--color-background-elevated);
  border-radius: var(--radius-md);
  
  &:hover {
    background-color: var(--color-background-hover);
  }
}

.calendar-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: var(--space-3);
}

.calendar-details {
  flex-grow: 1;
  
  h4 {
    margin: 0 0 var(--space-1);
    font-size: var(--text-md);
  }
  
  .calendar-provider {
    margin: 0;
    color: var(--color-primary);
    font-size: var(--text-xs);
  }
  
  .calendar-description {
    margin: var(--space-1) 0 0;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
  }
}

.setting-group {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
  
  &:last-child {
    margin-bottom: 0;
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

.manual-sync-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  
  .last-sync-time {
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
  }
}

.no-providers,
.no-calendars,
.loading-calendars {
  text-align: center;
  padding: var(--space-6);
  color: var(--color-text-secondary);
}

// Responsive styles
@media (max-width: 768px) {
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
  
  .provider-card {
    flex-direction: column;
    gap: var(--space-3);
    text-align: center;
  }
  
  .provider-info {
    flex-direction: column;
  }
}
</style>
