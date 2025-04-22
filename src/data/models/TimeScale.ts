/**
 * TimeScale represents the configuration for the visual timeline scale
 * ranging from 10 seconds to 12 months.
 */
export interface TimeScale {
  id: string;
  name: string;
  description: string;
  durationInMs: number;
  minUnit: TimeUnit;
  maxUnit: TimeUnit;
  gridLines: number;
  isDefault: boolean;
}

/**
 * Time unit types for scaling the timeline
 */
export enum TimeUnit {
  Second = 'second',
  Minute = 'minute',
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year'
}

/**
 * Conversion factors for time units to milliseconds
 */
export const TIME_UNIT_TO_MS = {
  [TimeUnit.Second]: 1000,
  [TimeUnit.Minute]: 60 * 1000,
  [TimeUnit.Hour]: 60 * 60 * 1000,
  [TimeUnit.Day]: 24 * 60 * 60 * 1000,
  [TimeUnit.Week]: 7 * 24 * 60 * 60 * 1000,
  [TimeUnit.Month]: 30 * 24 * 60 * 60 * 1000, // Approximation
  [TimeUnit.Year]: 365 * 24 * 60 * 60 * 1000  // Approximation
};

/**
 * Default time scales available in the application
 */
export const DEFAULT_TIME_SCALES: TimeScale[] = [
  {
    id: 'quick',
    name: 'Quick',
    description: '10 seconds to 5 minutes',
    durationInMs: 5 * 60 * 1000, // 5 minutes
    minUnit: TimeUnit.Second,
    maxUnit: TimeUnit.Minute,
    gridLines: 10,
    isDefault: false
  },
  {
    id: 'hour',
    name: 'Hour',
    description: '5 minutes to 1 hour',
    durationInMs: 60 * 60 * 1000, // 1 hour
    minUnit: TimeUnit.Minute,
    maxUnit: TimeUnit.Hour,
    gridLines: 12,
    isDefault: false
  },
  {
    id: 'day',
    name: 'Day',
    description: '1 hour to 1 day',
    durationInMs: 24 * 60 * 60 * 1000, // 1 day
    minUnit: TimeUnit.Hour,
    maxUnit: TimeUnit.Day,
    gridLines: 24,
    isDefault: true
  },
  {
    id: 'week',
    name: 'Week',
    description: '1 day to 1 week',
    durationInMs: 7 * 24 * 60 * 60 * 1000, // 1 week
    minUnit: TimeUnit.Day,
    maxUnit: TimeUnit.Week,
    gridLines: 7,
    isDefault: false
  },
  {
    id: 'month',
    name: 'Month',
    description: '1 week to 1 month',
    durationInMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    minUnit: TimeUnit.Week,
    maxUnit: TimeUnit.Month,
    gridLines: 30,
    isDefault: false
  },
  {
    id: 'quarter',
    name: 'Quarter',
    description: '1 month to 3 months',
    durationInMs: 3 * 30 * 24 * 60 * 60 * 1000, // 3 months
    minUnit: TimeUnit.Week,
    maxUnit: TimeUnit.Month,
    gridLines: 12,
    isDefault: false
  },
  {
    id: 'year',
    name: 'Year',
    description: '3 months to 12 months',
    durationInMs: 365 * 24 * 60 * 60 * 1000, // 1 year
    minUnit: TimeUnit.Month,
    maxUnit: TimeUnit.Year,
    gridLines: 12,
    isDefault: false
  }
];

/**
 * Calculate position on the timeline circle based on due date and current time scale
 * @param dueDate The task due date
 * @param timeScale The current time scale
 * @returns A value between 0 and 1, where 0 is center and 1 is edge
 */
export function calculateTimePosition(dueDate: Date, timeScale: TimeScale): number {
  const now = new Date();
  const timeDiffMs = dueDate.getTime() - now.getTime();
  
  // If the task is in the past, place it at the center
  if (timeDiffMs <= 0) {
    return 0;
  }
  
  // If the task is beyond the time scale, place it at the edge
  if (timeDiffMs >= timeScale.durationInMs) {
    return 1;
  }
  
  // Calculate position between 0 and 1
  return timeDiffMs / timeScale.durationInMs;
}
