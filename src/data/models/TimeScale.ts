/**
 * Represents different time scale units available in the application
 */
export enum TimeUnit {
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months'
}

/**
 * Represents a time scale option for visualization
 */
export interface TimeScaleOption {
  id: string;
  label: string;
  unit: TimeUnit;
  value: number;
  msValue: number; // Value in milliseconds
}

/**
 * Available time scale options for the application
 * Ranging from 10 seconds to 12 months
 */
export const TIME_SCALE_OPTIONS: TimeScaleOption[] = [
  // Seconds
  { id: '10s', label: '10 seconds', unit: TimeUnit.SECONDS, value: 10, msValue: 10 * 1000 },
  { id: '30s', label: '30 seconds', unit: TimeUnit.SECONDS, value: 30, msValue: 30 * 1000 },
  { id: '60s', label: '1 minute', unit: TimeUnit.SECONDS, value: 60, msValue: 60 * 1000 },
  
  // Minutes
  { id: '5m', label: '5 minutes', unit: TimeUnit.MINUTES, value: 5, msValue: 5 * 60 * 1000 },
  { id: '15m', label: '15 minutes', unit: TimeUnit.MINUTES, value: 15, msValue: 15 * 60 * 1000 },
  { id: '30m', label: '30 minutes', unit: TimeUnit.MINUTES, value: 30, msValue: 30 * 60 * 1000 },
  { id: '60m', label: '1 hour', unit: TimeUnit.MINUTES, value: 60, msValue: 60 * 60 * 1000 },
  
  // Hours
  { id: '3h', label: '3 hours', unit: TimeUnit.HOURS, value: 3, msValue: 3 * 60 * 60 * 1000 },
  { id: '6h', label: '6 hours', unit: TimeUnit.HOURS, value: 6, msValue: 6 * 60 * 60 * 1000 },
  { id: '12h', label: '12 hours', unit: TimeUnit.HOURS, value: 12, msValue: 12 * 60 * 60 * 1000 },
  { id: '24h', label: '1 day', unit: TimeUnit.HOURS, value: 24, msValue: 24 * 60 * 60 * 1000 },
  
  // Days
  { id: '3d', label: '3 days', unit: TimeUnit.DAYS, value: 3, msValue: 3 * 24 * 60 * 60 * 1000 },
  { id: '7d', label: '1 week', unit: TimeUnit.DAYS, value: 7, msValue: 7 * 24 * 60 * 60 * 1000 },
  { id: '14d', label: '2 weeks', unit: TimeUnit.DAYS, value: 14, msValue: 14 * 24 * 60 * 60 * 1000 },
  { id: '30d', label: '1 month', unit: TimeUnit.DAYS, value: 30, msValue: 30 * 24 * 60 * 60 * 1000 },
  
  // Months
  { id: '2m', label: '2 months', unit: TimeUnit.MONTHS, value: 2, msValue: 60 * 24 * 60 * 60 * 1000 },
  { id: '3m', label: '3 months', unit: TimeUnit.MONTHS, value: 3, msValue: 90 * 24 * 60 * 60 * 1000 },
  { id: '6m', label: '6 months', unit: TimeUnit.MONTHS, value: 6, msValue: 180 * 24 * 60 * 60 * 1000 },
  { id: '12m', label: '12 months', unit: TimeUnit.MONTHS, value: 12, msValue: 365 * 24 * 60 * 60 * 1000 }
];

/**
 * Default time scale (24 hours)
 */
export const DEFAULT_TIME_SCALE: TimeScaleOption = TIME_SCALE_OPTIONS.find(
  option => option.id === '24h'
) || TIME_SCALE_OPTIONS[10]; // Fallback to 24h (index 10)

/**
 * Interface for the current time scale state
 */
export interface TimeScaleState {
  currentScale: TimeScaleOption;
  showGridLines: boolean;
  showLabels: boolean;
}

/**
 * Calculate the position on the time scale as a percentage (0-100)
 * 0% = now (center), 100% = maximum time in the future (edge)
 * 
 * @param timeMs - Time in milliseconds
 * @param scaleMs - Current scale in milliseconds
 * @returns Position as a percentage (0-100)
 */
export function calculateTimePosition(timeMs: number, scaleMs: number): number {
  // Ensure timeMs is within bounds
  const boundedTime = Math.max(0, Math.min(timeMs, scaleMs));
  return (boundedTime / scaleMs) * 100;
}

/**
 * Get appropriate time markers for the current scale
 * @param scale Current time scale option
 * @returns Array of marker objects with position and label
 */
export function getTimeMarkers(scale: TimeScaleOption): { position: number; label: string }[] {
  const markers: { position: number; label: string }[] = [];
  const totalMs = scale.msValue;
  
  switch (scale.unit) {
    case TimeUnit.SECONDS:
      // For seconds scale, show markers every second
      for (let i = 0; i <= scale.value; i++) {
        markers.push({
          position: (i / scale.value) * 100,
          label: `${i}s`
        });
      }
      break;
    
    case TimeUnit.MINUTES:
      // For minutes scale, show markers every minute
      for (let i = 0; i <= scale.value; i++) {
        markers.push({
          position: (i / scale.value) * 100,
          label: `${i}m`
        });
      }
      break;
    
    case TimeUnit.HOURS:
      // For hours scale, show markers every hour
      for (let i = 0; i <= scale.value; i++) {
        markers.push({
          position: (i / scale.value) * 100,
          label: `${i}h`
        });
      }
      break;
    
    case TimeUnit.DAYS:
      // For days scale, show markers every day
      for (let i = 0; i <= scale.value; i++) {
        markers.push({
          position: (i / scale.value) * 100,
          label: `${i}d`
        });
      }
      break;
    
    case TimeUnit.MONTHS:
      // For months scale, show markers every month
      for (let i = 0; i <= scale.value; i++) {
        markers.push({
          position: (i / scale.value) * 100,
          label: `${i}m`
        });
      }
      break;
  }
  
  return markers;
}
