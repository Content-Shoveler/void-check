import { ref, computed } from 'vue';
import type { Task } from '../types';
import type { 
  NormalizedEvent, 
  NormalizedCalendar, 
  TokenInfo,
  TaskEventMapping
} from '../types/integration';
import type { CalendarAdapter } from './integration/calendarService';
import { GoogleCalendarAdapter } from './integration/adapters/google-calendar.adapter';
import { MicrosoftCalendarAdapter } from './integration/adapters/microsoft-calendar.adapter';

/**
 * Integration Service
 * 
 * Manages calendar service adapters and provides a unified API
 * for interacting with various calendar providers.
 */
export class IntegrationService {
  private adapters = new Map<string, CalendarAdapter>();
  private activeProviders = ref<string[]>([]);
  private mappings = ref<TaskEventMapping[]>([]);
  private isInitialized = ref(false);
  
  constructor() {
    // Initialize with default adapters
    this.registerDefaultAdapters();
    this.loadState();
  }
  
  // ----------------
  // Adapter Management
  // ----------------
  
  /**
   * Register a new adapter
   */
  registerAdapter(adapter: CalendarAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }
  
  /**
   * Get an adapter by ID
   */
  getAdapter(id: string): CalendarAdapter | undefined {
    return this.adapters.get(id);
  }
  
  /**
   * Get all registered adapters
   */
  getAdapters(): CalendarAdapter[] {
    return Array.from(this.adapters.values());
  }
  
  /**
   * Register the default set of adapters
   */
  private registerDefaultAdapters(): void {
    // Register Google Calendar adapter
    this.registerAdapter(new GoogleCalendarAdapter({
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-google-client-id',
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY || 'mock-google-api-key'
    }));
    
    // Register Microsoft Calendar adapter
    this.registerAdapter(new MicrosoftCalendarAdapter({
      clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'mock-microsoft-client-id',
      clientSecret: import.meta.env.VITE_MICROSOFT_CLIENT_SECRET || 'mock-microsoft-client-secret',
      redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || 'http://localhost:3000/auth/microsoft/callback'
    }));
  }
  
  // ----------------
  // Provider Management
  // ----------------
  
  /**
   * Enable a provider by ID
   */
  enableProvider(id: string): void {
    if (!this.activeProviders.value.includes(id) && this.adapters.has(id)) {
      this.activeProviders.value.push(id);
      this.saveState();
    }
  }
  
  /**
   * Disable a provider by ID
   */
  disableProvider(id: string): void {
    this.activeProviders.value = this.activeProviders.value.filter(
      providerId => providerId !== id
    );
    this.saveState();
  }
  
  /**
   * Get all enabled providers
   */
  getEnabledProviders(): string[] {
    return this.activeProviders.value;
  }
  
  /**
   * Check if a provider is enabled
   */
  isProviderEnabled(id: string): boolean {
    return this.activeProviders.value.includes(id);
  }
  
  // ----------------
  // Authentication
  // ----------------
  
  /**
   * Authenticate with a provider
   */
  async authenticateProvider(id: string): Promise<boolean> {
    const adapter = this.adapters.get(id);
    if (!adapter) return false;
    
    const success = await adapter.authenticate();
    if (success) {
      this.enableProvider(id);
    }
    
    return success;
  }
  
  /**
   * Disconnect from a provider
   */
  async disconnectProvider(id: string): Promise<void> {
    const adapter = this.adapters.get(id);
    if (!adapter) return;
    
    await adapter.disconnect();
    this.disableProvider(id);
  }
  
  /**
   * Check if authenticated with a provider
   */
  isAuthenticated(id: string): boolean {
    const adapter = this.adapters.get(id);
    return adapter?.isAuthenticated() || false;
  }
  
  // ----------------
  // Calendar Operations
  // ----------------
  
  /**
   * Fetch calendars from a provider
   */
  async fetchCalendars(providerId: string): Promise<NormalizedCalendar[]> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) return [];
    
    return await adapter.fetchCalendars();
  }
  
  /**
   * Fetch calendars from all enabled providers
   */
  async fetchAllCalendars(): Promise<NormalizedCalendar[]> {
    const results: NormalizedCalendar[] = [];
    
    for (const providerId of this.activeProviders.value) {
      const adapter = this.adapters.get(providerId);
      if (adapter && adapter.isAuthenticated()) {
        const calendars = await adapter.fetchCalendars();
        results.push(...calendars);
      }
    }
    
    return results;
  }
  
  /**
   * Fetch events from a specific calendar
   */
  async fetchEvents(
    providerId: string,
    calendarId: string,
    options?: {
      timeMin?: Date;
      timeMax?: Date;
      maxResults?: number;
    }
  ): Promise<NormalizedEvent[]> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) return [];
    
    return await adapter.fetchEvents(calendarId, options || {});
  }
  
  // ----------------
  // Task-Event Mapping
  // ----------------
  
  /**
   * Create a calendar event from a task
   */
  async createEventFromTask(
    task: Task,
    providerId: string,
    calendarId: string
  ): Promise<NormalizedEvent | null> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) return null;
    
    try {
      const event = await adapter.createEventFromTask(task, calendarId);
      
      // Store mapping
      this.addMapping({
        taskId: task.id,
        providerId,
        eventId: event.id,
        lastSynced: new Date()
      });
      
      return event;
    } catch (error) {
      console.error('Failed to create event from task:', error);
      return null;
    }
  }
  
  /**
   * Update a calendar event from a task
   */
  async updateEventFromTask(
    task: Task,
    providerId: string,
    eventId: string,
    calendarId: string
  ): Promise<NormalizedEvent | null> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) return null;
    
    try {
      const event = await adapter.updateEventFromTask(task, eventId, calendarId);
      
      // Update mapping
      const mapping = this.mappings.value.find(
        m => m.taskId === task.id && m.providerId === providerId
      );
      
      if (mapping) {
        mapping.lastSynced = new Date();
        this.saveState();
      }
      
      return event;
    } catch (error) {
      console.error('Failed to update event from task:', error);
      return null;
    }
  }
  
  /**
   * Delete an event linked to a task
   */
  async deleteEvent(
    taskId: string,
    providerId: string,
    calendarId: string
  ): Promise<boolean> {
    const adapter = this.adapters.get(providerId);
    if (!adapter) return false;
    
    // Find the mapping to get the event ID
    const mapping = this.mappings.value.find(
      m => m.taskId === taskId && m.providerId === providerId
    );
    
    if (!mapping) return false;
    
    try {
      const success = await adapter.deleteEvent(calendarId, mapping.eventId);
      
      if (success) {
        // Remove mapping
        this.removeMapping(taskId, providerId);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to delete event:', error);
      return false;
    }
  }
  
  /**
   * Get all events linked to a task
   */
  async getTaskEvents(taskId: string): Promise<NormalizedEvent[]> {
    const taskMappings = this.mappings.value.filter(m => m.taskId === taskId);
    const events: NormalizedEvent[] = [];
    
    for (const mapping of taskMappings) {
      const adapter = this.adapters.get(mapping.providerId);
      if (adapter && adapter.isAuthenticated()) {
        try {
          // Fetch events from the provider and find the one with the correct ID
          const providerEvents = await adapter.fetchEvents('primary', {});
          const event = providerEvents.find(e => e.id === mapping.eventId);
          
          if (event) {
            events.push(event);
          }
        } catch (error) {
          console.error('Failed to fetch event for task:', error);
        }
      }
    }
    
    return events;
  }
  
  // ----------------
  // Mapping Management
  // ----------------
  
  /**
   * Add a task-event mapping
   */
  addMapping(mapping: TaskEventMapping): void {
    // Check if the mapping already exists
    const existingIndex = this.mappings.value.findIndex(
      m => m.taskId === mapping.taskId && m.providerId === mapping.providerId
    );
    
    if (existingIndex !== -1) {
      // Update existing mapping
      this.mappings.value[existingIndex] = mapping;
    } else {
      // Add new mapping
      this.mappings.value.push(mapping);
    }
    
    this.saveState();
  }
  
  /**
   * Remove a task-event mapping
   */
  removeMapping(taskId: string, providerId: string): void {
    this.mappings.value = this.mappings.value.filter(
      m => !(m.taskId === taskId && m.providerId === providerId)
    );
    
    this.saveState();
  }
  
  /**
   * Get all mappings for a task
   */
  getTaskMappings(taskId: string): TaskEventMapping[] {
    return this.mappings.value.filter(m => m.taskId === taskId);
  }
  
  /**
   * Check if a task has any mappings
   */
  hasTaskMappings(taskId: string): boolean {
    return this.mappings.value.some(m => m.taskId === taskId);
  }
  
  // ----------------
  // Initialization & State
  // ----------------
  
  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized.value) return;
    
    this.loadState();
    this.isInitialized.value = true;
  }
  
  /**
   * Load state from storage
   */
  private loadState(): void {
    try {
      // Load active providers
      const providers = localStorage.getItem('integration_providers');
      if (providers) {
        this.activeProviders.value = JSON.parse(providers);
      }
      
      // Load mappings
      const mappings = localStorage.getItem('integration_mappings');
      if (mappings) {
        // Parse mappings and convert date strings to Date objects
        const parsedMappings = JSON.parse(mappings);
        this.mappings.value = parsedMappings.map((m: any) => ({
          ...m,
          lastSynced: new Date(m.lastSynced)
        }));
      }
    } catch (error) {
      console.error('Failed to load integration state:', error);
    }
  }
  
  /**
   * Save state to storage
   */
  private saveState(): void {
    try {
      // Save active providers
      localStorage.setItem(
        'integration_providers',
        JSON.stringify(this.activeProviders.value)
      );
      
      // Save mappings
      localStorage.setItem(
        'integration_mappings',
        JSON.stringify(this.mappings.value)
      );
    } catch (error) {
      console.error('Failed to save integration state:', error);
    }
  }
}

// Create and export a singleton instance
export const integrationService = new IntegrationService();
