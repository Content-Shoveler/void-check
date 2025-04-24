/**
 * Core types for the Cyberpunk Space Todo application
 */

/**
 * Task model with detailed properties
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  color: string;
  effectType: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  notifications: {
    enabled: boolean;
    reminderTime: number; // minutes before due date
  };
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  notes: string;
  links: string[];
  history: {
    timestamp: Date;
    action: string;
    previousState?: Partial<Task>;
  }[];
}

/**
 * User settings model
 */
export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  defaultTimeScale: number;
  interfaceScale: number;
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
    priority: 'low' | 'medium' | 'high';
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
