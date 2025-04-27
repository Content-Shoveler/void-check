/**
 * Type definitions for custom components
 */

// CyberButton variant types
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

// CyberToggle option type
export interface ToggleOption {
  label: string;
  value: string;
}

// CyberRadio option type
export interface RadioOption {
  label: string;
  value: string;
}

// CyberSelect option type
export interface SelectOption {
  label: string;
  value: string;
}

// Density type
export type InterfaceDensity = 'compact' | 'normal' | 'comfortable';

// WebGL quality type
export type WebGLQuality = 'low' | 'medium' | 'high';

// Task priority type
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// Performance mode type
export type PerformanceMode = 'standard' | 'performance';

// Theme mode type
export type ThemeMode = 'dark' | 'light' | 'system';
