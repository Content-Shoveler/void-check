/**
 * Core types for the Cyberpunk Space Todo application
 */

import type { TaskSource, TaskStatus, RecurrencePattern, Reminder, Attendee } from './integration';

// Visual properties for task display
export interface DisplayProperties {
  color: string;
  effectType: string;
  icon?: string;
}

/**
 * Task model with calendar integration support
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  
  // Timing (normalized across calendars)
  startTime?: Date;        // Start time for calendar events
  endTime: Date;           // When the task is due / event ends
  isAllDay: boolean;       // Whether the task/event takes all day
  
  // Status information 
  status: TaskStatus;      // Complex status that handles both task and event states
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Categorization
  tags: string[];
  
  // Integration data
  source: TaskSource;      // Where this task came from
  sourceId?: string;       // ID in the original calendar system
  lastSynced?: Date;       // When last synced with external system
  
  // Recurrence and notifications
  isRecurring: boolean;
  recurringPattern?: RecurrencePattern;
  reminders: Reminder[];
  
  // Special fields for VoidCheck-specific features
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  notes: string;
  links: string[];
  
  // Visual properties
  display: DisplayProperties;
  
  // Provider-specific metadata
  sourceMetadata?: Record<string, any>;
  
  // System fields 
  createdAt: Date;
  updatedAt: Date;
  
  // History tracking (VoidCheck specific)
  history: {
    timestamp: Date;
    action: string;
    previousState?: Partial<Task>;
  }[];
  
  // Location (common in calendar events)
  location?: string;
  
  // Calendar-specific fields
  attendees?: Attendee[];
  
  // Temporary compatibility fields - to be removed in future versions
  // These are included only for compatibility with existing code
  dueDate?: Date;          // Maps to endTime
  completed?: boolean;     // Maps to status.completed
  completedAt?: Date | null; // Maps to status.completedAt
  color?: string;          // Maps to display.color
  effectType?: string;     // Maps to display.effectType
  notifications?: {
    enabled: boolean;
    reminderTime: number;
  };                      // Maps to reminders
}

/**
 * User settings model
 */
import type { 
  ThemeMode, 
  InterfaceDensity, 
  WebGLQuality, 
  TaskPriority 
} from './components';

export interface UserSettings {
  theme: ThemeMode;
  defaultTimeScale: number;
  interfaceScale: number;
  
  // New fields for UI customization
  accentColor?: string;
  interfaceDensity?: InterfaceDensity;
  fontSize?: number;
  
  // Visualization time settings
  visualizationTimeMode?: 'live' | 'custom';
  customNowTime?: string;
  
  // Performance settings
  performanceMode?: boolean;
  webglQuality?: WebGLQuality;
  particleDensity?: number;
  animationIntensity?: number;
  
  // Original nested fields
  visualEffects: {
    particleDensity: number;
    animationIntensity: number;
    backgroundComplexity: number;
    performanceMode: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    defaultLeadTime: number;
  };
  audio: {
    ambientSounds: boolean;
    effectsVolume: number;
  };
  taskDefaults: {
    color: string;
    effectType: string;
    priority: TaskPriority;
  };
}

/**
 * Theme configuration type
 */
export interface CyberTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      main: string;
      card: string;
      input: string;
    };
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    priority: {
      low: string;
      medium: string;
      high: string;
      critical: string;
    };
  };
  effects: {
    glow: string;
    shadow: string;
    glassMorphism: string;
  };
  animation: {
    timing: string;
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
  };
}
